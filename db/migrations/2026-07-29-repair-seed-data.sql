-- ============================================================
-- Repair for databases seeded before 2026-07-29.
--
-- The seed files were fixed, but a database that has already been seeded
-- keeps the bad rows. This migration repairs an existing database in place.
-- It is a no-op on a database seeded from the corrected files.
--
-- Three problems:
--
-- 1. SiteContentIndex article rows were hardcoded to ids 1-12 against titles
--    that mostly do not exist. Only ids 1 and 2 matched what seed.sql creates,
--    so the AI assistant cited eight invented articles and reindexArticle
--    deleted the wrong row on every CMS edit.
--
-- 2. Two placeholder users shipped to production: staff.example@utoledo.edu
--    and admin@utoledo.edu. They appear in Admin > Users, are counted in
--    stats, and the admin one broke POST /api/auth/bootstrap by sorting ahead
--    of the real super admin.
--
-- 3. The seeded sample tips were authored and reviewed by those placeholders.
--
-- Idempotent; safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Make sure the real super admin exists before anything is repointed
--    at it. Migration 0003 creates this row too; this is a safety net for
--    databases where the ordering differed.
-- ------------------------------------------------------------
INSERT OR IGNORE INTO Users (email, name, role, status)
VALUES ('utdata@utoledo.edu', 'Super Admin', 'admin', 'invited');

-- ------------------------------------------------------------
-- 2. Repoint content owned by the placeholder accounts.
-- ------------------------------------------------------------
UPDATE Tips
SET author_id = (SELECT id FROM Users WHERE email = 'utdata@utoledo.edu')
WHERE author_id IN (
  SELECT id FROM Users WHERE email IN ('staff.example@utoledo.edu', 'admin@utoledo.edu')
);

UPDATE Tips
SET reviewed_by = (SELECT id FROM Users WHERE email = 'utdata@utoledo.edu')
WHERE reviewed_by IN (
  SELECT id FROM Users WHERE email IN ('staff.example@utoledo.edu', 'admin@utoledo.edu')
);

UPDATE Submissions
SET author_id = (SELECT id FROM Users WHERE email = 'utdata@utoledo.edu')
WHERE author_id IN (
  SELECT id FROM Users WHERE email IN ('staff.example@utoledo.edu', 'admin@utoledo.edu')
);

UPDATE Submissions
SET reviewed_by = NULL
WHERE reviewed_by IN (
  SELECT id FROM Users WHERE email IN ('staff.example@utoledo.edu', 'admin@utoledo.edu')
);

-- ------------------------------------------------------------
-- 3. Remove anything else foreign-keyed to the placeholders, then the
--    accounts themselves. These are seeded rows nobody ever signed in to,
--    so there is no real user data to preserve.
-- ------------------------------------------------------------
DELETE FROM TipFeedback WHERE reporter_id IN (
  SELECT id FROM Users WHERE email IN ('staff.example@utoledo.edu', 'admin@utoledo.edu')
);
DELETE FROM Sessions WHERE user_id IN (
  SELECT id FROM Users WHERE email IN ('staff.example@utoledo.edu', 'admin@utoledo.edu')
);
DELETE FROM PasswordResets WHERE user_id IN (
  SELECT id FROM Users WHERE email IN ('staff.example@utoledo.edu', 'admin@utoledo.edu')
);
DELETE FROM UserTasks WHERE user_id IN (
  SELECT id FROM Users WHERE email IN ('staff.example@utoledo.edu', 'admin@utoledo.edu')
);
UPDATE UserTasks SET assigned_by = NULL WHERE assigned_by IN (
  SELECT id FROM Users WHERE email IN ('staff.example@utoledo.edu', 'admin@utoledo.edu')
);
UPDATE UserTasks SET reviewed_by = NULL WHERE reviewed_by IN (
  SELECT id FROM Users WHERE email IN ('staff.example@utoledo.edu', 'admin@utoledo.edu')
);
UPDATE Tasks SET created_by = NULL WHERE created_by IN (
  SELECT id FROM Users WHERE email IN ('staff.example@utoledo.edu', 'admin@utoledo.edu')
);
DELETE FROM EmailLog WHERE user_id IN (
  SELECT id FROM Users WHERE email IN ('staff.example@utoledo.edu', 'admin@utoledo.edu')
);

DELETE FROM Users WHERE email IN ('staff.example@utoledo.edu', 'admin@utoledo.edu');

-- ------------------------------------------------------------
-- 4. Rebuild the article entries in the AI index from the real Articles
--    table. Shape matches reindexArticle() in
--    worker/src/services/content-index.ts so seeded and CMS-written rows
--    stay identical. Only 'article' rows are touched; contact/system/policy
--    entries are left alone.
-- ------------------------------------------------------------
DELETE FROM SiteContentIndex WHERE source_type = 'article';

INSERT INTO SiteContentIndex (source_type, source_id, source_title, content_text, section_path)
SELECT 'article',
       a.id,
       a.title,
       a.title || char(10) || substr(COALESCE(a.current_content, ''), 1, 8000),
       CASE WHEN c.name IS NULL THEN a.title ELSE c.name || ' > ' || a.title END
FROM Articles a
LEFT JOIN Categories c ON c.id = a.category_id
WHERE a.is_active = 1;

-- ------------------------------------------------------------
-- 5. Point the base URL and sender at the real domain.
--
--    app_base_url is embedded in every invite and password-reset link. A
--    stale value does not just break the links, it delivers live reset
--    tokens to whatever answers at the old host. These use INSERT OR REPLACE
--    deliberately: the whole point is to overwrite the old workers.dev value.
-- ------------------------------------------------------------
INSERT INTO AppConfig (key, value, updated_at)
VALUES ('app_base_url', 'https://utrockets-onboarding.com', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
WHERE AppConfig.value LIKE '%workers.dev%';

INSERT INTO AppConfig (key, value, updated_at)
VALUES ('email_from_address', 'onboarding@mail.utrockets-onboarding.com', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
WHERE AppConfig.value LIKE '%resend.dev%';
