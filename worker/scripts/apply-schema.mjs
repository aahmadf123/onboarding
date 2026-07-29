#!/usr/bin/env node
//
// Applies the DDL chain to a database, in the one order that works.
//
// db/schema.sql creates four tables. Every auth, task and email table lives
// only in migration 0003, and Articles.is_active — queried in seven places —
// arrives via its ALTER TABLE. Running the schema files alone therefore gives
// "no such table: Sessions" on the first authenticated request, and the correct
// order existed only as prose in the README.
//
// This is the same list test/helpers.ts loads, so the schema CI runs against
// and the schema this produces cannot drift apart.
//
// Usage:
//   node scripts/apply-schema.mjs --local
//   node scripts/apply-schema.mjs --remote
//
// Seeds are deliberately not applied here; they are content, not structure.

import { execFileSync } from 'node:child_process';

const DB = 'toledo-onboarding-db-prod';

// Order matters: later files ALTER tables the earlier ones create.
const FILES = [
  '../db/schema.sql',
  '../db/schema-v2.sql',
  '../db/migrations/0003_auth_tasks_email.sql',
  '../db/migrations/2026-07-29-page-feedback.sql',
  '../db/migrations/2026-07-29-login-lockout.sql',
  '../db/migrations/2026-07-29-indexes.sql',
];

const target = process.argv.includes('--remote') ? '--remote' : '--local';
if (target === '--remote' && !process.argv.includes('--yes')) {
  console.error('Refusing to touch the remote database without --yes.');
  console.error('Note: 0003 and the login-lockout migration are NOT idempotent —');
  console.error('their bare ALTER TABLE ADD COLUMN statements fail on a second run.');
  console.error('This script is for creating a fresh database, not updating a live one.');
  process.exit(1);
}

for (const file of FILES) {
  console.log(`\n── ${file}`);
  execFileSync('npx', ['wrangler', 'd1', 'execute', DB, target, `--file=${file}`], {
    stdio: 'inherit',
  });
}
console.log('\nSchema applied. Seed content separately if this is a new database.');
