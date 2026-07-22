# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is a reusable **website template** for a solo practice (therapist, coach,
consultant, etc.). See `TEMPLATE.md` for the per-client setup checklist.

## Commands

- `npm run dev` — Start dev server (Next.js with Turbopack)
- `npm run build` — Production build (Next.js with Turbopack)
- `npm run lint` — ESLint
- `npm run test` — Vitest in watch mode
- `npm run test:run` — Vitest single run
- `npx vitest run __tests__/content.test.ts` — Run a single test file
- `npm run cms` — Start Decap CMS local server
- `python3 scripts/optimize-images.py --all` — Convert all JPG/PNG in `public/images/` to WebP

## Architecture

This is a **Next.js 16 App Router** site built as a single scrolling homepage
(plus a standalone `/privacy` page). It uses Tailwind CSS v4, TypeScript, and a
file-based CMS content system.

### Content System (CMS-driven)

All site content lives in `content/` as JSON and Markdown files — there is no
database. The `lib/content.ts` module reads these files at build/request time
with an in-memory cache. Content types:

- **Single JSON files**: `site.json` (global config/nav), `homepage.json`, `layout.json` (section ordering/visibility), `contact.json` (contact section safety notice), `privacy.json`, `banner.json`
- **Collection directories**: `testimonials/`, `faqs/` (Markdown), `endorsements/`, `color-presets/` — each item is a separate file, sorted by `order` field

Markdown content fields are parsed through `marked` with a custom
`preserveLineBreaks` helper that converts 3+ consecutive newlines into `<br>` tags.

### Homepage Layout System

The homepage (`app/page.tsx`) renders sections dynamically based on
`content/layout.json`. Each section can be enabled/disabled and reordered.
Section IDs: `hero`, `quote`, `about`, `testimonials`, `endorsements`, `faq`,
`contact`. Section components live in `components/sections/`. Nav links in
`site.json` point to in-page anchors (e.g. `/#about`) rather than separate
routes; `next.config.ts` redirects the old standalone `/about`, `/contact`,
`/faqs`, `/services` routes to their homepage anchors (or `/`) for old inbound
links.

### Path Aliases

Configured in both `tsconfig.json` and `vitest.config.ts`:
- `components/*` → `./components/*`
- `content/*` → `./content/*`
- `lib/*` via baseUrl resolution

Import components as `components/Header`, not `../components/Header`.

### Theming

- Dark theme is default; light theme toggled via `localStorage` key `theme`
- Color presets defined in `content/color-presets/` and selected via `site.json`'s `activeColorPreset` field
- CSS variables `--primary`, `--secondary`, `--accent` are injected in the root layout

### CMS Authentication

Decap CMS (`public/admin/config.yml`) uses the GitHub backend against the repo
configured there (`backend.repo` — set this per client). `app/api/auth/route.ts`
and `app/api/auth/callback/route.ts` implement the GitHub OAuth handshake
(`OAUTH_GITHUB_CLIENT_ID`, `OAUTH_GITHUB_CLIENT_SECRET`) required for the hosted
CMS at `/admin` to write commits back to the repo. `npm run cms` instead runs
`decap-server` for local editing without OAuth.

### Image Pipeline

`scripts/optimize-images.py` runs as a pre-commit hook: it converts staged
JPG/PNG files in `public/images/` to WebP (max 1600px, quality 82), rewrites
references in `content/` (`.json`/`.md`), and restages the results. Run manually
with `--all` to convert every image in the folder, not just staged ones.

### API Routes

- `app/api/contact/` — Contact form submission via nodemailer, with in-memory rate limiting (5/hour per IP) and a minimum-fill-time bot check
- `app/api/auth/` — CMS OAuth (see above)

### Environment Variables

See `.env.example` for the full annotated list. Summary:

- `SITE_URL` — Base URL for metadata/SEO and `sitemap.ts`/`robots.ts` (defaults to `https://example.com`)
- `SMTP_USER`, `SMTP_PASS` — nodemailer transport credentials for the contact form
- `CONTACT_EMAIL` — Destination address for contact form submissions
- `OAUTH_GITHUB_CLIENT_ID`, `OAUTH_GITHUB_CLIENT_SECRET` — GitHub OAuth app for Decap CMS auth
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` — optional analytics/ads; tags render only when set
