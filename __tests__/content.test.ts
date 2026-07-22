import { describe, it, expect } from "vitest";
import {
  getSiteConfig,
  getHomepage,
  getTestimonials,
  getFAQs,
  getEndorsements,
  getColorPresets,
} from "lib/content";

describe("Content", () => {
  it("has site config with required fields", () => {
    const site = getSiteConfig();
    expect(site.name).toBeDefined();
    expect(site.nav.length).toBeGreaterThan(0);
  });

  it("has homepage content", () => {
    const homepage = getHomepage();
    expect(homepage.heroTitle).toBeDefined();
    expect(homepage.aboutContent).toBeDefined();
  });

  it("has testimonials with required fields", () => {
    const testimonials = getTestimonials();
    expect(testimonials.length).toBeGreaterThan(0);
    testimonials.forEach((t) => {
      expect(t.name).toBeDefined();
      expect(t.quote).toBeDefined();
    });
  });

  it("has FAQs with required fields", () => {
    const faqs = getFAQs();
    expect(faqs.length).toBeGreaterThan(0);
    faqs.forEach((faq) => {
      expect(faq.question).toBeDefined();
      expect(faq.answer).toBeDefined();
    });
  });

  it("has endorsements with required fields", () => {
    const endorsements = getEndorsements();
    endorsements.forEach((e) => {
      expect(e.name).toBeDefined();
      expect(e.quote).toBeDefined();
    });
  });

  it("has at least one color preset", () => {
    expect(getColorPresets().length).toBeGreaterThan(0);
  });
});
