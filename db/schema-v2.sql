-- ============================================================
-- Toledo Athletics Onboarding Platform — Schema V3
-- Expanded from Schema V2 to support richer onboarding content
-- and structured operational reference data.
-- Run AFTER the original schema.sql
-- ============================================================

PRAGMA foreign_keys = ON;

-- ============================================================
-- ISSUE #1: Employee Tips & Advice (Moderated)
-- ============================================================

CREATE TABLE IF NOT EXISTS Tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    category_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT,
    status TEXT DEFAULT 'pending',
    reviewed_by INTEGER,
    review_notes TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES Users(id),
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (reviewed_by) REFERENCES Users(id)
);

CREATE INDEX IF NOT EXISTS idx_tips_status ON Tips(status);
CREATE INDEX IF NOT EXISTS idx_tips_category ON Tips(category_id);
CREATE INDEX IF NOT EXISTS idx_tips_tags ON Tips(tags);

CREATE TABLE IF NOT EXISTS TipFeedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tip_id INTEGER NOT NULL,
    reporter_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tip_id) REFERENCES Tips(id),
    FOREIGN KEY (reporter_id) REFERENCES Users(id)
);

CREATE INDEX IF NOT EXISTS idx_tipfeedback_tip ON TipFeedback(tip_id);
CREATE INDEX IF NOT EXISTS idx_tipfeedback_status ON TipFeedback(status);

-- ============================================================
-- ISSUE #3: Organizational Chart
-- ============================================================

CREATE TABLE IF NOT EXISTS OrgChart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    department TEXT,
    email TEXT,
    phone TEXT,
    parent_id INTEGER,
    display_order INTEGER DEFAULT 0,
    photo_url TEXT,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (parent_id) REFERENCES OrgChart(id)
);

CREATE INDEX IF NOT EXISTS idx_orgchart_parent ON OrgChart(parent_id);
CREATE INDEX IF NOT EXISTS idx_orgchart_department ON OrgChart(department);

-- ============================================================
-- ISSUE #4: Site-Wide AI Chat — Content Index
-- ============================================================

CREATE TABLE IF NOT EXISTS SiteContentIndex (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL,
    source_id INTEGER,
    source_title TEXT NOT NULL,
    content_text TEXT NOT NULL,
    section_path TEXT,
    last_indexed DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contentindex_source ON SiteContentIndex(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_contentindex_section ON SiteContentIndex(section_path);

-- ============================================================
-- ISSUE #5: AI Literacy Assessment Hub
-- ============================================================

CREATE TABLE IF NOT EXISTS AIAssessmentResults (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role_archetype TEXT NOT NULL,
    overall_level TEXT,
    score_data TEXT NOT NULL,
    recommended_videos TEXT,
    learning_plan TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_user ON AIAssessmentResults(user_id);

-- ============================================================
-- ISSUE #6: YouTube Video Finder with Approved Allowlist
-- ============================================================

CREATE TABLE IF NOT EXISTS ApprovedYouTubeSources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL,
    youtube_id TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    added_by INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES Users(id)
);

CREATE INDEX IF NOT EXISTS idx_ytsources_type ON ApprovedYouTubeSources(source_type);
CREATE INDEX IF NOT EXISTS idx_ytsources_category ON ApprovedYouTubeSources(category);

CREATE TABLE IF NOT EXISTS UserLearningPlan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    youtube_video_id TEXT NOT NULL,
    video_title TEXT NOT NULL,
    video_channel TEXT,
    video_duration TEXT,
    category TEXT,
    source TEXT,
    is_completed INTEGER DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE INDEX IF NOT EXISTS idx_learningplan_user ON UserLearningPlan(user_id);
CREATE INDEX IF NOT EXISTS idx_learningplan_completed ON UserLearningPlan(is_completed);

-- ============================================================
-- NEW IN V3: App / Content Configuration
-- ============================================================

CREATE TABLE IF NOT EXISTS AppConfig (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- NEW IN V3: Branding tokens and rules
-- ============================================================

CREATE TABLE IF NOT EXISTS BrandingTokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_group TEXT NOT NULL,
    token_key TEXT NOT NULL,
    token_value TEXT NOT NULL,
    format TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    UNIQUE(token_group, token_key)
);

CREATE INDEX IF NOT EXISTS idx_brandingtokens_group ON BrandingTokens(token_group);

-- ============================================================
-- NEW IN V3: Operational quick links
-- ============================================================

CREATE TABLE IF NOT EXISTS QuickLinks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    audience TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_quicklinks_category ON QuickLinks(category);
CREATE INDEX IF NOT EXISTS idx_quicklinks_audience ON QuickLinks(audience);

-- ============================================================
-- NEW IN V3: Key contacts
-- ============================================================

CREATE TABLE IF NOT EXISTS KeyContacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    function_area TEXT NOT NULL,
    department TEXT,
    contact_name TEXT,
    title TEXT,
    email TEXT,
    phone TEXT,
    url TEXT,
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_keycontacts_function ON KeyContacts(function_area);
CREATE INDEX IF NOT EXISTS idx_keycontacts_department ON KeyContacts(department);

-- ============================================================
-- NEW IN V3: Systems directory
-- ============================================================

CREATE TABLE IF NOT EXISTS SystemsDirectory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    system_name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    access_url TEXT,
    login_notes TEXT,
    owner_department TEXT,
    support_contact TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_systemsdirectory_category ON SystemsDirectory(category);

-- ============================================================
-- NEW IN V3: Policy resource index
-- ============================================================

CREATE TABLE IF NOT EXISTS PolicyResources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_code TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    applies_to TEXT,
    url TEXT,
    summary TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_policyresources_category ON PolicyResources(category);
CREATE INDEX IF NOT EXISTS idx_policyresources_code ON PolicyResources(policy_code);
