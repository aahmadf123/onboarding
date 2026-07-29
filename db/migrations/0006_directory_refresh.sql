-- ============================================================
-- 2026-06-14 Directory / leadership refresh
-- ============================================================
-- Corrects the org chart, key contacts, the Executive Leadership article,
-- and the AI content index to reflect the current (June 2026) Toledo
-- Athletics staff directory (utrockets.com/staff-directory).
--
-- Additive & idempotent: safe to run more than once and safe on a live DB.
-- Day-to-day edits should still be made in Admin → Content.
--
-- EMAIL NOTE: utrockets.com/utoledo.edu block automated scraping, so most
-- per-person athletics emails could not be read from a live profile page.
-- The University convention is firstname.lastname@utoledo.edu (single domain;
-- the @rockets.utoledo.edu form is only the login/MFA username, not the email).
--   * CONFIRMED from research: connor.whelan@utoledo.edu, kimberly.nigem@utoledo.edu,
--     and the office address titleix@utoledo.edu.
--   * BY CONVENTION (verify before relying on them): tom.moreland@,
--     melissa.deangelo@, tim.warga@ utoledo.edu.
--   * LEFT BLANK where the spelling is ambiguous (e.g. hyphenated names) —
--     fill these in Admin → Content → Contacts once confirmed.
-- ============================================================

-- ---- OrgChart: executive leadership ------------------------------------------

-- Athletic Director: Tom Moreland replaced Bryan B. Blair (Blair left for Syracuse;
-- Brian Lutz served as interim AD in between). Moreland started May 11, 2026.
UPDATE OrgChart SET
  name = 'Tom Moreland',
  title = 'Vice President and Director of Athletics',
  email = 'tom.moreland@utoledo.edu',
  phone = '419-530-4987'
WHERE id = 1;

-- Rebecca Lugo — add directory phone.
UPDATE OrgChart SET phone = '419-530-4987' WHERE id = 2 AND name = 'Rebecca Lugo';

-- Nicole Harris is no longer in the current staff directory; her sport-admin
-- duties moved to Connor Whelan. Disable rather than delete (reversible in CMS).
UPDATE OrgChart SET is_active = 0 WHERE id = 3 AND name = 'Nicole Harris';

-- Connor Whelan — now sport administrator for Football, MBB, Women's Volleyball.
UPDATE OrgChart SET
  title = 'Deputy Athletic Director / Chief Revenue Officer / Sport Administrator for Football, Men''s Basketball, Women''s Volleyball',
  email = 'connor.whelan@utoledo.edu',
  phone = '419-530-2127'
WHERE id = 4 AND name = 'Connor Whelan';

-- Melissa DeAngelo — add Softball sport-admin role + email (by convention).
UPDATE OrgChart SET
  title = 'Senior Associate Athletic Director for Business Strategy / Chief Financial Officer / Sport Administrator for Softball',
  email = 'melissa.deangelo@utoledo.edu'
WHERE id = 5 AND name = 'Melissa DeAngelo';

-- Brian Lutz — current compliance title + sport-admin assignments.
UPDATE OrgChart SET
  title = 'Senior Associate Athletic Director of Compliance / Sport Administrator for Women''s Soccer, Women''s & Men''s Cross Country, Women''s Track & Field'
WHERE id = 6 AND name = 'Brian Lutz';

-- Tim Warga — add directory phone + Baseball sport-admin role + email (by convention).
UPDATE OrgChart SET
  title = 'Associate Athletic Director of Operations/Events / Sport Administrator for Baseball',
  email = 'tim.warga@utoledo.edu',
  phone = '419-530-2104'
WHERE id = 9 AND name = 'Tim Warga';

-- Brian Jones — add directory phone.
UPDATE OrgChart SET phone = '419-530-7758' WHERE id = 11 AND name = 'Brian Jones';

-- Michelle McDevitt — university-wide Title IX Coordinator; add office contact.
UPDATE OrgChart SET
  email = 'titleix@utoledo.edu',
  phone = '419-530-3152'
WHERE id = 12 AND name = 'Michelle McDevitt';

-- Kenneth Schank departed; ensure disabled.
UPDATE OrgChart SET is_active = 0 WHERE name = 'Kenneth Schank';

-- New: Lauren Best-Hovermale (Associate AD of Compliance; from Bowling Green, Apr 2026).
INSERT INTO OrgChart (name, title, department, email, phone, parent_id, display_order, is_active)
SELECT 'Lauren Best-Hovermale', 'Associate Athletic Director of Compliance', 'Compliance', NULL, NULL, 6, 2, 1
WHERE NOT EXISTS (SELECT 1 FROM OrgChart WHERE name = 'Lauren Best-Hovermale');

-- New: Kim Nigem (Faculty Athletic Representative).
INSERT INTO OrgChart (name, title, department, email, phone, parent_id, display_order, is_active)
SELECT 'Kim Nigem', 'Faculty Athletic Representative', 'Executive', 'kimberly.nigem@utoledo.edu', '419-530-4687', 1, 12, 1
WHERE NOT EXISTS (SELECT 1 FROM OrgChart WHERE name = 'Kim Nigem');

-- ---- KeyContacts -------------------------------------------------------------

-- Keep the compliance contact title in sync.
UPDATE KeyContacts SET
  title = 'Senior Associate Athletic Director of Compliance'
WHERE contact_name = 'Brian Lutz';

-- New: Title IX reporting contact (supports the Title IX article).
INSERT INTO KeyContacts (function_area, department, contact_name, title, email, phone, url, notes, display_order)
SELECT 'Title IX', 'Office of Title IX and Compliance', 'Michelle McDevitt', 'Director of Title IX and Compliance (Title IX Coordinator)',
       'titleix@utoledo.edu', '419-530-3152', 'https://www.utoledo.edu/title-ix/',
       'University-wide Title IX Coordinator, Snyder Memorial Hall Rm 1120. Anonymous reporting hotline: 888-416-1308. All employees are mandated reporters.', 39
WHERE NOT EXISTS (SELECT 1 FROM KeyContacts WHERE function_area = 'Title IX');

-- ---- Articles: Executive Leadership & Organizational Structure ---------------

UPDATE Articles SET
  current_content =
'The University of Toledo Athletics Department is led by **Tom Moreland**, Vice President and Director of Athletics, who joined Toledo in May 2026 (the 15th director of athletics in program history). He succeeded Bryan B. Blair.

The senior leadership team includes:
- **Connor Whelan** — Deputy Athletic Director / Chief Revenue Officer (sport administrator for Football, Men''s Basketball, Women''s Volleyball)
- **Melissa DeAngelo** — Senior Associate AD for Business Strategy / Chief Financial Officer
- **Brian Lutz** — Senior Associate AD of Compliance
- **Lauren Best-Hovermale** — Associate AD of Compliance
- **Josh Dittman** — Senior Associate AD for Development
- **Paul Helgren** — Associate AD of Communications
- **Tim Warga** — Associate AD of Operations/Events
- **Jillian Lehman** — Associate AD for Student-Athlete Experience
- **Brian Jones** — Senior Associate AD of Health and Wellness
- **Michelle McDevitt** — Director of Title IX and Compliance
- **Kim Nigem** — Faculty Athletic Representative

For the full, always-current staff directory, visit https://utrockets.com/staff-directory.',
  last_updated = CURRENT_TIMESTAMP
WHERE title = 'Executive Leadership & Organizational Structure';

-- Remove the stale "Nicole Harris (Deputy AD / SWA)" routing in the compliance article.
UPDATE Articles SET
  current_content = REPLACE(current_content,
    'the compliance office or Nicole Harris (Deputy AD / SWA)',
    'the compliance office (Brian Lutz, Senior Associate AD of Compliance)')
WHERE current_content LIKE '%Nicole Harris (Deputy AD / SWA)%';

-- ---- AI content index (SiteContentIndex) -------------------------------------

UPDATE SiteContentIndex SET
  content_text = 'Tom Moreland leads Toledo Athletics as Vice President and Director of Athletics (since May 2026), succeeding Bryan B. Blair. Key executive leaders include Connor Whelan, Melissa DeAngelo, Brian Lutz, Lauren Best-Hovermale, Josh Dittman, Paul Helgren, Tim Warga, Jillian Lehman, Brian Jones, Michelle McDevitt, and faculty athletic representative Kim Nigem.'
WHERE source_type = 'article' AND source_id = 1;

UPDATE SiteContentIndex SET
  source_title = 'Tom Moreland',
  content_text = 'Vice President and Director of Athletics (since May 2026). Cabinet-level athletics leader; succeeded Bryan B. Blair.'
WHERE source_type = 'orgchart' AND source_id = 1;

-- Nicole Harris is disabled; drop her from the AI index.
DELETE FROM SiteContentIndex WHERE source_type = 'orgchart' AND source_id = 3;

UPDATE SiteContentIndex SET
  content_text = 'Senior Associate Athletic Director of Compliance. Leads athletics compliance and rules governance; primary contact for recruiting, NIL, and booster questions.'
WHERE source_type = 'orgchart' AND source_id = 6;

-- Add a Title IX entry the AI assistant can cite for reporting questions.
INSERT INTO SiteContentIndex (source_type, source_title, content_text, section_path)
SELECT 'contact', 'Title IX Reporting',
       'Michelle McDevitt is the University of Toledo Title IX Coordinator (Director of Title IX and Compliance), titleix@utoledo.edu, 419-530-3152, Snyder Memorial Hall Rm 1120. All employees are mandated reporters. Anonymous hotline: 888-416-1308. Report online at utoledo.edu/title-ix.',
       'Contacts > Title IX'
WHERE NOT EXISTS (SELECT 1 FROM SiteContentIndex WHERE source_type = 'contact' AND source_title = 'Title IX Reporting');
