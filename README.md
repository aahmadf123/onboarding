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
npx wrangler d1 execute toledo-onboarding-db-prod --remote \
  --command "UPDATE AppConfig SET value='https://<your-worker-url>' WHERE key='app_base_url'"

# Deploy — NOTE: from this moment the site is invite-only; existing users
# must be invited from Admin → Users before they can sign in again.
npx wrangler deploy

# Bootstrap the first super admin (one-time; inert afterwards)
curl -X POST https://<your-worker-url>/api/auth/bootstrap -H "x-bootstrap-token: <BOOTSTRAP_TOKEN>"
# → sign in as utdata@utoledo.edu with the returned passcode → set a password → Admin
```

### Email sending

Emails are sent through Resend. The from-address defaults to the `onboarding@resend.dev` sandbox, which **only delivers to the Resend account owner's inbox** — fine for testing; invite passcodes are also shown in the admin UI so onboarding works regardless. For real delivery, verify a domain in the Resend dashboard and change the from-address in **Admin → Settings** (no redeploy needed).

## Database Setup (fresh environment)

```bash
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/schema.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/schema-v2.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/seed.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/seed-v2.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/migrations/0003_auth_tasks_email.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/seed-v3.sql
```

## Maintenance

Day-to-day content changes (articles, contacts, quick links, systems, policies, checklist tasks, users) are made in the **Admin area of the site itself** — see [MAINTENANCE.md](./MAINTENANCE.md). Seed files are for bootstrapping new environments and bulk refreshes only.
