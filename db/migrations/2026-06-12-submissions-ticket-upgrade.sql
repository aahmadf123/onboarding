-- NOTE (2026-07-29): this file previously wrapped itself in BEGIN TRANSACTION
-- and COMMIT. D1 rejects explicit transaction control, so the migration could
-- not run at all as written — it was documented as one-time but was in fact
-- impossible. The statements are unchanged; only the transaction wrapper is
-- gone.
--
-- It remains applicable ONLY to databases created before schema.sql included
-- these Submissions columns. On a current database every ALTER below will fail
-- with "duplicate column name", which is expected — skip this file.

-- ============================================================
-- Submissions Ticketing Upgrade (one-time migration)
-- Date: 2026-06-12
--
-- Purpose:
--   Upgrade existing databases created from older schema.sql versions
--   by adding ticketing/assignment fields to Submissions without
--   altering existing data.
--
-- Notes:
--   1) Run this ONCE on environments where Submissions does not yet
--      include these columns.
--   2) If a column already exists, SQLite/D1 will error on that ALTER.
--      In that case, remove the already-applied statements and rerun.
-- ============================================================

PRAGMA foreign_keys = ON;
ALTER TABLE Submissions ADD COLUMN request_type TEXT DEFAULT 'content_update';
ALTER TABLE Submissions ADD COLUMN priority TEXT DEFAULT 'normal';
ALTER TABLE Submissions ADD COLUMN topic_area TEXT;
ALTER TABLE Submissions ADD COLUMN source_context TEXT;
ALTER TABLE Submissions ADD COLUMN assigned_team TEXT;
ALTER TABLE Submissions ADD COLUMN assigned_to_name TEXT;
ALTER TABLE Submissions ADD COLUMN assigned_to_email TEXT;
ALTER TABLE Submissions ADD COLUMN assignment_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_submissions_request_type ON Submissions(request_type);
CREATE INDEX IF NOT EXISTS idx_submissions_priority ON Submissions(priority);
CREATE INDEX IF NOT EXISTS idx_submissions_assigned_team ON Submissions(assigned_team);
-- ============================================================
-- Post-migration verification (optional)
-- ============================================================
-- PRAGMA table_info(Submissions);
-- SELECT
--   COUNT(*) AS total_rows,
--   COUNT(request_type) AS rows_with_request_type,
--   COUNT(priority) AS rows_with_priority
-- FROM Submissions;
