-- ============================================================
-- Toledo Athletics Onboarding Platform — Seed V2
-- Data for Issues #1-#6 new tables
-- Run AFTER schema-v2.sql
-- ============================================================


-- ============================================================
-- ORG CHART (Issue #3)
-- Based on UToledo Athletics Staff Directory and strategic plan docs
-- parent_id NULL = top of hierarchy
-- ============================================================

-- Level 0: Vice President / Director of Athletics
INSERT INTO OrgChart (id, name, title, department, email, parent_id, display_order) VALUES
(1, 'Bryan B. Blair', 'Vice President and Director of Athletics', 'Executive', 'bryan.blair@utoledo.edu', NULL, 1);

-- Level 1: Direct reports to AD
INSERT INTO OrgChart (id, name, title, department, email, parent_id, display_order) VALUES
(2, 'Nicole Harris', 'Deputy AD / COO / Senior Woman Administrator', 'Executive', 'nicole.harris@utoledo.edu', 1, 1),
(3, 'Brian Lutz', 'Senior Associate AD for Compliance and Integrity', 'Compliance', 'brian.lutz@utoledo.edu', 1, 2),
(4, 'Jillian Lehman', 'Associate AD for Student-Athlete Experience', 'Student-Athlete Development', 'jillian.lehman@utoledo.edu', 1, 3);

-- Level 2: Compliance staff
INSERT INTO OrgChart (id, name, title, department, email, parent_id, display_order) VALUES
(5, 'Kenneth Schank', 'Assistant AD for Compliance', 'Compliance', 'kenneth.schank@utoledo.edu', 3, 1);

-- Level 2: SASS staff
INSERT INTO OrgChart (id, name, title, department, email, parent_id, display_order) VALUES
(6, 'Duane Welch', 'Assistant Director of SASS', 'Student-Athlete Development', 'duane.welch@utoledo.edu', 4, 1);

-- NOTE FOR AI AGENTS: This is starter data. The full org chart should be expanded
-- as the real staff directory at https://utrockets.com/staff-directory is referenced.
-- Add more rows following the same parent_id hierarchy pattern.
-- Coaches, sport administrators, facilities, marketing, ticketing, etc.


-- ============================================================
-- APPROVED YOUTUBE SOURCES (Issue #6)
-- Channels and playlists pre-approved by admin for the video finder
-- Categories: compliance, leadership, mental-health, nil, academic, general, title-ix
-- ============================================================

INSERT INTO ApprovedYouTubeSources (source_type, youtube_id, display_name, description, category, is_active) VALUES
-- NCAA Official
('channel', 'UCncsaFSMwjk2CHpkmvVyntA', 'NCAA', 'Official NCAA channel — compliance updates, eligibility rules, championship coverage', 'compliance', 1),

-- NCAA Compliance & Education
('playlist', 'PLBaXSYTHla_Pu6OYBIkzxQP5uaEAaZBZ5', 'NCAA Compliance Education', 'Official NCAA compliance education videos and rule interpretations', 'compliance', 1),

-- Title IX / Gender Equity
('channel', 'UCg-K8ithKxBR_bE1hY5bLhA', 'Title IX & Beyond', 'Title IX education, gender equity in athletics, policy updates', 'title-ix', 1),

-- NIL Education
('channel', 'UC0Kl3mQ2VjYnJsxFfcCVizw', 'Opendorse', 'NIL education, athlete branding, endorsement compliance', 'nil', 1),
('channel', 'UCZiPnQIrKJElIqjuGq_iB_g', 'INFLCR', 'NIL compliance platform — educational content for staff and athletes', 'nil', 1),

-- Mental Health & Wellness
('channel', 'UCqb3-nd3XCjfJ1Kp2KKwFQg', 'Athletes Connected', 'University of Michigan mental health program — athlete wellness resources', 'mental-health', 1),
('channel', 'UCPa3SKhLfB4sFMFnenBp0YA', 'Jed Foundation', 'Mental health resources for young adults and college students', 'mental-health', 1),
('channel', 'UCrPx4Y9pY6E6D_PMRxCk2Aw', 'Headspace', 'Mindfulness and mental health — used by many athletics programs', 'mental-health', 1),

-- Leadership & Professional Development
('channel', 'UCx2oNzN5PEECnYNvxypxdog', 'Simon Sinek', 'Leadership principles, team building, purpose-driven management', 'leadership', 1),
('channel', 'UCfiwagBgPMIXCCWJVUJFIjlg', 'N4A NFCA', 'National Association of Academic Advisors for Athletics — career development', 'academic', 1),

-- Athletic Administration
('channel', 'UCBmS9S97CEU5zybnRqGTzdw', 'NACDA', 'National Association of Collegiate Directors of Athletics', 'leadership', 1),

-- Toledo Athletics (own content)
('channel', 'UC_wAT-GlU5h1rP2TPBKF8PA', 'Toledo Rockets', 'Official Toledo Athletics YouTube channel', 'general', 1),

-- Financial Literacy (for NIL support)
('channel', 'UCL8w_A8p8P1HWI3k6PR5Z6w', 'Two Cents (PBS)', 'Financial literacy basics — useful for NIL financial education', 'nil', 1);


-- ============================================================
-- SAMPLE TIPS (Issue #1)
-- A few starter tips that are pre-approved to show the feature
-- ============================================================

-- First, ensure we have a staff user to attribute tips to
INSERT OR IGNORE INTO Users (id, email, role) VALUES (100, 'staff.example@utoledo.edu', 'staff');
INSERT OR IGNORE INTO Users (id, email, role) VALUES (101, 'admin@utoledo.edu', 'admin');

INSERT INTO Tips (author_id, category_id, title, content, tags, status, reviewed_by, approved_at) VALUES
(100, 7, 'Parking Pro Tip: First Day Arrival',
'Arrive at least 30 minutes early on your first day. The lots near Savage Arena fill up fast before 9am. If you don''t have your A permit yet, use the C permit daily option ($6.20) through the ParkUToledo app — you can buy it from your phone in the lot.',
'parking,first-day,savage-arena',
'approved', 101, CURRENT_TIMESTAMP),

(100, 6, 'UTAD Account: Don''t Skip MFA Setup',
'Set up Microsoft Authenticator BEFORE you try to log into anything else. I made the mistake of trying to access MyUT first and got locked out for 30 minutes. The order matters: 1) Activate UTAD, 2) Set up MFA, 3) Then access everything else.',
'utad,mfa,it,first-week',
'approved', 101, CURRENT_TIMESTAMP),

(100, 5, 'Benefits Enrollment: Set a Calendar Reminder NOW',
'The 30-day benefits deadline is real and they will not make exceptions. I set a reminder for day 15 and day 25. Also — even if you''re declining coverage because you''re on a spouse''s plan, you MUST actively decline in MyUT. Not clicking anything is NOT the same as declining.',
'benefits,hr,deadline,30-day',
'approved', 101, CURRENT_TIMESTAMP),

(100, 9, 'Best Lunch Spots Near Campus',
'If you''re tired of campus food: Vito''s Pizza on Secor is a 5-minute drive and has great slices. Grumpy''s in Old Orchard is perfect for a sit-down lunch. And Brew Coffee Bar in Gateway Plaza is right on campus if you just need a quick bite and coffee between meetings.',
'food,lunch,campus,toledo',
'approved', 101, CURRENT_TIMESTAMP),

(100, 2, 'Compliance: When in Doubt, Call First',
'This was the best advice I got: if you''re even 1% unsure whether an action might violate NCAA rules, call the compliance office BEFORE you do it. Brian and Kenneth are incredibly helpful and would rather answer a quick question than deal with an infraction report. Their number should be in your phone contacts on day one.',
'compliance,ncaa,advice',
'approved', 101, CURRENT_TIMESTAMP);


-- ============================================================
-- SITE CONTENT INDEX (Issue #4)
-- Pre-index existing articles so AI chat can reference them
-- This pulls from the seed.sql articles
-- ============================================================

INSERT INTO SiteContentIndex (source_type, source_id, source_title, content_text, section_path) VALUES
('article', 1, 'Executive Leadership & Organizational Structure',
'Bryan B. Blair is VP and Director of Athletics. Nicole Harris is Deputy AD, COO, and Senior Woman Administrator overseeing football, women''s basketball, women''s swimming & diving, women''s rowing, academics, student-athlete development, and strength and conditioning.',
'Department Overview > Leadership'),

('article', 2, 'Rise Together Strategic Plan',
'The Rise Together strategic plan has the acronym R.I.S.E. standing for Resilience, Integrity, Servanthood, and Excellence. The six goals are: 1) Recruit, Retain, Develop Teammates, 2) Generate Student-Athlete Success, 3) Elevate the Brand, 4) Enhance Team Toledo Engagement, 5) Grow Resources, 6) Invest in Infrastructure.',
'Department Overview > Strategic Plan'),

('article', 3, 'Athletic Facilities Directory',
'Savage Arena is the main admin hub for basketball and volleyball. Larimer Athletic Complex houses football operations, strength and conditioning, and SASS. Findlay Building is the base for baseball and softball.',
'Department Overview > Facilities'),

('article', 4, 'Compliance Office & Mandatory Acknowledgments',
'Brian Lutz is Senior Associate AD for Compliance. Kenneth Schank is Assistant AD for Compliance. All new staff must digitally sign the Employee Compliance Guide and acknowledge the UT Athletics Compliance Manual.',
'NCAA Compliance > Compliance Office'),

('article', 5, 'Core NCAA Bylaws',
'Key bylaws: 11 (Personnel Conduct), 12 (Amateurism), 13 (Recruiting), 14 (Academic Eligibility), 15 (Financial Aid), 16 (Permissible Benefits), 17 (Playing and Practice Seasons/CARA).',
'NCAA Compliance > NCAA Bylaws'),

('article', 6, 'ARMS Platform',
'ARMS is used for logging CARA hours, managing recruiting communications, and processing prospect visits. Training is mandatory before any recruiting activities.',
'NCAA Compliance > ARMS'),

('article', 7, 'Booster Relations Policy',
'Boosters cannot recruit off-campus or use relationships to advantage Toledo in recruiting. Any booster contact about a recruit must be reported to compliance immediately.',
'NCAA Compliance > Boosters'),

('article', 8, 'Sports Wagering Prohibition',
'Absolute prohibition on wagering for all staff, coaches, and student-athletes on any NCAA championship sport. Includes March Madness brackets and informal pools. Violation means termination.',
'NCAA Compliance > Sports Wagering'),

('article', 9, 'Title IX Compliance',
'Three-part test: equitable participation, equitable financial support, equitable treatment (the laundry list). All staff must report suspected sexual violence to Title IX coordinator immediately.',
'Title IX > Overview'),

('article', 10, 'Transgender Student-Athlete Inclusion',
'Use preferred names and pronouns. Maintain strict confidentiality about transgender status. Ensure dignified facility access. Questions go to compliance or Nicole Harris.',
'Title IX > Transgender Inclusion'),

('article', 11, 'NIL at Toledo',
'Toledo was the first MAC school with an organized NIL collective. Has Campus Ink apparel partnerships. The Liftoff program and NIL Resource Center are the main hubs.',
'NIL > Overview'),

('article', 12, 'NIL Compliance Rules',
'Staff must understand institutional involvement limits, state law vs NCAA policy conflicts, disclosure requirements, and the prohibition on non-compliant apparel during team events.',
'NIL > Rules'),

('article', 13, 'Spry & Teamworks GM',
'Spry provides NIL compliance education. Teamworks GM provides financial literacy and brand management courses. Staff need admin access to both — request from compliance office.',
'NIL > Platforms'),

('article', 14, 'Pre-Employment Checklist',
'Before day one: complete I-9 via IntelliCorp, mail official transcripts in sealed envelopes, finalize health screening if on Health Science Campus.',
'HR & Benefits > Pre-Employment'),

('article', 15, 'First Week Tasks',
'Attend Monday 8:30am orientation. Activate UTAD account. Set up MFA via Microsoft Authenticator. Set up direct deposit and tax forms in MyUT.',
'HR & Benefits > First Week'),

('article', 16, '30-Day Benefits Deadline',
'Exactly 30 days to elect or waive medical, dental, vision, life insurance. Must actively decline even if not enrolling. Upload dependent documentation in MyUT.',
'HR & Benefits > Benefits'),

('article', 17, '120-Day Retirement Elections',
'120 days to finalize retirement plan. Create accounts with approved vendors. Submit authorization forms. Manager should do 30/60/90 day check-ins.',
'HR & Benefits > Retirement'),

('article', 18, 'Employee Benefits & Work-Life Harmony',
'EAP through AllOne Health (free, confidential). Voluntary Summer Reduced Hours. FMLA/ADA accommodations. Corporate discounts for software and hotels.',
'HR & Benefits > Work-Life'),

('article', 19, 'Mandatory Training Modules',
'Within 30 days: Ohio Ethics Law, HIPAA Basics (if applicable), Title IX/VAWA training, NCAA Compliance acknowledgment, Employee Compliance Guide acknowledgment.',
'HR & Benefits > Training'),

('article', 20, 'Rocket Card & Mobile ID',
'Activate UTAD first, then set up MFA, then request Rocket Card in MyUT. Download Transact eAccounts app for mobile ID in Apple/Google Wallet.',
'IT & Campus Access > Rocket Card'),

('article', 21, 'Essential Apps',
'Required: Microsoft Authenticator, Transact eAccounts. Recommended: Blackboard Mobile, Rave Guardian (emergency alerts).',
'IT & Campus Access > Apps'),

('article', 22, 'Parking Permits',
'A permit for full-time staff: $329/year. E permit for executives: $952/year. C permit for daily: $6.20/day. Enforcement is year-round including breaks and weekends.',
'Parking > Permits'),

('article', 23, 'Campus Parking Map',
'Savage Arena: east side A permit spaces. Larimer: dedicated athletics lots. Findlay: south end surface lots. Use ParkUToledo portal and interactive parking finder.',
'Parking > Map'),

('article', 24, 'SASS Overview',
'Located in Larimer Athletic Complex. Jillian Lehman is Associate AD for Student-Athlete Experience. Duane Welch is Assistant Director. Provides tutoring, study tables, course scheduling.',
'Student-Athlete Development > SASS'),

('article', 25, 'Mental Health Resources',
'Watch for withdrawal, performance drops, hopelessness, sleep/eating changes. Refer to Jillian Lehman, University Health Center. Crisis: 988 Lifeline or text HOME to 741741.',
'Student-Athlete Development > Mental Health'),

('article', 26, 'Career Development',
'Rockets Rise: Networking & NIL Night connects athletes with employers. Staff should encourage career programming attendance and share professional contacts.',
'Student-Athlete Development > Career'),

('article', 27, 'Relocation Allowance',
'Up to $8,500 for eligible full-time staff/coaches. New commute must be 50+ miles greater. Taxed as ordinary income. Need 3 moving quotes from preferred vendors.',
'Relocation > Allowance'),

('article', 28, 'Toledo Neighborhoods',
'Old Orchard: walkable, historic, north of campus. Ottawa Hills: affluent, near Wildwood Metropark. Westgate: retail access, suburban, highway convenient.',
'Relocation > Neighborhoods'),

('article', 29, 'Coffee Shops & Dining',
'Earth Coffeehouse in TolHouse for focused work. Brew Coffee Bar on campus in Gateway Plaza. Plate 21 in Beverly neighborhood. Toledo Museum of Art has free admission.',
'Relocation > Dining & Culture'),

('orgchart', 1, 'Bryan B. Blair', 'Vice President and Director of Athletics. Top executive of the athletics department.', 'Org Chart > Executive'),
('orgchart', 2, 'Nicole Harris', 'Deputy AD, COO, Senior Woman Administrator. Sport admin for Football, Women''s Basketball, Swimming & Diving, Rowing. Oversees academics, student-athlete development, strength & conditioning.', 'Org Chart > Executive'),
('orgchart', 3, 'Brian Lutz', 'Senior Associate AD for Compliance and Integrity. Leads the compliance office.', 'Org Chart > Compliance'),
('orgchart', 4, 'Jillian Lehman', 'Associate AD for Student-Athlete Experience. Oversees SASS and student development.', 'Org Chart > Student-Athlete Development'),
('orgchart', 5, 'Kenneth Schank', 'Assistant AD for Compliance. Reports to Brian Lutz.', 'Org Chart > Compliance'),
('orgchart', 6, 'Duane Welch', 'Assistant Director of SASS. Reports to Jillian Lehman.', 'Org Chart > Student-Athlete Development');


-- ============================================================
-- AI LITERACY RUBRIC DATA (Issue #5)
-- Stored as a single JSON config row in a simple config table
-- The AI assessment chatbot uses this to structure conversations
-- ============================================================

CREATE TABLE IF NOT EXISTS AppConfig (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO AppConfig (key, value) VALUES
('ai_literacy_rubric', '{
  "role_archetypes": {
    "coach": {
      "label": "Head/Assistant Coach",
      "focus_areas": ["recruiting_compliance", "cara_logging", "nil_basics", "mental_health_referral", "booster_rules"]
    },
    "admin": {
      "label": "Administrative Staff",
      "focus_areas": ["hr_processes", "it_setup", "campus_navigation", "general_compliance", "title_ix_basics"]
    },
    "compliance": {
      "label": "Compliance Staff",
      "focus_areas": ["ncaa_bylaws_deep", "arms_platform", "nil_advanced", "title_ix_advanced", "booster_management"]
    },
    "support-staff": {
      "label": "Student-Athlete Support / Academic Staff",
      "focus_areas": ["sass_services", "mental_health_protocol", "eligibility_rules", "career_development", "academic_support"]
    },
    "operations": {
      "label": "Operations / Facilities / Events",
      "focus_areas": ["facility_management", "event_operations", "campus_logistics", "parking_systems", "general_compliance"]
    }
  },
  "assessment_categories": {
    "recruiting_compliance": {
      "label": "Recruiting Rules & Compliance",
      "scenarios": [
        "A booster tells you they had dinner with a recruit and their family. What do you do?",
        "A recruit asks if they can attend a home game this weekend. What rules apply?",
        "You want to text a prospective student-athlete. What do you check first?"
      ]
    },
    "cara_logging": {
      "label": "CARA Logging & ARMS",
      "scenarios": [
        "Your team had a voluntary workout this morning. Does this count as CARA time?",
        "How do you log a recruiting phone call in ARMS?",
        "An athlete participated in 19.5 hours of countable activities this week. Is this a problem?"
      ]
    },
    "nil_basics": {
      "label": "NIL Fundamentals",
      "scenarios": [
        "An athlete asks if they can wear a brand-sponsored hoodie to an away game. What do you tell them?",
        "A local business wants to pay an athlete for a social media post. What disclosures are needed?",
        "Where do you direct an athlete who wants to learn about NIL opportunities at Toledo?"
      ]
    },
    "mental_health_referral": {
      "label": "Mental Health Awareness & Referral",
      "scenarios": [
        "An athlete has been missing practice and seems withdrawn. What steps do you take?",
        "A student-athlete mentions feeling like a burden to their teammates. How do you respond?",
        "An athlete is having a panic attack in your office. What do you do?"
      ]
    },
    "hr_processes": {
      "label": "HR & Onboarding Processes",
      "scenarios": [
        "It is day 28 and you have not enrolled in benefits yet. What happens?",
        "You need to set up your university email. What is the first step?",
        "A new hire asks you about the retirement plan deadline. What do you tell them?"
      ]
    },
    "general_compliance": {
      "label": "General NCAA Compliance",
      "scenarios": [
        "A colleague invites you to a March Madness bracket pool with a $10 buy-in. Can you participate?",
        "A student-athlete asks you to buy them lunch. Can you?",
        "You receive a gift from a booster for your birthday. What do you do?"
      ]
    },
    "title_ix_basics": {
      "label": "Title IX Fundamentals",
      "scenarios": [
        "A student-athlete reports that a coach made an inappropriate comment. What is your obligation?",
        "What are the three parts of the Title IX compliance test for athletics?",
        "A transgender student-athlete asks about facility access. How do you handle this?"
      ]
    },
    "campus_navigation": {
      "label": "Campus & IT Setup",
      "scenarios": [
        "Where are the main athletics administrative offices located?",
        "You need to get into a locked athletic facility on a weekend. What do you need?",
        "Your parking permit is not working and you got a citation. What do you do?"
      ]
    }
  },
  "scoring": {
    "beginner": {"min": 0, "max": 40, "label": "Needs Foundational Training"},
    "intermediate": {"min": 41, "max": 70, "label": "Good Foundation, Some Gaps"},
    "advanced": {"min": 71, "max": 100, "label": "Strong Knowledge Base"}
  },
  "disclaimer": "This assessment is for self-development purposes only. It is NOT an HR evaluation and will not be shared with supervisors. Results are saved to your profile so you can revisit and track your growth."
}');