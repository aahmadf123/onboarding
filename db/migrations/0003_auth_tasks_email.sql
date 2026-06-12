-- ============================================================
-- Migration 0003 — Invite-only auth, DB-backed tasks, email log
-- Additive only; safe to run on a live database that already has
-- schema.sql + schema-v2.sql applied.
--
-- Apply:
--   npx wrangler d1 execute toledo-onboarding-db-prod --remote --file=../db/migrations/0003_auth_tasks_email.sql
--
-- D1 constraints honored: ALTER TABLE is ADD COLUMN only with
-- constant defaults; UNIQUE added via separate index; no explicit
-- transactions. Statements are ordered so a partial run is harmless
-- (tables/columns first, data seeds last).
-- ============================================================

-- ============ Users: auth columns ============
-- Existing rows pick up status='invited', which is intentional:
-- everyone must be (re-)invited under the new invite-only login.
ALTER TABLE Users ADD COLUMN name TEXT;
ALTER TABLE Users ADD COLUMN password_hash TEXT;
ALTER TABLE Users ADD COLUMN status TEXT DEFAULT 'invited';
ALTER TABLE Users ADD COLUMN must_reset INTEGER DEFAULT 0;
ALTER TABLE Users ADD COLUMN passcode_expires_at DATETIME;
ALTER TABLE Users ADD COLUMN invited_at DATETIME;
ALTER TABLE Users ADD COLUMN password_set_at DATETIME;
ALTER TABLE Users ADD COLUMN last_login_at DATETIME;
ALTER TABLE Users ADD COLUMN localstorage_migrated_at DATETIME;

-- CMS soft-delete for articles
ALTER TABLE Articles ADD COLUMN is_active INTEGER DEFAULT 1;

-- ============ Sessions ============
CREATE TABLE IF NOT EXISTS Sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,            -- SHA-256 hex of the bearer token
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    last_used_at DATETIME,
    user_agent TEXT,
    ip TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token ON Sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON Sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON Sessions(expires_at);

-- ============ Password reset tokens ============
CREATE TABLE IF NOT EXISTS PasswordResets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,            -- SHA-256 hex; raw token only in the email
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pwresets_token ON PasswordResets(token_hash);
CREATE INDEX IF NOT EXISTS idx_pwresets_user ON PasswordResets(user_id);

-- ============ Tasks (checklist definitions) ============
CREATE TABLE IF NOT EXISTS Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,                  -- stable id; equals legacy localStorage ids for baseline tasks
    phase TEXT NOT NULL,                 -- 'first-day' | 'first-week' | 'first-month' | 'first-90-days'
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'recommended', -- 'required' | 'recommended' | 'optional'
    display_order INTEGER DEFAULT 0,
    requires_approval INTEGER DEFAULT 0, -- 1 = completion needs admin sign-off
    audience TEXT DEFAULT 'all',         -- 'all' | 'assigned'
    link_view TEXT,                      -- SPA view for "Explore full details"
    link_param TEXT,
    is_active INTEGER DEFAULT 1,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Users(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_slug ON Tasks(slug);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON Tasks(phase, display_order);

-- ============ UserTasks (per-user progress; a row with assigned_by set is an assignment) ============
CREATE TABLE IF NOT EXISTS UserTasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    task_id INTEGER NOT NULL,
    status TEXT DEFAULT 'open',          -- 'open' | 'done' | 'pending_approval' | 'approved' | 'rejected'
    completed_at DATETIME,
    assigned_by INTEGER,
    assigned_at DATETIME,
    reviewed_by INTEGER,
    review_notes TEXT,
    reviewed_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (task_id) REFERENCES Tasks(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usertasks_user_task ON UserTasks(user_id, task_id);
CREATE INDEX IF NOT EXISTS idx_usertasks_status ON UserTasks(status);

-- ============ EmailLog ============
CREATE TABLE IF NOT EXISTS EmailLog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    to_email TEXT NOT NULL,
    email_type TEXT NOT NULL,            -- 'invite' | 'password_reset' | 'task_assigned' | 'weekly_reminder' | 'approval_decision' | 'test'
    subject TEXT,
    status TEXT DEFAULT 'sent',          -- 'sent' | 'error'
    provider_id TEXT,                    -- Resend message id
    error_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_emaillog_user ON EmailLog(user_id);
CREATE INDEX IF NOT EXISTS idx_emaillog_type ON EmailLog(email_type, created_at);

-- ============ App config defaults ============
-- Swapping to a verified Resend domain later is a Settings change only.
INSERT OR IGNORE INTO AppConfig (key, value) VALUES ('email_from_address', 'onboarding@resend.dev');
INSERT OR IGNORE INTO AppConfig (key, value) VALUES ('email_from_name', 'Toledo Athletics Onboarding');
INSERT OR IGNORE INTO AppConfig (key, value) VALUES ('weekly_reminder_enabled', '1');
INSERT OR IGNORE INTO AppConfig (key, value) VALUES ('app_base_url', 'https://onboarding.utdata.workers.dev');

-- ============ Bootstrap super admin ============
-- Seeded without a password; the first passcode is issued via
-- POST /api/auth/bootstrap (guarded by the BOOTSTRAP_TOKEN secret).
INSERT OR IGNORE INTO Users (email, name, role) VALUES ('utdata@utoledo.edu', 'Super Admin', 'admin');
UPDATE Users SET role = 'admin', status = COALESCE(status, 'invited') WHERE email = 'utdata@utoledo.edu';

-- ============ Baseline checklist tasks ============
-- Slugs MUST equal the legacy localStorage ids so client-side progress
-- migrates. Copy matches the previously hardcoded frontend checklist,
-- except 'compliance-training' which is updated to Vector LMS (slug kept
-- so migrated progress carries over). All baseline tasks ship with
-- requires_approval=0 so the localStorage migration can never flood the
-- approvals queue; admins can flip approval per task in the CMS.

-- First Day
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('rocket-id', 'first-day', 'Get Your Rocket ID & UTAD Account', 'Visit the Rocket Card Office to obtain your campus ID. Your UTAD account is also activated here — you need it for email, Wi-Fi, and all digital resources. Follow the activation link sent to your personal email.', 'required', 1, 'all', 'category', '6');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('mfa', 'first-day', 'Set Up Multi-Factor Authentication (MFA)', 'Install Microsoft Authenticator on your phone and register it with your UTAD account. This is required for secure login to university systems.', 'required', 2, 'all', 'category', '6');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('myut', 'first-day', 'Activate MyUT Portal Access', 'Log into myut.utoledo.edu to verify your account works. This is your primary gateway to employee self-service — payroll, benefits, and HR tools all live here.', 'required', 3, 'all', 'category', '6');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('meet-team', 'first-day', 'Meet Your Team & Supervisor', 'Your supervisor will introduce you to your immediate team and provide an overview of daily operations and your first-week schedule.', 'recommended', 4, 'all', 'category', '1');

-- First Week
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('parking', 'first-week', 'Set Up Parking via vPermit', 'Apply for your parking permit through ParkUToledo. Lots near Savage Arena fill fast before 9am. Consider a daily C permit until your A permit arrives. A Permit: $329/year, C Permit: $6.20/day.', 'required', 1, 'all', 'category', '7');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('direct-deposit', 'first-week', 'Set Up Direct Deposit & Taxes', 'In MyUT, go to Employee Self-Service to configure direct deposit into your bank account and verify your tax withholding (W-4).', 'required', 2, 'all', 'category', '5');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('facilities-tour', 'first-week', 'Tour Athletic Facilities', 'Get oriented with all athletic facilities including Savage Arena, Glass Bowl, the Crissey Athletic Complex, and Scott Park. Knowing your way around is essential.', 'recommended', 3, 'all', 'category', '1');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('systems-training', 'first-week', 'Complete Systems Setup', 'Set up Microsoft 365 (Outlook, Teams, OneDrive) via Office.com with your UTAD credentials. If applicable to your role, get access to Teamworks — the athletics department operating platform.', 'required', 4, 'all', 'category', '6');

-- First Month
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('benefits', 'first-month', 'Complete Benefits Enrollment', 'You have 30 days from your start date to elect or waive benefits in MyUT. Silence is NOT a waiver — you must actively make selections for health, dental, vision, and life insurance.', 'required', 1, 'all', 'category', '5');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('compliance-training', 'first-month', 'Complete Required Compliance Training (Vector LMS)', 'Complete your assigned compliance training in Vector LMS within 30 days of your start date. Access it via the MyUT portal — Employee tab, under Training and Career Development — or directly at utoledo-oh.vectorlmsedu.com (UTAD login). All employees take "Building Supportive Communities: Clery Act and Title IX"; Health Science Campus and clinical staff also complete HIPAA and Medicare Fraud, Waste & Abuse. Each course takes about an hour. NCAA compliance-specific courses are assigned separately by the department.', 'required', 2, 'all', 'category', '5');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('dept-workflows', 'first-month', 'Learn Department Workflows', 'Understand the standard processes for your role: communication channels, approval workflows, reporting structures, and how Athletics interfaces with the broader university.', 'recommended', 3, 'all', 'category', '1');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('key-contacts', 'first-month', 'Connect with Key Contacts', 'Build relationships with people you''ll work with regularly. Use the Key Contacts page for reference. Introduce yourself, especially to compliance, facilities, and communications staff.', 'recommended', 4, 'all', 'contacts', NULL);

-- First 90 Days
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('compliance-policies', 'first-90-days', 'Review All Compliance Policies', 'Read through Standards of Conduct (3364-25-01), FERPA, Information Security policies, and NCAA compliance rules specific to your role. When in doubt, always contact Compliance first.', 'required', 1, 'all', 'category', '2');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('learning-plan', 'first-90-days', 'Build Your Personal Learning Plan', 'Use the Video Learning resources to find relevant training and create a personal development plan aligned with your goals and role.', 'recommended', 2, 'all', NULL, NULL);
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('supervisor-checkin', 'first-90-days', 'Formal Supervisor Check-In', 'Schedule a check-in with your supervisor to review your onboarding experience, ask open questions, set 90-day goals, and confirm you''re on track.', 'recommended', 3, 'all', NULL, NULL);
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('toledo-explore', 'first-90-days', 'Explore Toledo Neighborhoods & Resources', 'Get comfortable with the city. Staff commonly live in areas like Ottawa Hills, Sylvania Township, Perrysburg, and Maumee. Toledo has affordable housing and a growing food/arts scene.', 'optional', 4, 'all', 'category', '9');
