# Toledo Athletics Onboarding Portal

A staff onboarding tool for the University of Toledo Athletics Department. Built on Cloudflare Workers with a React SPA frontend and Cloudflare D1 database.

## Stack
- **Backend:** Cloudflare Workers + Hono
- **Frontend:** React (inline, no build step)
- **Database:** Cloudflare D1 (SQLite)
- **AI Chat:** Cloudflare Workers AI (native)

## Getting Started

```bash
cd worker
npm install
npx wrangler dev
```

## Deployment

```bash
cd worker
npx wrangler deploy
```

## Database Setup

```bash
# Apply schema
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/schema-v2.sql

# Seed data
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/seed-v2.sql
npx wrangler d1 execute toledo-onboarding-db-prod --file=../db/seed.sql
```

## Maintenance

See [MAINTENANCE.md](./MAINTENANCE.md) for a guide on updating content, staff, links, and policies.

