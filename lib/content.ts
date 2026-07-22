import fs from "fs";
import path from "path";
import { marked } from "marked";
import matter from "gray-matter";
import sanitizeHtml from "sanitize-html";

const contentDir = path.join(process.cwd(), "content");

// Convert 3+ consecutive newlines into paragraph breaks + <br> so
// extra blank lines added in the CMS actually produce visible spacing.
function preserveLineBreaks(text: string): string {
  return text.replace(/\n{3,}/g, (match) => {
    const extra = match.length - 2;
    return "\n\n" + "<br>\n\n".repeat(extra);
  });
}

// Parse markdown and sanitize the resulting HTML to prevent XSS
function safeMarkdown(text: string): string {
  const html = marked.parse(preserveLineBreaks(text), { async: false, breaks: true }) as string;
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "br", "details", "summary"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height"],
      a: ["href", "title", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

// Validate that a string is a valid hex color, returns fallback if not
export function validHexColor(value: string | undefined, fallback: string): string {
  if (value && /^#[0-9a-f]{3,8}$/i.test(value)) return value;
  return fallback;
}

// Simple cache to avoid re-reading files during build/request
const cache = new Map<string, unknown>();

function cached<T>(key: string, loader: () => T): T {
  if (cache.has(key)) {
    return cache.get(key) as T;
  }
  const result = loader();
  cache.set(key, result);
  return result;
}

// Types
export type Homepage = {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaHref: string;
  heroImage: string | null;
  heroImageCredit?: string;
  heroImagePosition?: string;
  aboutTitle: string;
  aboutContent: string;
  aboutImage: string | null;
  aboutImageCredit?: string;
  testimonialsTitle: string;
  faqsTitle: string;
  quoteText?: string;
  quoteAuthor?: string;
  quoteHighlight?: string;
};

export type Testimonial = {
  name: string;
  quote: string;
  order: number;
};

export type FAQ = {
  question: string;
  answer: string;
  order: number;
};

export type Endorsement = {
  name: string;
  credentials: string;
  quote: string;
  order: number;
};

export type ColorPreset = {
  name: string;
  slug: string;
  primary: string;
  secondary: string;
  accent: string;
  surface?: string;
  deep?: string;
};

export type SiteConfig = {
  name: string;
  tagline?: string;
  email?: string;
  phone?: string;
  nav: { label: string; href: string; enabled?: boolean }[];
  backgroundImage?: string | null;
  backgroundImageCredit?: string;
  backgroundOverlay?: number;
  activeColorPreset?: string;
};

export type Section = {
  id: string;
  label: string;
  enabled: boolean;
};

export type Layout = {
  sections: Section[];
};

export type PrivacyPolicy = {
  title: string;
  lastUpdated: string;
  content: string;
};

export type ContactContent = {
  safetyNoticeTitle: string;
  safetyNoticeContent: string;
};

export type Banner = {
  enabled: boolean;
  text: string;
  linkText: string;
  linkHref: string;
  backgroundColor?: string;
  textColor?: string;
};

// Loaders
export function getHomepage(): Homepage {
  return cached("homepage", () => {
    const filePath = path.join(contentDir, "homepage.json");
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return {
      ...content,
      aboutContent: safeMarkdown(content.aboutContent),
    };
  });
}

export function getSiteConfig(): SiteConfig {
  return cached("siteConfig", () => {
    const filePath = path.join(contentDir, "site.json");
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  });
}

export function getLayout(): Layout {
  return cached("layout", () => {
    const filePath = path.join(contentDir, "layout.json");
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  });
}

export function getTestimonials(): Testimonial[] {
  return cached("testimonials", () => {
    const dir = path.join(contentDir, "testimonials");
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") || f.endsWith(".md"));

    return files
      .map((file) => {
        const filePath = path.join(dir, file);
        if (file.endsWith(".md")) {
          const { data } = matter(fs.readFileSync(filePath, "utf-8"));
          return {
            name: data.name,
            quote: data.quote,
            order: data.order ?? 0,
          };
        }
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      })
      .sort((a, b) => a.order - b.order);
  });
}

export function getFAQs(): FAQ[] {
  return cached("faqs", () => {
    const dir = path.join(contentDir, "faqs");
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

    return files
      .map((file) => {
        const raw = fs.readFileSync(path.join(dir, file), "utf-8");
        const { data } = matter(raw);
        return {
          ...data,
          answer: safeMarkdown(data.answer),
        } as FAQ;
      })
      .sort((a, b) => a.order - b.order);
  });
}

export function getEndorsements(): Endorsement[] {
  return cached("endorsements", () => {
    const dir = path.join(contentDir, "endorsements");
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") || f.endsWith(".md"));

    return files
      .map((file) => {
        const filePath = path.join(dir, file);
        if (file.endsWith(".md")) {
          const { data } = matter(fs.readFileSync(filePath, "utf-8"));
          return {
            name: data.name,
            credentials: data.credentials,
            quote: data.quote,
            order: data.order ?? 0,
          };
        }
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      })
      .sort((a, b) => a.order - b.order);
  });
}

export function getColorPresets(): ColorPreset[] {
  return cached("colorPresets", () => {
    const dir = path.join(contentDir, "color-presets");
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") || f.endsWith(".md"));

    return files.map((file) => {
      const filePath = path.join(dir, file);
      const slug = file.replace(/\.(json|md)$/, "");
      if (file.endsWith(".md")) {
        const { data } = matter(fs.readFileSync(filePath, "utf-8"));
        return {
          name: data.name,
          primary: data.primary,
          secondary: data.secondary,
          accent: data.accent,
          surface: data.surface,
          deep: data.deep,
          slug,
        };
      }
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return {
        ...content,
        slug,
      };
    });
  });
}

export function getActiveColorPreset(): ColorPreset | null {
  const siteConfig = getSiteConfig();
  const presets = getColorPresets();
  const activeSlug = siteConfig.activeColorPreset || "default";
  return presets.find((p) => p.slug === activeSlug) || presets[0] || null;
}

export function getPrivacyPolicy(): PrivacyPolicy {
  return cached("privacy", () => {
    const filePath = path.join(contentDir, "privacy.json");
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return {
      ...content,
      content: safeMarkdown(content.content),
    };
  });
}

export function getContactContent(): ContactContent {
  return cached("contact", () => {
    const filePath = path.join(contentDir, "contact.json");
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  });
}

export function getBanner(): Banner {
  return cached("banner", () => {
    const filePath = path.join(contentDir, "banner.json");
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  });
}
