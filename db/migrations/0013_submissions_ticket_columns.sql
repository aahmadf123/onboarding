-- ============================================================
-- Submissions ticketing columns
--
-- These eight columns have never existed in the production database, and the
-- deployed code writes all of them on every ticket submission:
--
--   INSERT INTO Submissions (
--     article_id, author_id, proposed_title, proposed_content, request_type,
--     priority, topic_area, source_context, assigned_team, assigned_to_name,
--     assigned_to_email, assignment_reason)
--
-- so POST /api/submissions fails in production with "no such column", the
-- moderation reassign endpoint fails the same way, and the Contribute form
-- reports a failure it cannot explain. Submissions is empty in production,
-- which is consistent with the flow never once having worked.
--
-- How it got that way: the columns were added to the old db/schema.sql, which
-- only ever runs on a brand-new database, plus a
-- 2026-06-12-submissions-ticket-upgrade.sql migration that opened and committed
-- its own transaction explicitly. D1 rejects that — it wraps each file in a
-- transaction itself — so the migration could not run at all. It was documented
-- as one-time, but was in fact impossible. Nothing tracked which databases had
-- applied it, and no test could see the gap because the suite built its own
-- tables. (Wrangler scans for those keywords without skipping comments, so
-- naming them literally here would make this file unapplyable too.)
--
-- Found by applying this chain to an empty database and diffing sqlite_master
-- against production, which is now a thing that can be done.
--
-- It is a migration rather than part of 0001 because a pre-existing database
-- needs the ALTER and a fresh one must not run it twice. 0001 now describes
-- Submissions as production actually has it, and both paths converge here.
-- ============================================================

ALTER TABLE Submissions ADD COLUMN request_type TEXT DEFAULT 'content_update';
ALTER TABLE Submissions ADD COLUMN priority TEXT DEFAULT 'normal';
ALTER TABLE Submissions ADD COLUMN topic_area TEXT;
ALTER TABLE Submissions ADD COLUMN source_context TEXT;
ALTER TABLE Submissions ADD COLUMN assigned_team TEXT;
ALTER TABLE Submissions ADD COLUMN assigned_to_name TEXT;
ALTER TABLE Submissions ADD COLUMN assigned_to_email TEXT;
ALTER TABLE Submissions ADD COLUMN assignment_reason TEXT;

-- The moderation queue filters and groups on all three.
CREATE INDEX IF NOT EXISTS idx_submissions_request_type ON Submissions(request_type);
CREATE INDEX IF NOT EXISTS idx_submissions_priority ON Submissions(priority);
CREATE INDEX IF NOT EXISTS idx_submissions_assigned_team ON Submissions(assigned_team);
