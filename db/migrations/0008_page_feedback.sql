-- ============================================================
-- Page feedback ("Report an Issue")
--
-- The site-wide feedback button posted to /api/tips/0/feedback, writing into
-- TipFeedback with tip_id = 0. That column is NOT NULL with a foreign key to
-- Tips(id), and no tip has id 0, so D1 rejected every insert. The route 500'd,
-- the client's res.json() rejected on the non-JSON body, and the button
-- silently did nothing while telling the user "Feedback sent! Thank you."
--
-- Page feedback is not tip feedback, so it gets its own table. TipFeedback
-- keeps its original meaning: a report against a specific tip.
--
-- Idempotent; safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS PageFeedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,                      -- NULL once the reporter is deleted
    page TEXT,                            -- the view the report came from
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',  -- 'open' | 'resolved'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    resolved_by INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (resolved_by) REFERENCES Users(id)
);

CREATE INDEX IF NOT EXISTS idx_pagefeedback_status ON PageFeedback(status, created_at);
