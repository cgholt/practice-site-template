# New client setup

This repo is a sanitized starter for a solo-practice website. Everything a
visitor sees is placeholder copy — there are no client photos and no third-party
tracking. Follow the checklist below to stand up a new site.

## Quick start

1. Create the client's repo from this template (**Use this template** on GitHub).
2. `npm install`
3. `cp .env.example .env.local` and fill it in (see `.env.example`).
4. `npm run dev` and open http://localhost:3000
5. Work through the checklist below, then deploy.

## 1. Environment variables

Set these in `.env.local` and in your host (Vercel/Netlify/etc.). Full annotated
list is in `.env.example`:

- `SITE_URL` — the deployed URL (used for SEO, sitemap, robots, schema).
- `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL` — contact-form email delivery.
- `OAUTH_GITHUB_CLIENT_ID` / `_SECRET` — only for the hosted `/admin` CMS editor.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`,
  `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` — optional; leave blank to disable.

## 2. Content (`content/`)

All placeholder — replace via the CMS at `/admin` or by editing files directly.

| File / folder | What to set |
| --- | --- |
| `site.json` | practice name, tagline, email, phone, nav labels, `activeColorPreset` |
| `homepage.json` | hero title/subtitle/CTA, quote (+ `quoteHighlight` word), about title & body |
| `contact.json` | safety-notice title/content |
| `banner.json` | promo banner text/link (or `enabled: false`) |
| `privacy.json` | privacy policy body |
| `testimonials/` | replace the `client-one/two/three` placeholders |
| `endorsements/` | replace the `colleague-one/two` placeholders (or disable the section) |
| `faqs/` | rewrite the placeholder Q&As |
| `color-presets/` | keep the palettes you want offered; point `site.json` at one |
| `layout.json` | reorder / enable / disable homepage sections |

## 3. Images (`public/images/`)

The starter ships with **no photos** — only `decorations/underline-living.png`
(the brush-stroke underline used by the quote highlight). Hero and About render
text-only until you add images:

1. Drop the client's images in `public/images/` (or upload via the CMS).
2. Set `heroImage` / `aboutImage` in `homepage.json` (optionally `backgroundImage`
   in `site.json`).
3. Run `npm run optimize-images` to convert JPG/PNG → WebP.

## 4. Decap CMS (`public/admin/config.yml`)

Edit the `backend` block:

- `repo` — the client's GitHub repo (currently `your-github-username/your-repo`).
- `base_url` — the deployed site URL (currently `https://your-domain.example`).

Create a GitHub OAuth app for the site (callback `https://<SITE_URL>/api/auth/callback`)
and set `OAUTH_GITHUB_*`. For local editing without OAuth, run `npm run cms`.

## 5. Third-party badges (`components/`)

`MentayaBadge.tsx` and `PsychologyTodayBadge.tsx` are optional integrations left
in place. Check where they're mounted (`Footer.tsx` / `Contact.tsx`) and either
update the profile links or remove the components if the client doesn't use them.

## 6. Redirects & metadata

- `next.config.ts` — the `/about`, `/faqs`, `/contact`, `/services` → anchor
  redirects are generic; keep unless the client uses different URLs.
- Metadata, `sitemap.ts`, `robots.ts`, and the JSON-LD schema all derive from
  `site.json` + `SITE_URL` — no code changes needed.

## Verify before launch

```bash
npm run lint
npm run test:run
npm run build
```
