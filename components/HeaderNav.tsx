"use client";

import { useState } from "react";
import Link from "next/link";
import type { SiteConfig } from "lib/content";

export default function HeaderNav({
  siteConfig,
}: {
  siteConfig: SiteConfig;
}) {
  const [open, setOpen] = useState(false);
  const links = siteConfig.nav.filter((link) => link.enabled !== false);

  const renderLinks = (onNavigate?: () => void) =>
    links.map((link) => (
      <li key={link.href}>
        <Link
          href={link.href}
          onClick={onNavigate}
          className="nav-link text-sm md:text-base font-medium text-tertiary hover:text-accent transition"
        >
          {link.label}
        </Link>
      </li>
    ));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="text-left">
          <Link
            href="/"
            className="text-xl font-semibold text-primary-foreground font-[family-name:var(--font-playfair)]"
          >
            {siteConfig.name}
          </Link>
          {(siteConfig.email || siteConfig.phone) && (
            <div className="flex gap-3 mt-1 text-xs text-tertiary">
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
        </div>

        <ul className="hidden md:flex items-center gap-6">{renderLinks()}</ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 text-tertiary hover:text-accent transition"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <ul className="flex flex-col items-center gap-4 mt-4 md:hidden">
          {renderLinks(() => setOpen(false))}
        </ul>
      )}
    </div>
  );
}
