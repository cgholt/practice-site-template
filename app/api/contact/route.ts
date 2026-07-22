import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Rate limiting store (per-instance, resets on cold start)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // Max requests per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const MIN_SUBMISSION_TIME = 3000; // Minimum 3 seconds to fill form (bot detection)

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Sanitize string input - ensures value is a string and removes control characters
function sanitizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  // Remove control characters except newlines and tabs
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

// Valid US state codes
const VALID_STATES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
]);

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

const transporter = nodemailer.createTransport({
  host: "smtp.protonmail.ch",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Rate limiting
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json();

  // Honeypot check - if _website field is filled, it's a bot
  if (body._website) {
    // Silently accept to not tip off bots, but don't send email
    return NextResponse.json({ ok: true });
  }

  // Timestamp check - form filled too fast is likely a bot
  if (body._timestamp) {
    const submissionTime = Date.now() - Number(body._timestamp);
    if (submissionTime < MIN_SUBMISSION_TIME) {
      // Silently accept to not tip off bots
      return NextResponse.json({ ok: true });
    }
  }

  // Sanitize and validate all inputs as strings
  const firstName = sanitizeString(body.firstName);
  const lastName = sanitizeString(body.lastName);
  const email = sanitizeString(body.email);
  const phone = sanitizeString(body.phone);
  const state = sanitizeString(body.state);
  const priorInfo = sanitizeString(body.priorInfo);
  const referralSource = sanitizeString(body.referralSource);

  // Basic validation - required fields
  if (!firstName || !lastName || !email || !state) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Validate field lengths to prevent abuse
  if (
    firstName.length > 100 ||
    lastName.length > 100 ||
    email.length > 200 ||
    (phone && phone.length > 30) ||
    (priorInfo && priorInfo.length > 10000) ||
    (referralSource && referralSource.length > 500)
  ) {
    return NextResponse.json({ error: "Field too long" }, { status: 400 });
  }

  // Validate state is a real US state code
  if (!VALID_STATES.has(state.toUpperCase())) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  // Basic email format validation (also prevents header injection via newlines)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.includes("\n") || email.includes("\r")) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  // Validate phone format if provided (digits, spaces, dashes, parentheses, plus only)
  if (phone && !/^[\d\s\-().+]+$/.test(phone)) {
    return NextResponse.json({ error: "Invalid phone format" }, { status: 400 });
  }

  const toEmail = process.env.CONTACT_EMAIL;
  if (!toEmail) {
    console.error("CONTACT_EMAIL environment variable not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // Escape HTML to prevent injection in email clients
  const safeFirstName = escapeHtml(firstName);
  const safeLastName = escapeHtml(lastName);
  const safeEmail = escapeHtml(email);
  const safePhone = phone ? escapeHtml(phone) : "";
  const safeState = escapeHtml(state);
  const safePriorInfo = priorInfo ? escapeHtml(priorInfo) : "";
  const safeReferralSource = referralSource ? escapeHtml(referralSource) : "";

  const fullName = `${safeFirstName} ${safeLastName}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: toEmail,
      replyTo: email,
      subject: `New contact from ${fullName}`,
      text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nState: ${state}\n\nPrior Info:\n${priorInfo || "N/A"}\n\nReferral Source: ${referralSource || "N/A"}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ""}
        <p><strong>State:</strong> ${safeState}</p>
        ${safePriorInfo ? `<h3>Prior Info:</h3><p>${safePriorInfo.replace(/\n/g, "<br>")}</p>` : ""}
        ${safeReferralSource ? `<p><strong>How they heard about you:</strong> ${safeReferralSource}</p>` : ""}
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
