-- Indexes for the scans that run on every request or every cron tick.
--
-- Safe to re-run: every statement is IF NOT EXISTS.

-- The case-insensitive email index.
--
-- Users.email is UNIQUE with binary collation, but every lookup in the codebase
-- uses `WHERE email = ? COLLATE NOCASE`. A binary index cannot serve a NOCASE
-- comparison, so those queries scanned the table — and, worse, the constraint
-- did not actually prevent both A@x.com and a@x.com from being stored, which
-- would give one person two accounts and make "which one is disabled?"
-- ambiguous. This index both serves the query and closes that gap.
--
-- Verified against production before writing this: no case-variant duplicates
-- exist, so creating it as UNIQUE will not fail on live data.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_nocase ON Users(email COLLATE NOCASE);

-- Scanned on every cron run to find who is behind, and by the admin list.
CREATE INDEX IF NOT EXISTS idx_users_status ON Users(status);

-- ORDER BY columns on the list endpoints.
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON Submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_last_updated ON Articles(last_updated DESC);

-- Submissions are almost always filtered by status first. (An equivalent index
-- on Tips.approved_at and Tips.status went with the table, retired in 0014.)
CREATE INDEX IF NOT EXISTS idx_submissions_status ON Submissions(status);

-- UserTasks is joined per user on every checklist load and every reminder.
CREATE INDEX IF NOT EXISTS idx_usertasks_user ON UserTasks(user_id);
CREATE INDEX IF NOT EXISTS idx_usertasks_task ON UserTasks(task_id);

-- The AI context builder filters this by type before its LIKE scans.
CREATE INDEX IF NOT EXISTS idx_contentindex_source ON SiteContentIndex(source_type, source_id);

-- Session lookup happens on every authenticated request.
CREATE INDEX IF NOT EXISTS idx_sessions_user ON Sessions(user_id);
