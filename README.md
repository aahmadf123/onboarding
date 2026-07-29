# Toledo Athletics Onboarding Portal

A staff onboarding tool for the University of Toledo Athletics Department. Built on Cloudflare Workers with a React SPA frontend and Cloudflare D1 database.

## Stack
- **Backend:** Cloudflare Workers + Hono
- **Frontend:** React (inline, no build step)
- **Database:** Cloudflare D1 (SQLite)
- **AI Chat:** Cloudflare Workers AI (native)
- **Email:** Resend (invites, reminders, approval notifications)

## Access Model

The portal is **invite-only**. A super admin invites users from **Admin → Users**; each invitee receives a one-time passcode (emailed, and shown once to the admin), signs in with it, and must set their own password. Roles: `staff`, `moderator`, `admin`.

## Getting Started

```bash
cd worker
npm install
cp .dev.vars.example .dev.vars   # fill in RESEND_API_KEY and BOOTSTRAP_TOKEN

# Local database (once)
npx wrangler d1 execute toledo-onboarding-db-prod --local --file=../db/schema.sql
npx wrangler d1 execute toledo-onboarding-db-prod --local --file=../db/schema-v2.sql
npx wrangler d1 execute toledo-onboarding-db-prod --local --file=../db/seed.sql
npx wrangler d1 execute toledo-onboarding-db-prod --local --file=../db/seed-v2.sql
npx wrangler d1 execute toledo-onboarding-db-prod --local --file=../db/migrations/0003_auth_tasks_email.sql
npx wrangler d1 execute toledo-onboarding-db-prod --local --file=../db/seed-v3.sql
# (skip 2026-06-12-submissions-ticket-upgrade.sql on a fresh DB — schema.sql
#  already includes those Submissions columns; it is for older databases only.)
npx wrangler d1 execute toledo-onboarding-db-prod --local --file=../db/migrations/2026-06-14-directory-refresh.sql
npx wrangler d1 execute toledo-onboarding-db-prod --local --file=../db/migrations/2026-06-14-content-expansion.sql
npx wrangler d1 execute toledo-onboarding-db-prod --local --file=../db/migrations/2026-07-29-page-feedback.sql
npx wrangler d1 execute toledo-onboarding-db-prod --local --file=../db/migrations/2026-07-29-repair-seed-data.sql

npx wrangler dev
# Then bootstrap the first admin (passcode is in the response):
# curl -X POST http://localhost:8787/api/auth/bootstrap -H "x-bootstrap-token: <your BOOTSTRAP_TOKEN>"
```

## Tests

```bash
cd worker
npm test            # vitest (@cloudflare/vitest-pool-workers; Resend is mocked)
npx tsc --noEmit    # typecheck
```

## Deployment

```bash
cd worker

# One-time secrets (never committed)
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put BOOTSTRAP_TOKEN     # e.g. openssl rand -hex 32

# Migrate the production DB first (additive; safe for the running worker)
npx wrangler d1 execute toledo-onboarding-db-prod --remote --file=../db/migrations/0003_auth_tasks_email.sql
npx wrangler d1 execute toledo-onboarding-db-prod --remote --file=../db/seed-v3.sql
npx wrangler d1 execute toledo-onboarding-db-prod --remote --file=../db/migrations/2026-06-14-directory-refresh.sql
npx wrangler d1 execute toledo-onboarding-db-prod --remote --file=../db/migrations/2026-06-14-content-expansion.sql
npx wrangler d1 execute toledo-onboarding-db-prod --remote --file=../db/migrations/2026-07-29-page-feedback.sql

# Repairs a database seeded before 2026-07-29. Fixing the seed files does not
# fix rows already written, so this is required on any existing database. It
# removes the two placeholder accounts, repoints the sample content at the real
# super admin, rebuilds the AI index against the articles that actually exist,
# and moves app_base_url off the old workers.dev host. Idempotent, and a no-op
# on a database seeded from the corrected files.
npx wrangler d1 execute toledo-onboarding-db-prod --remote --file=../db/migrations/2026-07-29-repair-seed-data.sql

# Deploy — NOTE: from this moment the site is invite-only; existing users
# must be invited from Admin → Users before they can sign in again.
npx wrangler deploy

# Bootstrap the first super admin (one-time; inert afterwards)
curl -X POST https://<your-worker-url>/api/auth/bootstrap -H "x-bootstrap-token: <BOOTSTRAP_TOKEN>"
# → sign in as utdata@utoledo.edu with the returned passcode → set a password → Admin
```

### Email sending

Emails go through Resend from `mail.utrockets-onboarding.com`.

**Do not assume email reaches anyone at `utoledo.edu`.** Resend reporting a send
as successful only means the receiving mail server returned a 250 accept at SMTP
time. The university runs Microsoft 365, which accepts first and quarantines
afterwards, and mail from a newly registered domain whose name resembles
`utrockets.com` carrying a passcode and a sign-in link matches the profile
anti-phishing filters are built to stop. In testing, invites to `utoledo.edu`
addresses showed as delivered in Resend and never arrived.

The portal is therefore built so nothing critical depends on email:

- Invite passcodes are shown once in the admin UI. Hand them over directly.
- A locked-out user is recovered with **Admin → Users → Re-invite**, which
  issues a fresh passcode on screen.
- Outstanding tasks are shown in the app on sign-in, and an admin-facing digest
  lists who is behind, so the weekly nudge does not depend on delivery.

The durable fix is to send from inside the university tenant (Microsoft Graph
`sendMail` via an app registration on a UToledo mailbox), which skips inbound
filtering entirely. `worker/src/services/email.ts` is structured so that is a
backend swap rather than a rewrite. Failing that, ask UToledo IT to allowlist
the sending domain, and have them run a message trace to confirm what is
happening to the mail.

## Database Setup (fresh environment)

```bash
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/schema.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/schema-v2.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/seed.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/seed-v2.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/migrations/0003_auth_tasks_email.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/seed-v3.sql
# (skip 2026-06-12-submissions-ticket-upgrade.sql on a fresh DB — schema.sql
#  already includes those Submissions columns; it is for older databases only.)
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/migrations/2026-06-14-directory-refresh.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/migrations/2026-06-14-content-expansion.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/migrations/2026-07-29-page-feedback.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/migrations/2026-07-29-repair-seed-data.sql
```

## Maintenance

Day-to-day content changes (articles, contacts, quick links, systems, policies, checklist tasks, users) are made in the **Admin area of the site itself** — see [MAINTENANCE.md](./MAINTENANCE.md). Seed files are for bootstrapping new environments and bulk refreshes only.
