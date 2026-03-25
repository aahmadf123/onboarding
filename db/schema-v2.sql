-- ============================================================
-- Toledo Athletics Onboarding Platform — Schema V2
-- Additional tables for Issues #1-#6
-- Run AFTER the original schema.sql
-- ============================================================


-- ============================================================
-- ISSUE #1: Employee Tips & Advice (Moderated)
-- ============================================================

CREATE TABLE IF NOT EXISTS Tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    category_id INTEGER,              -- Links to existing Categories table
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT,                         -- Comma-separated tags (e.g., 'parking,first-week,hr')
    status TEXT DEFAULT 'pending',     -- 'pending', 'approved', 'rejected'
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
    reason TEXT NOT NULL,              -- 'outdated', 'inaccurate', 'inappropriate', 'other'
    details TEXT,
    status TEXT DEFAULT 'open',        -- 'open', 'resolved', 'dismissed'
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
    title TEXT NOT NULL,               -- Job title
    department TEXT,                   -- e.g., 'Executive', 'Compliance', 'SASS', 'Football'
    email TEXT,
    phone TEXT,
    parent_id INTEGER,                -- NULL = top-level (e.g., AD)
    display_order INTEGER DEFAULT 0,  -- Sort order among siblings
    photo_url TEXT,
    is_active INTEGER DEFAULT 1,      -- 0 = inactive/departed
    FOREIGN KEY (parent_id) REFERENCES OrgChart(id)
);

CREATE INDEX IF NOT EXISTS idx_orgchart_parent ON OrgChart(parent_id);
CREATE INDEX IF NOT EXISTS idx_orgchart_department ON OrgChart(department);


-- ============================================================
-- ISSUE #4: Site-Wide AI Chat — Content Index
-- ============================================================

-- Pre-indexed site content so the AI can cite sources accurately
CREATE TABLE IF NOT EXISTS SiteContentIndex (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL,         -- 'article', 'orgchart', 'tip', 'page'
    source_id INTEGER,                -- ID from the source table (e.g., Articles.id)
    source_title TEXT NOT NULL,
    content_text TEXT NOT NULL,        -- Plain text content for AI context
    section_path TEXT,                -- e.g., 'HR & Benefits > 30-Day Deadline'
    last_indexed DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contentindex_source ON SiteContentIndex(source_type, source_id);


-- ============================================================
-- ISSUE #5: AI Literacy Assessment Hub
-- ============================================================

CREATE TABLE IF NOT EXISTS AIAssessmentResults (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role_archetype TEXT NOT NULL,       -- 'coach', 'admin', 'compliance', 'support-staff', 'operations'
    overall_level TEXT,                 -- 'beginner', 'intermediate', 'advanced'
    score_data TEXT NOT NULL,           -- JSON: per-category scores and skill gaps
    recommended_videos TEXT,            -- JSON: array of YouTube video IDs from approved sources
    learning_plan TEXT,                 -- JSON: structured learning path
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_user ON AIAssessmentResults(user_id);


-- ============================================================
-- ISSUE #6: YouTube Video Finder with Approved Allowlist
-- ============================================================

CREATE TABLE IF NOT EXISTS ApprovedYouTubeSources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL,          -- 'channel' or 'playlist'
    youtube_id TEXT NOT NULL UNIQUE,    -- YouTube channel ID or playlist ID
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT,                      -- e.g., 'compliance', 'leadership', 'mental-health', 'nil', 'general'
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
    youtube_video_id TEXT NOT NULL,     -- YouTube video ID (e.g., 'dQw4w9WgXcQ')
    video_title TEXT NOT NULL,
    video_channel TEXT,
    video_duration TEXT,
    category TEXT,
    source TEXT,                         -- 'assessment' (from AI hub) or 'manual' (user bookmarked)
    is_completed INTEGER DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE INDEX IF NOT EXISTS idx_learningplan_user ON UserLearningPlan(user_id);
CREATE INDEX IF NOT EXISTS idx_learningplan_completed ON UserLearningPlan(is_completed);