import Link from "next/link";
import { getSiteConfig } from "lib/content";
import PsychologyTodayBadge from "./PsychologyTodayBadge";

export default function Footer() {
  const siteConfig = getSiteConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t-2 border-secondary">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Crisis Disclaimer + Badges Row */}
        <div className="mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 rounded-none border border-accent/30 bg-tertiary p-4">
            <p className="text-sm text-primary">
              <strong className="text-accent">Important:</strong> This website is not intended for crisis situations.
              If you are experiencing a mental health emergency, please call{" "}
              <a href="tel:988" className="text-accent underline">988</a> (Suicide &amp; Crisis Lifeline),
              call <a href="tel:911" className="text-accent underline">911</a>, or go to your nearest emergency room.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <PsychologyTodayBadge />
          </div>
        </div>

        {/* Contact Info */}
        {(siteConfig.email || siteConfig.phone) && (
          <div className="mb-8 flex flex-col sm:flex-row justify-center gap-4 text-sm text-tertiary">
            {siteConfig.email && (
              <a href={`mailto:${siteConfig.email}`} className="hover:text-accent transition">
                {siteConfig.email}
              </a>
            )}
            {siteConfig.phone && (
              <a href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`} className="hover:text-accent transition">
                {siteConfig.phone}
              </a>
            )}
          </div>
        )}

        {/* Footer Links and Copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-tertiary">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
