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

