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

## 2. Set up the sending email

The contact form emails the client's inbox when someone submits it. You have two
choices for **how** that email is sent:

**➡️ Recommended: Resend (a transactional email service).** Reliable, free at this
volume, and avoids the consumer-mailbox pitfalls below. Full walkthrough in
**[RESEND.md](./RESEND.md)**. Leads still land in the client's normal inbox
(`CONTACT_EMAIL`); Resend only does the sending.

**Alternative: the client's own mailbox over SMTP.** Works, but consumer
providers fight you — see the ⚠️ pitfalls below. Get SMTP credentials from
whoever hosts the client's business email, then set `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, and `CONTACT_EMAIL` (see `.env.example`).

| Provider | Host | Port | Auth notes |
|---|---|---|---|
| Resend (recommended) | `smtp.resend.com` | 465 | User = `resend`, Pass = API key; verify a sending domain, set `MAIL_FROM` |
| ProtonMail | `smtp.protonmail.ch` | 587 | Paid plan + generated SMTP token; username is **lowercase** |
| Google Workspace / Gmail | `smtp.gmail.com` | 587 | Turn on 2FA, create an **App Password** (not the login password) |
| Fastmail | `smtp.fastmail.com` | 465 | App-specific password |

- `SMTP_USER` = the SMTP login (an address for most providers; the literal `resend` for Resend).
- `MAIL_FROM` = the From address on the message (defaults to `SMTP_USER`; **required** for Resend).
- `CONTACT_EMAIL` = where leads are **delivered** (usually the client's normal inbox).
- Port 465 → SSL, 587 → STARTTLS (the code sets `secure` automatically from the port).

### ⚠️ Consumer-mailbox pitfalls (why Resend is recommended)

If you send through the client's own mailbox, watch for these — all learned the
hard way:

- **Case-sensitive username.** ProtonMail (and others) reject `Jon@…` when the
  address is `jon@…` → `535 authentication failed`.
- **Outbound spam filtering.** ProtonMail runs SpamAssassin on outbound SMTP and
  will block form emails (`550 5.7.0 Blocked by SpamAssassin`) — there's no off
  switch, even on Business plans. The route already sends clean plain-text with
  no external reply-to to minimize this, but visitor content can still trip it.
- **Self-send skips the Inbox.** If `MAIL_FROM` and `CONTACT_EMAIL` are the *same*
  mailbox, the provider treats the notification as mail you sent yourself — it
  lands in "All Mail"/"Sent" with **no Inbox notification**. Make the From
  address different from the destination, or use Resend (mail arrives from your
  verified domain, so it's a genuine inbound message → Inbox + notification).

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
