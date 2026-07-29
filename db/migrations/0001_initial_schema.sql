-- ============================================================
-- 0001 — initial schema
--
-- Merged from the former db/schema.sql and db/schema-v2.sql. Splitting them
-- served no purpose: neither was runnable on its own, the order between them
-- existed only as prose in the README, and db/schema.sql created four of the
-- twenty-three tables, so a database built from "the schema" answered the
-- first authenticated request with "no such table: Sessions".
--
-- This file is the base of the tracked chain. It is applied by
--   npx wrangler d1 migrations apply toledo-onboarding-db-prod --local
-- and recorded in d1_migrations, so it runs exactly once per database.
--
-- The auth, task and email tables arrive in 0004; they are a later addition
-- and are kept in their own migration so the chain matches the order every
-- existing database was actually built in.
-- ============================================================

-- Users Table: Tracks authenticated employees and defines moderation privileges
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'staff', -- Roles: 'staff', 'moderator', 'admin'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table: Establishes the taxonomy of the onboarding portal
CREATE TABLE IF NOT EXISTS Categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, -- e.g., 'HR & Benefits', 'NCAA Compliance', 'Facilities'
    description TEXT
);

-- Articles Table: The authoritative repository of published onboarding knowledge
CREATE TABLE IF NOT EXISTS Articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    title TEXT NOT NULL,
    current_content TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(id)
);

-- Submissions Table: The moderation queue capturing crowdsourced employee input
CREATE TABLE IF NOT EXISTS Submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER, -- Null implies a proposal for a brand new article
    author_id INTEGER NOT NULL,
    proposed_title TEXT,
    proposed_content TEXT NOT NULL,
    -- The ticketing columns (request_type, priority, topic_area, source_context
    -- and the four assignment_* fields) are deliberately not here. They arrive
    -- in 0013, because that is where they arrive for every database that
    -- already exists — see that file for why this matters.
    status TEXT DEFAULT 'pending', -- States: 'pending', 'approved', 'rejected'
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER,
    review_notes TEXT,
    FOREIGN KEY (article_id) REFERENCES Articles(id),
    FOREIGN KEY (author_id) REFERENCES Users(id),
    FOREIGN KEY (reviewed_by) REFERENCES Users(id)
);

-- Indexing for query optimization on heavily accessed columns
CREATE INDEX IF NOT EXISTS idx_submissions_status ON Submissions(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON Articles(category_id);


-- ============================================================
-- Merged from the former db/schema-v2.sql
-- ============================================================


PRAGMA foreign_keys = ON;

-- The Tips and TipFeedback tables stood here. The feature never had a
-- user-facing surface — no browse page and no submit form — so the eight
-- seeded tips were unreachable and no tip could ever be written. Retired in
-- 0014, which drops them from databases that already have them.

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
-- NEW IN V3: App / Content Configuration
-- ============================================================

CREATE TABLE IF NOT EXISTS AppConfig (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- BrandingTokens stood here, with eighteen seeded rows. No route, no service
-- and no component ever read it — the palette lives in the stylesheet's @theme
-- block. Retired in 0014.

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
