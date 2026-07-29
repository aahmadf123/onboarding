# Toledo Athletics Onboarding Site — Maintenance Guide

## Overview
This site is a Cloudflare Worker (TypeScript + Hono) with a React SPA frontend, backed by a Cloudflare D1 SQLite database. It is deployed via Wrangler. Email (invites, weekly reminders, approval notifications) goes through Resend.

## Tech Stack
- **Runtime:** Cloudflare Workers
- **Framework:** Hono (API routing)
- **Frontend:** React (no build step — compiled inline in `worker/src/frontend.ts` and `worker/src/frontend/`)
- **Database:** Cloudflare D1 (SQLite)
- **Email:** Resend (`RESEND_API_KEY` secret; from-address configurable in Admin → Settings)
- **Deployment:** `npx wrangler deploy` from the `worker/` directory

## ⭐ The Admin CMS is the primary way to update content

Sign in as an admin and open **🔒 Admin** in the header. Changes go live immediately — no redeploy, no reseeding.

| What you want to change | Where |
|---|---|
| Invite a user / resend a passcode / change role / disable | Admin → **Users** |
| Add or edit checklist tasks, mark a task "requires sign-off" | Admin → **Tasks** |
| Assign an extra task to specific people (emails them) | Admin → **Tasks** → Assign |
| Approve/send back completed sign-off tasks; moderate submissions & tips | Admin → **Approvals** |
| Articles, categories, key contacts, quick links, systems, policies | Admin → **Content** |
| Fill in a placeholder contact (e.g. "Athletics IT — JJ" phone number) | Admin → **Content** → Contacts |
| See who still has outstanding onboarding tasks | Admin → **Who Is Behind** |
| Read issues staff reported with "Report an Issue" | Admin → **Reported Issues** |
| Check whether emails were accepted by the recipient's server | Admin → **Email Log** |
| Change the email from-address/name, base URL, weekly reminder on/off | Admin → **Settings** |

### Embedding a map in an article
In any article's markdown, put a line:

```
::map https://www.google.com/maps?q=Thompson+Student+Union,+Toledo,+OH&output=embed
```

Only `https://www.google.com/maps…` / `maps.google.com` URLs render (anything else is dropped). The Content editor has an "Insert map embed" helper.

## User accounts & passwords

- The site is **invite-only**: admins create accounts in Admin → Users. The invitee gets a one-time passcode (emailed via Resend AND shown once to the admin), signs in with it, and must set their own password (min 10 characters).
- **Forgot password:** users click "Forgot password?" on the sign-in screen for an emailed 60-minute reset link. Because that email frequently does not arrive (see Email below), **Re-invite** in Admin → Users is the reliable recovery path: it issues a fresh passcode on screen and signs the user out everywhere.
- **First admin on a fresh deployment:** `POST /api/auth/bootstrap` with the `x-bootstrap-token: <BOOTSTRAP_TOKEN>` header issues the seeded admin's passcode. It stops working once every admin has credentials.

## Email

> **Email does not reliably reach `utoledo.edu` mailboxes.** Resend accepts the
> message and reports success, because the university's mail server returns a
> 250 accept at SMTP time. Microsoft 365 then quarantines it. Mail from a newly
> registered domain resembling `utrockets.com`, carrying a passcode and a
> sign-in link, is exactly what anti-phishing filters are built to stop. In
> testing, invites to `utoledo.edu` addresses showed as delivered in Resend and
> never arrived.
>
> **Nothing in the portal depends on email landing.** Use these instead:
> - Invite passcodes are shown once in the admin UI. Read them out directly.
> - Locked-out users are recovered with **Admin → Users → Re-invite**.
> - **Admin → Who Is Behind** lists everyone with outstanding tasks, and users
>   see their own outstanding count in-app on every page.

- Secrets: `npx wrangler secret put RESEND_API_KEY` and `npx wrangler secret put BOOTSTRAP_TOKEN` (local dev uses `worker/.dev.vars`, see `.dev.vars.example`).
- Weekly reminders run Mondays 13:00 UTC, roughly 9am in Toledo (cron in `worker/wrangler.jsonc`). They email each **active** user their outstanding required/assigned tasks, then send every admin a digest of who is behind. Toggle in Admin → Settings. A retried cron will not re-send to anyone already emailed in the last six days.
- Every send is recorded in Admin → Email Log. **"Accepted" there means the receiving server took the message, not that anyone read it.**

### Sending from inside the university tenant

The durable fix is Microsoft Graph: send as a real UToledo mailbox, so the mail
originates inside the tenant and skips inbound filtering. It needs an app
registration with the application permission `Mail.Send` (admin consented), and
no DNS control. Set these and it takes over from Resend automatically:

```bash
npx wrangler secret put MS_TENANT_ID
npx wrangler secret put MS_CLIENT_ID
npx wrangler secret put MS_CLIENT_SECRET
npx wrangler secret put MS_SENDER_ADDRESS   # e.g. athletics-onboarding@utoledo.edu
```

Failing that, ask UToledo IT to allowlist the sending domain, and to run a
message trace on a Resend message id so you can see whether mail is being
quarantined, junked, or dropped by a transport rule.

## Database files (bootstrap / bulk changes only)

Apply order for a fresh database:
1. `db/schema.sql` → 2. `db/schema-v2.sql` → 3. `db/seed.sql` → 4. `db/seed-v2.sql` → 5. `db/migrations/0003_auth_tasks_email.sql` → 6. `db/seed-v3.sql` → 7. `db/migrations/2026-06-14-directory-refresh.sql` → 8. `db/migrations/2026-06-14-content-expansion.sql` → 9. `db/migrations/2026-07-29-page-feedback.sql`

> **Do not run `db/migrations/2026-06-12-submissions-ticket-upgrade.sql` on a fresh database** — `schema.sql` already creates the `Submissions` ticketing columns, so this migration errors with "duplicate column". It exists only to upgrade older databases created before those columns were added to `schema.sql`.

```bash
npx wrangler d1 execute toledo-onboarding-db-prod --remote --file=../db/<file>
```

- `db/migrations/0003_auth_tasks_email.sql` — auth columns, Sessions, Tasks (the 16 baseline checklist tasks), UserTasks, EmailLog, AppConfig defaults. Additive and idempotent.
- `db/seed-v3.sql` — the June 2026 researched content refresh (Vector LMS, Rocket Card offices + maps, JobTrax verification, verified benefits/retirement/parking, CBAs, IT contacts incl. the "Athletics IT — JJ" placeholder). Idempotent; safe to re-run.
- `db/migrations/2026-06-14-directory-refresh.sql` — leadership/org-chart correction from the current staff directory: **Tom Moreland** is now VP & Director of Athletics (replaced Bryan Blair), Nicole Harris disabled (no longer in the directory), **Lauren Best-Hovermale** added (Assoc AD Compliance), **Kim Nigem** added (Faculty Athletic Rep), and a **Title IX** key contact (Michelle McDevitt). Also refreshes the Executive Leadership article and AI index. Idempotent. NOTE: several per-person emails are set by the `firstname.lastname@utoledo.edu` convention and should be verified in Admin → Content.
- `db/migrations/2026-06-14-content-expansion.sql` — eight new researched articles (Travel & Expense Reimbursement, Title IX reporting, Emergency & Campus Safety, IT Security Essentials, Payroll details, Key Dates & Academic Calendar, Athletic Scholarships overview, Role-Based Compliance & Recruiting Calendar) plus AI-index entries. Idempotent. Calendar dates and the travel mileage rate change over time — verify against the linked official pages periodically.

⚠️ Re-running `seed.sql`/`seed-v2.sql` on a live database will overwrite content that admins have since edited in the CMS (and `seed-v2.sql` deletes/reinserts several tables). Prefer the CMS for anything incremental.

## Staff / Org Chart
- File: `db/seed-v2.sql`, table `OrgChart` (no admin UI — the org chart page was removed; data is still used by AI chat context).

## Onboarding checklist tasks
- Live in the `Tasks` table (managed in Admin → Tasks). Per-user progress is in `UserTasks` — it survives content edits.
- Task slugs for the original 16 tasks match the old localStorage ids; each user's legacy browser progress is imported automatically on their first sign-in.

## Common Maintenance Tasks

### A link is broken
Admin → Content → find it under Quick Links / Systems / Policies / Articles → Edit → Save.

### A staff member has left
Admin → Users → Disable (signs them out immediately). Their contact entry, if any, is under Admin → Content → Contacts.

### A new hire is starting
Admin → Users → Invite User (passcode appears once — share it if email is still in sandbox mode). Then optionally Admin → Tasks → Assign for any extra, person-specific tasks.

### An article is out of date
Admin → Content → Articles → Edit (live markdown preview included). The AI chat index updates automatically on save.

## Security

- **Markdown is sanitized.** All article/AI markdown is run through DOMPurify (`sanitizeHtml` in `worker/src/frontend/shared.ts`) before rendering, so admin- or AI-authored content can't inject scripts. The `::map` Google-Maps iframe is the only embed allowed (enforced by a DOMPurify hook).
- **Content-Security-Policy + security headers** are set for every response in `worker/src/app.ts` (`hono/secure-headers`). Frames are limited to Google Maps; `object-src`/`base-uri`/`frame-ancestors` are locked down. CDN hosts (cdnjs, cdn.tailwindcss.com, cdn.jsdelivr.net) are allow‑listed because the SPA has no build step yet.
- **CORS** is restricted to the worker's own origin (same-origin SPA).
- **Rate limiting** is global when a `RATE_LIMIT` KV namespace is bound (see `worker/wrangler.jsonc`); without it, limiting falls back to a per-isolate in-memory window. To enable globally: `npx wrangler kv namespace create RATE_LIMIT`, then uncomment the `kv_namespaces` block and paste the id.

## Notes
- The AI chat widget uses Cloudflare Workers AI (native binding — no API key required). Its knowledge comes from `SiteContentIndex`, which is refreshed automatically when articles are edited in the CMS.
- MailChannels was removed (its free Workers API shut down in Aug 2024); all email is Resend now.
- There is no YouTube integration and no AI Hub / AI Assessment feature (both removed earlier).
- Cloudflare D1 + Resend are the only external data dependencies.
- Tests: `cd worker && npm test` (53 tests; Resend is mocked — tests never send real email).
