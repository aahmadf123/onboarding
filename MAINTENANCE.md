# Toledo Athletics Onboarding Site — Maintenance Guide

## Overview
This site is a Cloudflare Worker (TypeScript + Hono) with a React SPA frontend, backed by a Cloudflare D1 SQLite database. It is deployed via Wrangler.

## Tech Stack
- **Runtime:** Cloudflare Workers
- **Framework:** Hono (API routing)
- **Frontend:** React (no build step — compiled inline in `worker/src/frontend.ts` and `worker/src/frontend/`)
- **Database:** Cloudflare D1 (SQLite)
- **Deployment:** `npx wrangler deploy` from the `worker/` directory

## Deployment
1. Install dependencies: `cd worker && npm install`
2. Deploy: `npx wrangler deploy`
3. To apply DB schema changes: `npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/schema-v2.sql`
4. To reseed data: `npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/seed-v2.sql`

## Where to Update Content

### Staff / Org Chart
- File: `db/seed-v2.sql`
- Table: `OrgChart`
- Find the INSERT row for the person and update `name`, `title`, `email`, or `phone` as needed.
- To hide someone without deleting them, set `is_active = 0`.
- After editing, reseed the database (see Deployment above).

### Key Contacts
- File: `db/seed-v2.sql`
- Table: `KeyContacts`

### Policies
- File: `db/seed-v2.sql`
- Table: `PolicyResources`
- Update the `url` column if a policy PDF link changes.

### Quick Links
- File: `db/seed-v2.sql`
- Table: `QuickLinks`
- Update the `url` column for any broken links.

### Systems Directory
- File: `db/seed-v2.sql`
- Table: `SystemsDirectory`

### Articles (long-form content)
- File: `db/seed.sql`
- Table: `Articles`
- Find the article by its `title` field and update the `current_content` text.

### NIL / University Information
NIL platform info is stored in Articles within `db/seed.sql`. Search for "NIL" in that file to locate relevant articles.

### University President / Leadership
Search `db/seed-v2.sql` and `db/seed.sql` for the president's name to find and update references.

## Common Maintenance Tasks

### A link is broken
1. Open `db/seed-v2.sql`
2. Search for the old URL
3. Replace with the new URL
4. Reseed the database

### A staff member has left or changed roles
1. Open `db/seed-v2.sql`
2. Find their row in the `OrgChart` INSERT block
3. Either update their title/email, or set `is_active` to `0` to hide them from the org chart
4. Reseed the database

### A new staff member needs to be added
1. Open `db/seed-v2.sql`
2. Add a new `INSERT INTO OrgChart` row with the correct `parent_id` (matching their supervisor's `id`)
3. Reseed the database

### An article needs updating
1. Open `db/seed.sql`
2. Find the article by title
3. Update the `current_content` text
4. Reseed the database

## Notes
- The AI chat widget uses Cloudflare Workers AI (native binding — no API key required).
- There is no YouTube integration (it was removed).
- There is no AI Hub / AI Assessment feature (it was removed).
- Cloudflare D1 is the only external data dependency.
