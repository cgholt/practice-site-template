"use client";
import { useState, useRef, useEffect } from "react";
import type { ContactContent } from "lib/content";

type ContactFormProps = {
  contactContent: ContactContent;
};

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

export default function ContactForm({ contactContent }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [acknowledged, setAcknowledged] = useState(false);
  const loadTimeRef = useRef(0);
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTimeRef.current = Date.now();
    // Hide honeypot via JS (bots often don't execute JS, so they'll fill it)
    if (honeypotRef.current) {
      honeypotRef.current.className = "absolute -left-[9999px] h-0 opacity-0 overflow-hidden";
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!acknowledged) {
      return;
    }

    setStatus("loading");

    const fd = new FormData(e.currentTarget);
    const body = {
      ...Object.fromEntries(fd.entries()),
      _timestamp: loadTimeRef.current,
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setStatus("ok");
      const w = window as Window & { gtag_report_conversion?: () => void };
      if (typeof w.gtag_report_conversion === "function") {
        w.gtag_report_conversion();
      }
    } else {
      setStatus("err");
    }
  }

  const inputClass = "w-full rounded-none border border-border bg-secondary px-4 py-3 text-secondary-foreground placeholder:text-slate-800 invalid:text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="firstName"
          placeholder="First name *"
          className={inputClass}
          required
        />
        <input
          name="lastName"
          placeholder="Last name *"
          className={inputClass}
          required
        />
      </div>
      <input
        name="email"
        type="email"
        placeholder="Email *"
        className={inputClass}
        required
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="phone"
          type="tel"
          placeholder="Phone number"
          className={inputClass}
        />
        <select
          name="state"
          className={inputClass}
          required
          defaultValue=""
        >
          <option value="" disabled>What state do you live in? *</option>
          {US_STATES.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>
      <textarea
        name="priorInfo"
        placeholder="Is there anything you'd like to share with me prior to our conversation?"
        rows={4}
        className={inputClass}
      />
      <input
        name="referralSource"
        placeholder="How did you hear about me?"
        className={inputClass}
      />

      {/* Safety notice with acknowledgment */}
      <div className="rounded-none border border-border bg-secondary/50 p-4">
        <h3 className="text-sm font-semibold text-primary-foreground">
          {contactContent.safetyNoticeTitle}
        </h3>
        <p className="mt-2 text-sm text-tertiary">
          {contactContent.safetyNoticeContent}
        </p>
        <label className="mt-4 flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border bg-secondary accent-accent cursor-pointer"
          />
          <span className="text-sm text-secondary-foreground">
            I acknowledge that I have read and understand this notice *
          </span>
        </label>
      </div>

      {/* Honeypot field - hidden via JS, bots will fill this */}
      <input
        ref={honeypotRef}
        name="_website"
        type="text"
        autoComplete="off"
        aria-hidden="true"
        tabIndex={-1}
      />

      <button
        type="submit"
        disabled={status === "loading" || !acknowledged}
        className="rounded-none bg-accent px-6 py-3 text-accent-foreground font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Sending..." : "Send"}
      </button>
      {status === "ok" && (
        <p className="text-green-400">Thanks—I&apos;ll be in touch soon.</p>
      )}
      {status === "err" && (
        <p className="text-red-400">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
