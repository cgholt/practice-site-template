# Per-client deployment guide

Standing up a new client site end to end. Budget ~30–45 minutes the first few
times. Do the content work from `TEMPLATE.md` in parallel — this guide covers
the infrastructure: repo, email, CMS auth, hosting, and domain.

> **One-time setup:** a Vercel account (use **Pro**, one flat seat, if these are
> paid client sites — the free Hobby tier is non-commercial only) and this
> template marked as a GitHub template repo.

---

## 1. Create the client's repo

- On GitHub: **Use this template → Create a new repository** (e.g. `smith-therapy`).
- Keep it **private**.
- Clone it locally, then `npm install` and `cp .env.example .env.local`.

## 2. Set up the sending email (SMTP)

The contact form emails the client's inbox using **their** email provider — this
is per client, not always ProtonMail. Get SMTP credentials from whoever hosts
the client's business email, then set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASS`, and `CONTACT_EMAIL` (see `.env.example`).

| Provider | Host | Port | Auth notes |
|---|---|---|---|
| ProtonMail | `smtp.protonmail.ch` | 587 | Requires a paid Mail plan + generated SMTP token |
| Google Workspace / Gmail | `smtp.gmail.com` | 587 | Turn on 2FA, create an **App Password** (not the login password) |
| Fastmail | `smtp.fastmail.com` | 465 | App-specific password |
| Resend (recommended if the client has no mail host) | `smtp.resend.com` | 465 | User = `resend`, Pass = API key; verify a sending domain |

- `SMTP_USER` = the address that **sends** the notification.
- `CONTACT_EMAIL` = where leads are **delivered** (usually the client's normal inbox).
- Port 465 → SSL, 587 → STARTTLS (the code sets `secure` automatically from the port).

Test locally: `npm run dev`, submit the contact form, confirm the email lands.

## 3. Create a GitHub OAuth app (for the `/admin` CMS editor)

The client edits content at `yourdomain.com/admin`, which commits back to their
repo via GitHub OAuth. One OAuth app per site.

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. **Homepage URL:** `https://<client-domain>`
3. **Authorization callback URL:** `https://<client-domain>/api/auth/callback`
4. Copy the **Client ID**, generate a **Client secret**.
5. These become `OAUTH_GITHUB_CLIENT_ID` / `OAUTH_GITHUB_CLIENT_SECRET`.

Then edit `public/admin/config.yml`:
- `backend.repo` → `your-github-username/<repo>`
- `backend.base_url` → `https://<client-domain>`

> For local content editing without OAuth, run `npm run cms` (Decap local server).

## 4. Deploy on Vercel

1. Vercel → **Add New → Project → Import** the client's Git repo.
2. Framework preset auto-detects **Next.js** — leave defaults.
3. **Environment Variables:** add every var from `.env.example` (see the table
   below). Apply to **Production** (and Preview if you want).
4. **Deploy.**

| Variable | Notes |
|---|---|
| `SITE_URL` | Final public URL (set after the domain is attached, then redeploy) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | From step 2 |
| `CONTACT_EMAIL` | Client's inbox |
| `OAUTH_GITHUB_CLIENT_ID` / `OAUTH_GITHUB_CLIENT_SECRET` | From step 3 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional GA4 ID (`G-…`) |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Optional Ads tag (`AW-…`) |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Optional Ads conversion label |

> **⚠️ `NEXT_PUBLIC_*` and `SITE_URL` are read at *build* time.** After adding or
> changing them, trigger a **redeploy** — editing them in Vercel does nothing
> until the next build.

## 5. Attach the custom domain

Have the **client buy and own their domain** (~$12/yr) — you just point it.

1. Vercel → Project → **Settings → Domains → Add** the domain.
2. At the client's registrar, add the DNS records Vercel shows (usually an `A`
   record for the apex and a `CNAME` for `www`).
3. Once it verifies and SSL is issued, set `SITE_URL=https://<domain>` and
   **redeploy**.
4. Update `public/admin/config.yml` `base_url` to the final domain if it changed,
   and the GitHub OAuth app's Homepage/Callback URLs to match.

## 6. Go-live checklist

- [ ] Homepage, `/privacy`, and all enabled sections render correctly
- [ ] Contact form submits and the email arrives at `CONTACT_EMAIL`
- [ ] `/admin` loads, GitHub login works, a test edit commits and redeploys
- [ ] All placeholder content/images replaced (see `TEMPLATE.md`)
- [ ] `SITE_URL` correct → check `/sitemap.xml` and `/robots.txt`
- [ ] Analytics firing (GA **Realtime**) if the client uses it
- [ ] Favicon / social share image set; `npm run build` passes clean

---

### Reusing one OAuth app across sites (optional shortcut)

You *can* register a single GitHub OAuth app and reuse its Client ID/Secret for
every client, but the callback URL is fixed per app — so each site would need
its own anyway unless you run a shared auth service. Simplest at low volume:
one OAuth app per site. Revisit a shared auth broker only at ~10+ clients.
