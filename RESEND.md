# Sending contact-form email with Resend

**Use this instead of a consumer mailbox (ProtonMail, Gmail) for the contact
form.** Transactional providers like [Resend](https://resend.com) are built to
relay app-generated mail — they don't run outbound spam filtering on it, so form
submissions won't get silently blocked the way ProtonMail's SpamAssassin does
(`550 5.7.0 Blocked by SpamAssassin`). Free tier: 3,000 emails/month, 100/day —
far more than a practice contact form needs.

The visitor's message is emailed **to** the client's normal inbox
(`CONTACT_EMAIL`) — Resend only handles the *sending*. The client keeps reading
mail wherever they already do.

---

## 1. Create a Resend account and add the domain

1. Sign up at **resend.com** (free).
2. **Domains → Add Domain** → enter the site's domain (e.g. `clientdomain.com`).
3. Resend shows a set of **DNS records** (an SPF `TXT`, DKIM records, and usually
   a `MX`/return-path). Add them at wherever the domain's DNS is managed
   (registrar, Cloudflare, Vercel DNS…).
4. Wait for the status to go **Verified** (minutes to a couple hours). Verifying
   the domain is what lets mail land in the inbox instead of spam — it sets up
   SPF and DKIM for you.

> No domain yet? You can test immediately with Resend's sandbox sender
> `onboarding@resend.dev`, but it can only deliver to your own verified address.
> Verify a real domain before go-live.

## 2. Create an API key

**API Keys → Create API Key** → give it a name, **Sending access** is enough.
Copy the key (starts with `re_`) — shown once.

## 3. Set the environment variables

In `.env.local` locally and in Vercel (**Production** scope), set:

| Variable | Value |
|---|---|
| `SMTP_HOST` | `smtp.resend.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `resend` (the literal word — this is Resend's SMTP username) |
| `SMTP_PASS` | your API key (`re_…`) |
| `MAIL_FROM` | an address **on the verified domain**, e.g. `contact@clientdomain.com` |
| `CONTACT_EMAIL` | where leads are delivered, e.g. the client's normal inbox |

Why `MAIL_FROM` matters: the route sends `from: MAIL_FROM || SMTP_USER`. With
Resend, `SMTP_USER` is `"resend"`, which isn't a valid From address — so you
**must** set `MAIL_FROM` to a real address on your verified domain, or the send
is rejected.

> `MAIL_FROM` doesn't have to be a real mailbox — `contact@` or `noreply@` on the
> verified domain works even if nobody reads it. Replies go to whoever the client
> emails back manually (the visitor's address is in the message body).

## 4. Deploy and test

- **Redeploy** after setting the vars (runtime env changes need a new build).
- Submit the contact form with all required fields (first name, last name,
  email, state) and wait 3+ seconds before submitting (bot check).
- Confirm the email lands in `CONTACT_EMAIL`.
- Check the Resend dashboard's **Logs** — you'll see each send, with delivery
  status and any bounce/error, which is far better visibility than SMTP alone.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `535` / auth failed | `SMTP_USER` must be exactly `resend`; `SMTP_PASS` must be the `re_…` API key |
| "from address not allowed" / 403 | `MAIL_FROM` isn't on a **verified** domain — verify the domain, or fix the address |
| Sends succeed but nothing arrives | Check Resend **Logs** for a bounce; confirm `CONTACT_EMAIL` is correct and not filtering it |
| Domain stuck "not verified" | DNS records missing/typo'd, or not propagated yet — recheck them at your DNS host |

## Migrating an existing site off ProtonMail

Only env vars change — no code change (the route already reads `SMTP_HOST`/
`SMTP_PORT`/`MAIL_FROM`). Update the six variables above in Vercel, redeploy,
send a test. If it works, you can revoke the old ProtonMail SMTP token.
