-- Per-account login throttling.
--
-- rateLimit(10) on /api/auth/login keys on IP alone. That is the wrong axis in
-- both directions: an attacker with a pool of addresses gets unlimited attempts
-- against one account, while the whole department behind a single campus NAT
-- shares one bucket of ten per minute and locks each other out.
--
-- Nothing in the schema counted failed attempts, so there was no way to bound
-- them per account. These two columns are that counter.

ALTER TABLE Users ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE Users ADD COLUMN locked_until DATETIME;

-- Scanned on every login for a locked account, and by the cleanup cron.
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON Users(locked_until);
