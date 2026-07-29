-- ============================================================
-- One-off backfill: tell wrangler what this database has already run.
--
-- Production was migrated by hand, file by file, before the chain was
-- tracked. It therefore has every table and column the migrations create but
-- no `d1_migrations` table, so the first `wrangler d1 migrations apply` would
-- treat all twelve migrations as unapplied and re-run them against live data.
-- That would re-run the seeds — renumbering every article and orphaning the AI
-- index — and abort on 0004 and 0010, whose bare ALTER TABLE ADD COLUMN
-- statements fail with "duplicate column name".
--
-- This file records those twelve as applied without executing them, which is
-- the state wrangler would have been in had it managed the database all along.
--
-- Run ONCE per pre-existing database, before the first migrations apply:
--   cd worker
--   npx wrangler d1 execute toledo-onboarding-db-prod --remote \
--     --file=../db/backfill-d1-migrations.sql
--
-- It is NOT in db/migrations, because it must not run on a fresh database:
-- there, the migrations themselves are what should run. The EXISTS guards
-- below enforce that anyway — on an empty database they match nothing and the
-- insert writes zero rows.
--
-- The table definition matches the one wrangler creates (verified against
-- wrangler 4.115's getCreateMigrationsTableQuery), so this is indistinguishable
-- from wrangler having created it.
--
-- Safe to re-run: INSERT OR IGNORE against the UNIQUE name column.
--
-- 0013 is deliberately absent. It is the only migration that has not been
-- applied by hand, so it stays unapplied here and lands the ordinary way.
-- ============================================================

CREATE TABLE IF NOT EXISTS d1_migrations(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- A VALUES row source rather than twelve SELECTs chained with UNION ALL: D1
-- caps the number of terms in a compound SELECT and rejects that form outright.
INSERT OR IGNORE INTO d1_migrations (name)
SELECT column1 FROM (VALUES
    ('0001_initial_schema.sql'),
    ('0002_seed_core_content.sql'),
    ('0003_seed_reference_data.sql'),
    ('0004_auth_tasks_email.sql'),
    ('0005_content_refresh.sql'),
    ('0006_directory_refresh.sql'),
    ('0007_content_expansion.sql'),
    ('0008_page_feedback.sql'),
    ('0009_repair_seed_data.sql'),
    ('0010_login_lockout.sql'),
    ('0011_indexes.sql'),
    ('0012_content_placeholders.sql')
)
-- Three markers, one from each end of the chain, proving this really is a
-- database that has been through it: Sessions arrives in 0004, Users.locked_until
-- in 0010, idx_users_email_nocase in 0011. A database missing any of them is not
-- one this backfill describes, so nothing is written.
WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'Sessions')
  AND EXISTS (SELECT 1 FROM pragma_table_info('Users') WHERE name = 'locked_until')
  AND EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = 'idx_users_email_nocase');
