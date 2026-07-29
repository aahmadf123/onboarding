# Toledo Athletics Onboarding Portal

A staff onboarding tool for the University of Toledo Athletics Department. Built on Cloudflare Workers with a React SPA frontend and Cloudflare D1 database.

## Stack
- **Backend:** Cloudflare Workers + Hono
- **Frontend:** React + TypeScript, built with Vite (`worker/client`)
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

# Local database — structure and seeded content, in one command
npm run db:migrate

npx wrangler dev
# Then issue the super admin's passcode (it is in the response). This targets
# utdata@utoledo.edu specifically, and only while that account has no password:
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
npm run db:status:remote     # what is pending
npm run db:migrate:remote    # apply it

# Deploy — NOTE: from this moment the site is invite-only; existing users
# must be invited from Admin → Users before they can sign in again.
npx wrangler deploy

# Issue the super admin's passcode (one-time; inert once that account has a
# password). It targets utdata@utoledo.edu only — every other admin is invited
# normally from Admin → Users.
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

## Database

`db/migrations` is the whole story of the database, numbered in the order it is
applied. Wrangler records each applied file in a `d1_migrations` table, so a
migration runs exactly once per database and the same two commands work whether
the target is empty or years old:

```bash
cd worker
npm run db:status            # what is pending (add :remote for production)
npm run db:migrate           # apply it     (add :remote for production)
```

The chain covers structure and the seeded baseline content both, so
`npm run db:migrate` against an empty database produces a working portal in one
step. This replaces a fifteen-line sequence that existed only as prose here,
and which nothing verified — `db/schema.sql` created four of the twenty-three
tables, so following the first line alone gave "no such table: Sessions" on the
first authenticated request.

Rules that keep it working:

- **Add, never edit.** Once a migration has been applied anywhere, its file is
  history. Change the schema with a new numbered file.
- **Never run a migration by hand.** `wrangler d1 execute --file=` bypasses the
  tracking, which is how production ended up in the state the backfill below
  describes. `0002_seed_core_content.sql` in particular deletes and re-inserts
  every article, which renumbers ids that `SiteContentIndex` still points at.
- **No explicit transaction control.** D1 wraps each file in a transaction
  itself and rejects files that open their own. Wrangler's check scans the raw
  text, so the keywords cannot appear in comments either.
- **Content changes go in Admin → Content,** not into a migration. See
  [MAINTENANCE.md](./MAINTENANCE.md).

The test suite loads these same files rather than declaring tables of its own,
so the schema CI validates cannot drift from the schema that ships. New
migrations are picked up automatically.

### Backfilling a database migrated by hand

Production predates the tracking: it has every table the chain creates but no
`d1_migrations`, so a first `db:migrate:remote` would treat all twelve
historical migrations as pending and re-run them against live data.
`db/backfill-d1-migrations.sql` records them as applied without executing them.
Run it once, before the first migrate:

```bash
npx wrangler d1 execute toledo-onboarding-db-prod --remote \
  --file=../db/backfill-d1-migrations.sql
```

It guards on markers from the existing schema, so on a fresh database it writes
nothing and the migrations themselves run normally.

## Maintenance

Day-to-day content changes (articles, contacts, quick links, systems, policies, checklist tasks, users) are made in the **Admin area of the site itself** — see [MAINTENANCE.md](./MAINTENANCE.md). Seed files are for bootstrapping new environments and bulk refreshes only.
