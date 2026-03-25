-- ============================================================
-- Toledo Athletics Onboarding Platform — Seed V3
-- Run AFTER schema-v3.sql
-- Populates V2 tables plus new V3 structured reference tables.
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- Seed users needed for moderated / admin-owned content
-- ------------------------------------------------------------
INSERT OR IGNORE INTO Users (id, email, role) VALUES (100, 'staff.example@utoledo.edu', 'staff');
INSERT OR IGNORE INTO Users (id, email, role) VALUES (101, 'admin@utoledo.edu', 'admin');

-- ============================================================
-- ORG CHART (expanded starter hierarchy)
-- ============================================================
DELETE FROM OrgChart;

INSERT INTO OrgChart (id, name, title, department, email, phone, parent_id, display_order, is_active) VALUES
(1, 'Bryan B. Blair', 'Vice President and Director of Athletics', 'Executive', 'bryan.blair@utoledo.edu', NULL, NULL, 1, 1),
(2, 'Rebecca Lugo', 'Executive Assistant to the Vice President and Director of Athletics', 'Executive', NULL, NULL, 1, 1, 1),
(3, 'Nicole Harris', 'Deputy Athletic Director / Chief Operating Officer / Senior Woman Administrator', 'Executive', 'nicole.harris@utoledo.edu', NULL, 1, 2, 1),
(4, 'Connor Whelan', 'Deputy Athletic Director / Chief Revenue Officer', 'Executive', NULL, NULL, 1, 3, 1),
(5, 'Melissa DeAngelo', 'Senior Associate Athletic Director for Business Strategy / Chief Financial Officer', 'Business Office', NULL, NULL, 1, 4, 1),
(6, 'Brian Lutz', 'Senior Associate Athletic Director for Compliance and Integrity', 'Compliance', 'brian.lutz@utoledo.edu', '419-530-8496', 1, 5, 1),
(7, 'Josh Dittman', 'Senior Associate Athletic Director for Development', 'Development', NULL, NULL, 1, 6, 1),
(8, 'Paul Helgren', 'Associate Athletic Director of Communications', 'Communications', 'paul.helgren@utoledo.edu', '419-530-4918', 1, 7, 1),
(9, 'Tim Warga', 'Associate Athletic Director of Operations and Events', 'Facilities and Operations', NULL, NULL, 1, 8, 1),
(10, 'Jillian Lehman', 'Associate Athletic Director for Student-Athlete Experience', 'Student-Athlete Development', 'jillian.lehman@utoledo.edu', NULL, 1, 9, 1),
(11, 'Brian Jones', 'Senior Associate Athletic Director of Health and Wellness', 'Sports Medicine', NULL, NULL, 1, 10, 1),
(12, 'Michelle McDevitt', 'Director of Title IX and Compliance', 'Title IX Compliance', NULL, NULL, 1, 11, 1),
(13, 'Ellen Holton', 'Assistant Athletic Director for Creative Services and Brand Strategy', 'Creative Services', NULL, NULL, 3, 1, 1),
(14, 'Kenneth Schank', 'Assistant Athletic Director for Compliance', 'Compliance', 'kenneth.schank@utoledo.edu', NULL, 6, 1, 1),
(15, 'Duane Welch', 'Assistant Director of SASS', 'Student-Athlete Development', 'duane.welch@utoledo.edu', NULL, 10, 1, 1),
(16, 'Traci Snyder', 'Director of Student-Athlete Development', 'Student-Athlete Development', NULL, NULL, 10, 2, 1),
(17, 'Brandon Hannum', 'Director of Sports Performance', 'Strength and Conditioning', NULL, NULL, 3, 2, 1),
(18, 'Brandon Norris', 'Assistant Athletic Director of Equipment', 'Equipment', NULL, NULL, 3, 3, 1),
(19, 'Christopher Harris', 'Director of Ticket Sales and Operations', 'Ticket Department', NULL, NULL, 4, 1, 1),
(20, 'Steve Easton', 'Associate Director of Communications', 'Communications', NULL, NULL, 8, 1, 1),
(21, 'Nick Kerver', 'Associate Director of Communications', 'Communications', NULL, NULL, 8, 2, 1),
(22, 'Jordyn Prok', 'Assistant Director of Communications', 'Communications', NULL, NULL, 8, 3, 1),
(23, 'Mike Jacobs', 'Head Football Coach', 'Football', NULL, NULL, 3, 10, 1),
(24, 'Tod Kowalczyk', 'Head Men''s Basketball Coach', 'Men''s Basketball', NULL, NULL, 3, 10, 1),
(25, 'Ginny Boggess', 'Head Women''s Basketball Coach', 'Women''s Basketball', NULL, NULL, 3, 11, 1),
(26, 'Rob Reinstetle', 'Head Baseball Coach', 'Baseball', NULL, NULL, 3, 10, 1),
(27, 'Jessica Bracamonte', 'Head Softball Coach', 'Softball', NULL, NULL, 3, 10, 1),
(28, 'Mark Batman', 'Head Women''s Soccer Coach', 'Women''s Soccer', NULL, NULL, 3, 10, 1),
(29, 'Brian Wright', 'Head Women''s Volleyball Coach', 'Women''s Volleyball', NULL, NULL, 3, 11, 1),
(30, 'Andrea Grove-McDonough', 'Head Cross Country and Track and Field Coach', 'Cross Country and Track and Field', NULL, NULL, 3, 11, 1),
(31, 'Jeff Roope', 'Head Men''s Golf Coach', 'Men''s Golf', NULL, NULL, 3, 10, 1),
(32, 'Ali Green', 'Head Women''s Golf Coach', 'Women''s Golf', NULL, NULL, 3, 11, 1),
(33, 'Jacy Dyer', 'Head Women''s Swimming and Diving Coach', 'Women''s Swimming and Diving', NULL, NULL, 3, 12, 1),
(34, 'Tracy Mauntler', 'Head Women''s Tennis Coach', 'Women''s Tennis', NULL, NULL, 3, 12, 1),
(35, 'Al Wermer', 'Head Men''s Tennis Coach', 'Men''s Tennis', NULL, NULL, 3, 13, 1),
(36, 'Chris Bailey-Greene', 'Head Women''s Rowing Coach', 'Women''s Rowing', NULL, NULL, 3, 13, 1),
(37, 'Shelby Tincher', 'Head Cheerleading Coach', 'Cheerleading', NULL, NULL, 9, 11, 1);

-- ============================================================
-- APPROVED YOUTUBE SOURCES
-- ============================================================
DELETE FROM ApprovedYouTubeSources;

INSERT INTO ApprovedYouTubeSources (id, source_type, youtube_id, display_name, description, category, added_by, is_active) VALUES
(1, 'channel', 'UCncsaFSMwjk2CHpkmvVyntA', 'NCAA', 'Official NCAA channel for compliance updates, rules education, and championships.', 'compliance', 101, 1),
(2, 'playlist', 'PLBaXSYTHla_Pu6OYBIkzxQP5uaEAaZBZ5', 'NCAA Compliance Education', 'Official NCAA compliance education playlist and interpretations.', 'compliance', 101, 1),
(3, 'channel', 'UCg-K8ithKxBR_bE1hY5bLhA', 'Title IX & Beyond', 'Title IX education, gender equity, and policy discussions.', 'title-ix', 101, 1),
(4, 'channel', 'UC0Kl3mQ2VjYnJsxFfcCVizw', 'Opendorse', 'NIL education, athlete branding, and endorsements.', 'nil', 101, 1),
(5, 'channel', 'UCZiPnQIrKJElIqjuGq_iB_g', 'INFLCR', 'NIL education and athlete brand support.', 'nil', 101, 1),
(6, 'channel', 'UCqb3-nd3XCjfJ1Kp2KKwFQg', 'Athletes Connected', 'Athlete wellness and mental-health programming.', 'mental-health', 101, 1),
(7, 'channel', 'UCPa3SKhLfB4sFMFnenBp0YA', 'Jed Foundation', 'Mental-health resources relevant to college students and staff.', 'mental-health', 101, 1),
(8, 'channel', 'UCrPx4Y9pY6E6D_PMRxCk2Aw', 'Headspace', 'Mindfulness and mental-health support content.', 'mental-health', 101, 1),
(9, 'channel', 'UCx2oNzN5PEECnYNvxypxdog', 'Simon Sinek', 'Leadership, purpose, and team-building content.', 'leadership', 101, 1),
(10, 'channel', 'UCfiwagBgPMIXCCWJVUJFIjlg', 'N4A NFCA', 'Academic and professional development for athletics staff.', 'academic', 101, 1),
(11, 'channel', 'UCBmS9S97CEU5zybnRqGTzdw', 'NACDA', 'Athletic administration and leadership content.', 'leadership', 101, 1),
(12, 'channel', 'UC_wAT-GlU5h1rP2TPBKF8PA', 'Toledo Rockets', 'Official Toledo Athletics YouTube channel.', 'general', 101, 1),
(13, 'channel', 'UCL8w_A8p8P1HWI3k6PR5Z6w', 'Two Cents (PBS)', 'Financial literacy content useful for NIL support.', 'nil', 101, 1);

-- ============================================================
-- SAMPLE TIPS
-- ============================================================
DELETE FROM Tips;

INSERT INTO Tips (id, author_id, category_id, title, content, tags, status, reviewed_by, approved_at) VALUES
(1, 100, 7, 'Parking Pro Tip: First Day Arrival', 'Arrive at least 30 minutes early on your first day. The lots near Savage Arena fill up fast before 9am. If you do not have your A permit yet, use the C permit daily option through ParkUToledo.', 'parking,first-day,savage-arena', 'approved', 101, CURRENT_TIMESTAMP),
(2, 100, 6, 'UTAD First, MFA Second, Everything Else Third', 'The fastest path is Rocket ID to UTAD activation to Microsoft Authenticator to MyUT. Skipping MFA setup early tends to create access friction across payroll and employee systems.', 'utad,mfa,it,myut', 'approved', 101, CURRENT_TIMESTAMP),
(3, 100, 5, 'Benefits Deadline Is Not Soft', 'You have 30 days to elect or waive benefits. Declining coverage still requires action in MyUT; silence is not a waiver.', 'benefits,hr,deadline,30-day', 'approved', 101, CURRENT_TIMESTAMP),
(4, 100, 2, 'When Compliance Is Unclear, Call Before You Act', 'If a recruiting, NIL, booster, or eligibility action feels even slightly uncertain, call Compliance before you do anything. Prevention is easier than remediation.', 'compliance,ncaa,booster,nil', 'approved', 101, CURRENT_TIMESTAMP),
(5, 100, 9, 'Best Quick Lunch Circuit Near Campus', 'For a fast lunch, Gateway Plaza is the easiest campus-adjacent option. For off-campus options, Old Orchard and Secor corridor spots are practical on a workday.', 'food,lunch,campus,toledo', 'approved', 101, CURRENT_TIMESTAMP),
(6, 100, 6, 'Direct Deposit and Tax Setup Belong on Day One', 'Once UTAD and MFA are working, go straight into MyUT to verify direct deposit and tax setup. That closes one of the most common onboarding gaps.', 'payroll,direct-deposit,myut,taxes', 'approved', 101, CURRENT_TIMESTAMP),
(7, 100, 4, 'Use Official Work Email Only for Athletics Business', 'Do not route onboarding or student-related work through personal email. Use official @utoledo.edu accounts for business records, security, and compliance.', 'email,security,ferpa,workflows', 'approved', 101, CURRENT_TIMESTAMP),
(8, 100, 3, 'Branding Has Two Blue Standards', 'Athletics branding and University marketing materials do not always use the same blue hex value. Check whether the asset is Athletics-facing or University-wide before publishing.', 'branding,design,athletics,marketing', 'approved', 101, CURRENT_TIMESTAMP);

-- ============================================================
-- BRANDING TOKENS
-- ============================================================
DELETE FROM BrandingTokens;

INSERT INTO BrandingTokens (id, token_group, token_key, token_value, format, description, display_order) VALUES
(1, 'font', 'primary_typeface', 'Poppins', 'font-family', 'Official University brand typeface.', 1),
(2, 'voice', 'campaign', 'Power To Do', 'text', 'University-level brand positioning phrase.', 1),
(3, 'voice', 'approved_identifiers', 'The University of Toledo|Toledo Rockets|Toledo Athletics|Toledo|Rockets|UToledo', 'pipe-list', 'Approved identifiers for institutional use.', 2),
(4, 'voice', 'avoid_identifiers', 'UT|UT Rockets|Toledo Rockets Football|Lady Rockets', 'pipe-list', 'Examples of disallowed or discouraged naming.', 3),
(5, 'color_university', 'midnight_blue', '#003E7E', 'hex', 'University-wide midnight blue.', 1),
(6, 'color_university', 'gold', '#FFD200', 'hex', 'University-wide gold.', 2),
(7, 'color_athletics', 'midnight_blue', '#0B2240', 'hex', 'Athletics midnight blue.', 1),
(8, 'color_athletics', 'gold', '#FFCD00', 'hex', 'Athletics gold.', 2),
(9, 'color_secondary', 'dark_blue', '#000F3E', 'hex', 'Secondary dark blue.', 1),
(10, 'color_secondary', 'space_blue', '#102B5F', 'hex', 'Secondary space blue.', 2),
(11, 'color_secondary', 'azure', '#009CE5', 'hex', 'Secondary azure.', 3),
(12, 'color_accent', 'magenta', '#A2047D', 'hex', 'Accent magenta.', 1),
(13, 'color_accent', 'turquoise', '#168F9C', 'hex', 'Accent turquoise.', 2),
(14, 'color_tertiary', 'neutral_base', '#D3C1AE', 'hex', 'Neutral base tone.', 1),
(15, 'logo_rules', 'primary_logo_required', 'true', 'boolean', 'Primary athletic logo is the default mark for institutional and athletics use.', 1),
(16, 'logo_rules', 'secondary_logo_usage', 'Only after the primary logo has already established brand identity on the same asset.', 'text', 'Constraint for secondary mark usage.', 2),
(17, 'logo_rules', 'athletic_logo_clear_space', 'X = 1/4 logo height', 'rule', 'Athletic logo clear-space guidance.', 3),
(18, 'logo_rules', 'rocket_logo_clear_space', 'X = 1/3 logo height', 'rule', 'Rocket logo clear-space guidance.', 4);

-- ============================================================
-- QUICK LINKS
-- ============================================================
DELETE FROM QuickLinks;

INSERT INTO QuickLinks (id, title, url, category, audience, description, display_order, is_active) VALUES
(1, 'Welcome to UToledo', 'https://www.utoledo.edu/depts/hr/newemployees/welcome/', 'onboarding', 'all_staff', 'Primary HR onboarding entry point for new employees.', 1, 1),
(2, 'MyUT Portal', 'https://myut.utoledo.edu/', 'systems', 'all_staff', 'Primary portal for employee access and self-service.', 2, 1),
(3, 'Employee Self-Service Dashboard', 'https://myut.utoledo.edu/', 'systems', 'all_staff', 'Benefits, earnings, taxes, leave balances, and team information.', 3, 1),
(4, 'ParkUToledo', 'https://www.utoledo.edu/parkingservices/parkutoledo/', 'parking', 'all_staff', 'Parking permits, portal access, and parking information.', 4, 1),
(5, 'Payroll Department', 'https://www.utoledo.edu/depts/hr/employment/pdf/neo/online/Payroll.pdf', 'payroll', 'all_staff', 'Payroll orientation information and direct-deposit guidance.', 5, 1),
(6, 'Staff Directory', 'https://utrockets.com/staff-directory', 'directory', 'all_staff', 'Public athletics staff directory by office.', 6, 1),
(7, 'Toledo Athletics Branding', 'https://utrockets.com/sports/2023/3/30/toledo-athletics-branding', 'branding', 'communications', 'Athletics branding guide and downloadable marks.', 7, 1),
(8, 'University Marketing Toolkit', 'https://www.utoledo.edu/offices/marketing/toolkit/', 'branding', 'communications', 'University-wide branding toolkit and standards.', 8, 1),
(9, 'University Policy Directory', 'https://www.utoledo.edu/policies/', 'policies', 'all_staff', 'Central index for university policies.', 9, 1),
(10, 'Benefits and Retirement', 'https://www.utoledo.edu/depts/hr/total-rewards/benefits/', 'benefits', 'benefits_eligible', 'Benefits and retirement information for employees.', 10, 1),
(11, 'Winter Break Schedule', 'https://www.utoledo.edu/depts/hr/work-life-harmony/winter-break.html', 'calendar', 'all_staff', 'Official winter-break operational schedule.', 11, 1),
(12, 'IT Help Desk', 'https://www.utoledo.edu/it/', 'support', 'all_staff', 'Central IT support and technology help.', 12, 1),
(13, 'Rocket Card Office', 'https://www.utoledo.edu/administration/auxiliaryservices/rocketcard/', 'campus_access', 'all_staff', 'Rocket Card, campus identity, and related access info.', 13, 1),
(14, 'Facilities Work Control', 'https://www.utoledo.edu/facilities/', 'facilities', 'all_staff', 'Facilities and work order routing.', 14, 1),
(15, 'Toledo Rockets Exchange', 'https://utrockets.com/news/2025/9/29/toledo-athletics-partners-with-teamworks-influencer-to-launch-toledo-rockets-exchange-enhancing-nil-opportunities-for-student-athletes', 'nil', 'athletics_staff', 'NIL marketplace launch reference.', 15, 1),
(16, 'Toledo Athletics Strategic Vision', 'https://utrockets.com/news/2023/8/29/toledo-athletics-unveils-rise-together-a-strategic-vision-that-aims-to-elevate-the-program-into-national-prominence', 'strategy', 'leadership', 'Rise Together strategic vision page.', 16, 1);

-- ============================================================
-- KEY CONTACTS
-- ============================================================
DELETE FROM KeyContacts;

INSERT INTO KeyContacts (id, function_area, department, contact_name, title, email, phone, url, notes, is_active, display_order) VALUES
(1, 'Human Resources', 'Center for Administrative Support', NULL, NULL, 'HumanResourcesDepartment@utoledo.edu', '419-530-4747', NULL, 'Benefits, hiring, and onboarding support.', 1, 1),
(2, 'Facilities Management', 'Plant Operations Work Control Center', NULL, NULL, NULL, '419-530-1000', NULL, 'Maintenance and urgent facilities issues.', 1, 2),
(3, 'IT Help Desk', 'UT Information Technology', NULL, NULL, 'ithelpdesk@utoledo.edu', '419-530-2400', 'https://www.utoledo.edu/it/', 'Technology support and account issues.', 1, 3),
(4, 'Athletics Compliance', 'Compliance', 'Brian Lutz', 'Senior Associate Athletic Director for Compliance and Integrity', 'brian.lutz@utoledo.edu', '419-530-8496', NULL, 'Primary athletics compliance contact.', 1, 4),
(5, 'Athletics Communications', 'Communications', 'Paul Helgren', 'Associate Athletic Director of Communications', 'paul.helgren@utoledo.edu', '419-530-4918', NULL, 'Media, communications, and interview routing.', 1, 5),
(6, 'University Marketing and Communications', 'Marketing', 'Jen Sorgenfrei', 'Executive Director', 'utmarcom@utoledo.edu', '419-530-5546', NULL, 'University-level marketing and branding support.', 1, 6),
(7, 'Payroll Services', 'Office of the Controller', NULL, NULL, 'payroll@utoledo.edu', '419-530-8780', NULL, 'Payroll operations and pay-related questions.', 1, 7),
(8, 'Door Access and Security', 'Auxiliary Services', NULL, NULL, 'dooraccess@utoledo.edu', NULL, NULL, 'Badge and door access plan changes.', 1, 8),
(9, 'Brand Licensing', 'Marketing and Licensing', 'Kevin Taylor', 'Brand and Licensing Manager', 'kevin.taylor3@utoledo.edu', NULL, NULL, 'Trademark and licensing approvals.', 1, 9),
(10, 'HRIS Data Maintenance', 'Human Resources Information Systems', NULL, NULL, 'HRIS@utoledo.edu', NULL, NULL, 'Supervisor and reporting-line updates.', 1, 10);

-- ============================================================
-- SYSTEMS DIRECTORY
-- ============================================================
DELETE FROM SystemsDirectory;

INSERT INTO SystemsDirectory (id, system_name, category, access_url, login_notes, owner_department, support_contact, description, display_order, is_active) VALUES
(1, 'MyUT Portal', 'portal', 'https://myut.utoledo.edu/', 'Requires UTAD credentials and MFA.', 'University IT', 'ithelpdesk@utoledo.edu', 'Primary employee gateway into university systems.', 1, 1),
(2, 'Employee Self-Service Dashboard', 'hr', 'https://myut.utoledo.edu/', 'Available through MyUT employee tab after login.', 'Human Resources', 'HumanResourcesDepartment@utoledo.edu', 'Earnings, benefits, taxes, leave balances, and team data.', 2, 1),
(3, 'Microsoft 365', 'productivity', 'https://www.office.com/', 'Institutional account access via UTAD.', 'University IT', 'ithelpdesk@utoledo.edu', 'Outlook, Teams, OneDrive, Word, Excel, and related apps.', 3, 1),
(4, 'Blackboard Learn', 'learning', 'https://blackboard.utoledo.edu/', 'Available via direct sign-in or MyUT.', 'University IT', 'ithelpdesk@utoledo.edu', 'Learning management system used for course-related workflows.', 4, 1),
(5, 'TimeClock Plus', 'timekeeping', NULL, 'Uses UTAD credentials for supported employee groups.', 'Payroll', 'payroll@utoledo.edu', 'Time reporting and time-off workflow for applicable employees.', 5, 1),
(6, 'Teamworks', 'athletics_operations', 'https://teamworks.com/', 'Athletics-managed system access.', 'Athletics', 'brian.lutz@utoledo.edu', 'Athletics operating platform used across department workflows.', 6, 1),
(7, 'Teamworks Compliance / ARMS', 'compliance', 'https://teamworks.com/compliance/', 'Athletics-managed compliance access.', 'Compliance', 'brian.lutz@utoledo.edu', 'Recruiting, CARA logging, prospect visits, and compliance workflow support.', 7, 1),
(8, 'Teamworks GM', 'athletics_operations', 'https://teamworks.com/general-manager/', 'Athletics-managed access for roster, budget, and modern athletics operations.', 'Athletics', NULL, 'General manager functionality for revenue, roster, and transfer-era operations.', 8, 1),
(9, 'Toledo Rockets Exchange (INFLCR)', 'nil', 'https://utrockets.com/news/2025/9/29/toledo-athletics-partners-with-teamworks-influencer-to-launch-toledo-rockets-exchange-enhancing-nil-opportunities-for-student-athletes', 'Athletics-managed NIL-related platform.', 'Athletics / NIL', NULL, 'Marketplace and NIL support environment for student-athletes.', 9, 1),
(10, 'ParkUToledo', 'parking', 'https://www.utoledo.edu/parkingservices/parkutoledo/', 'No athletics-specific login required for public information; employee permit workflows may require authenticated access.', 'Parking Services', NULL, 'Parking permits, visitor rules, and parking guidance.', 10, 1),
(11, 'Rocket Card / Transact eAccounts', 'campus_access', 'https://www.utoledo.edu/administration/auxiliaryservices/rocketcard/', 'Requires identity setup via UTAD before issuance.', 'Auxiliary Services', 'dooraccess@utoledo.edu', 'Campus ID and mobile credential ecosystem.', 11, 1);

-- ============================================================
-- POLICY RESOURCES
-- ============================================================
DELETE FROM PolicyResources;

INSERT INTO PolicyResources (id, policy_code, title, category, applies_to, url, summary, display_order, is_active) VALUES
(1, '3364-25-07', 'New Employee Orientation', 'onboarding', 'new employees', 'https://www.utoledo.edu/policies/administration/humanresources/pdfs/3364_25_07_New_Employee_Orientation.pdf', 'Mandatory orientation policy for newly hired regular staff.', 1, 1),
(2, '3364-25-01', 'Standards of Conduct', 'conduct', 'all employees', 'https://www.utoledo.edu/policies/administration/humanresources/pdfs/3364_25_01_Standards_of_Conduct.pdf', 'Broad employee conduct expectations and disciplinary framing.', 2, 1),
(3, '3364-25-36', 'Vacation Policy', 'leave', 'employees', 'https://www.utoledo.edu/policies/administration/humanresources/pdfs/3364_25_36%20Vacation%20policy.pdf', 'Vacation accrual and usage guidance.', 3, 1),
(4, '3364-25-123', 'Leaves of Absence and Sick Leave Accrual', 'leave', 'employees', 'https://codes.ohio.gov/ohio-administrative-code/rule-3364-25-123', 'Sick leave accrual and leave-of-absence framing.', 4, 1),
(5, '3364-25-30', 'Family and Medical Leave Act', 'leave', 'eligible employees', 'https://www.utoledo.edu/policies/administration/humanresources/pdfs/3364_25_30_Family_and_Medical.pdf', 'FMLA eligibility, protections, and process requirements.', 5, 1),
(6, '3364-25-14', 'Inclement Weather or Other Emergency / Disaster', 'operations', 'all employees', 'https://www.utoledo.edu/policies/administration/humanresources/', 'Operational guidance for campus closures and essential functions.', 6, 1),
(7, '3364-25-18', 'Conflict of Interest and Nepotism', 'ethics', 'all employees', 'https://www.utoledo.edu/policies/administration/humanresources/', 'Conflict-of-interest and nepotism expectations under university and Ohio ethics framing.', 7, 1),
(8, '3364-30-20', 'Anti-Hazing', 'safety', 'students and employees', 'https://www.utoledo.edu/policies/', 'Zero-tolerance anti-hazing policy relevant to university organizations and athletics contexts.', 8, 1),
(9, NULL, 'FERPA and Confidentiality for Faculty and Staff', 'privacy', 'employees handling student data', 'https://www.utoledo.edu/offices/registrar/FERPA_faculty_staff.html', 'Guidance on student education record confidentiality.', 9, 1),
(10, NULL, 'Responsible Technology Use / Information Security', 'security', 'all employees', 'https://www.utoledo.edu/policies/', 'Technology-use expectations, account security, and sensitive information handling.', 10, 1),
(11, '3364-35-16', 'Compliance Rules Education and Training', 'athletics_compliance', 'athletics personnel', 'https://www.utoledo.edu/policies/athletics/pdfs/3364-35-16%20Compliance%20rules%20education%20and%20training.pdf', 'Athletics-specific rules education and training framework.', 11, 1);

-- ============================================================
-- SITE CONTENT INDEX
-- ============================================================
DELETE FROM SiteContentIndex;

INSERT INTO SiteContentIndex (source_type, source_id, source_title, content_text, section_path) VALUES
('article', 1, 'Executive Leadership and Organizational Structure', 'Bryan B. Blair leads Toledo Athletics as Vice President and Director of Athletics. Key executive leaders include Nicole Harris, Connor Whelan, Melissa DeAngelo, Brian Lutz, Josh Dittman, Paul Helgren, Tim Warga, Jillian Lehman, Brian Jones, and Michelle McDevitt.', 'Department Overview > Leadership'),
('article', 2, 'Rise Together Strategic Plan', 'The Rise Together strategic vision emphasizes recruiting and retaining teammates, student-athlete success, elevating the brand, enhancing Team Toledo engagement, growing resources, and investing in infrastructure.', 'Department Overview > Strategic Plan'),
('article', 3, 'Brand Standards and Naming Rules', 'Poppins is the official typeface. Athletics and University branding use different midnight blue values depending on context. Approved identifiers include The University of Toledo, Toledo Rockets, Toledo Athletics, Toledo, Rockets, and UToledo. Avoid UT, UT Rockets, Toledo Rockets Football, and Lady Rockets.', 'Branding > Identity Standards'),
('article', 4, 'Athletics Logo Rules', 'The primary athletic logo is the default mark. Secondary marks are only for assets where the primary mark has already established identity. Clear-space rules differ between the athletic logo and the rocket mark.', 'Branding > Logos'),
('article', 5, 'Pre-Arrival Onboarding Sequence', 'The onboarding path is Rocket ID to UTAD setup to MFA to MyUT access, followed by Rocket Card, parking, payroll, direct deposit, and tax setup.', 'Onboarding > Pre-Arrival'),
('article', 6, 'First 60 Days Checklist', 'Supervisors are expected to guide facility tours, team introductions, systems training, benefits completion, required training, and follow-up reviews during the first 60 days.', 'Onboarding > First 60 Days'),
('article', 7, 'Benefits and Retirement Deadlines', 'Employees generally have 30 days for benefits elections and eligible full-time employees have a 120-day window to elect an alternative retirement plan.', 'HR and Benefits > Deadlines'),
('article', 8, 'Core Systems and Access', 'Primary systems include MyUT, Employee Self-Service, Microsoft 365, Blackboard, TimeClock Plus, Teamworks, Teamworks Compliance / ARMS, Teamworks GM, and the Toledo Rockets Exchange.', 'Systems > Overview'),
('article', 9, 'Compliance and Booster Guidance', 'Athletics personnel must understand NCAA rules, booster restrictions, NIL boundaries, sports-wagering prohibitions, and the importance of routing unclear situations through compliance before acting.', 'Compliance > Core Rules'),
('article', 10, 'Privacy and Sensitive Information', 'Onboarding resources should not include SSNs, salary details, medical data, passwords, API keys, or private personal email addresses. FERPA and information-security rules govern the handling of protected student and employee data.', 'Privacy > Sensitive Information'),
('article', 11, 'Social Media and Brand Conduct', 'Athletics-facing communications should align with official brand standards. Social posts must avoid discriminatory, harassing, threatening, false, or security-compromising content.', 'Communications > Social Media'),
('article', 12, 'Mental Health and Student Support', 'Student-athlete support includes SASS, mental-health referral awareness, and career programming such as networking and NIL-related development events.', 'Student-Athlete Development > Support'),
('contact', 4, 'Athletics Compliance Contact', 'Brian Lutz is the primary athletics compliance contact and should be consulted before uncertain recruiting, NIL, or booster-related actions.', 'Contacts > Compliance'),
('contact', 5, 'Athletics Communications Contact', 'Paul Helgren leads athletics communications and is the key routing contact for media and communications matters.', 'Contacts > Communications'),
('system', 1, 'MyUT Portal', 'The MyUT Portal is the primary authenticated gateway for employee systems and self-service workflows.', 'Systems > Portal'),
('system', 7, 'Teamworks Compliance / ARMS', 'Teamworks Compliance / ARMS supports recruiting workflows, prospect visits, and CARA monitoring.', 'Systems > Compliance'),
('policy', 2, 'Standards of Conduct', 'The standards-of-conduct policy defines broad employee expectations and disciplinary baselines.', 'Policies > Conduct'),
('policy', 9, 'FERPA and Confidentiality for Faculty and Staff', 'FERPA guidance governs handling of student education records and limits disclosure without an authorized exception.', 'Policies > Privacy'),
('orgchart', 1, 'Bryan B. Blair', 'Vice President and Director of Athletics. Cabinet-level athletics leader.', 'Org Chart > Executive'),
('orgchart', 3, 'Nicole Harris', 'Deputy Athletic Director, Chief Operating Officer, and Senior Woman Administrator. Oversees major operational areas and selected sport administration responsibilities.', 'Org Chart > Executive'),
('orgchart', 6, 'Brian Lutz', 'Senior Associate Athletic Director for Compliance and Integrity. Leads compliance and related athletics rules governance.', 'Org Chart > Compliance'),
('orgchart', 10, 'Jillian Lehman', 'Associate Athletic Director for Student-Athlete Experience. Oversees student-athlete experience and support-related functions.', 'Org Chart > Student-Athlete Development');

-- ============================================================
-- AI LITERACY RUBRIC
-- ============================================================
INSERT OR REPLACE INTO AppConfig (key, value, updated_at) VALUES
('ai_assessment_rubric', '{
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
    "recruiting_compliance": {"label": "Recruiting Rules and Compliance", "weight": 1.0},
    "cara_logging": {"label": "CARA and Practice Logging", "weight": 0.9},
    "nil_basics": {"label": "NIL Fundamentals", "weight": 1.0},
    "mental_health_referral": {"label": "Mental Health Referral Awareness", "weight": 0.8},
    "booster_rules": {"label": "Booster Rules", "weight": 1.0},
    "hr_processes": {"label": "HR and Benefits Processes", "weight": 0.9},
    "it_setup": {"label": "IT and Account Setup", "weight": 0.8},
    "campus_navigation": {"label": "Campus Navigation and Access", "weight": 0.7},
    "general_compliance": {"label": "General Compliance Awareness", "weight": 0.9},
    "title_ix_basics": {"label": "Title IX Basics", "weight": 0.9},
    "ncaa_bylaws_deep": {"label": "Deep NCAA Bylaw Knowledge", "weight": 1.0},
    "arms_platform": {"label": "ARMS / Teamworks Compliance Fluency", "weight": 1.0},
    "nil_advanced": {"label": "Advanced NIL Governance", "weight": 1.0},
    "title_ix_advanced": {"label": "Advanced Title IX Understanding", "weight": 0.9},
    "booster_management": {"label": "Booster Management", "weight": 1.0},
    "sass_services": {"label": "SASS Services", "weight": 0.9},
    "mental_health_protocol": {"label": "Mental Health Protocols", "weight": 0.9},
    "eligibility_rules": {"label": "Eligibility Rules", "weight": 1.0},
    "career_development": {"label": "Career Development Support", "weight": 0.7},
    "academic_support": {"label": "Academic Support Workflows", "weight": 0.8},
    "facility_management": {"label": "Facility Management", "weight": 0.9},
    "event_operations": {"label": "Event Operations", "weight": 1.0},
    "campus_logistics": {"label": "Campus Logistics", "weight": 0.8},
    "parking_systems": {"label": "Parking Systems", "weight": 0.6}
  },
  "scoring_bands": {
    "beginner": [0, 39],
    "intermediate": [40, 74],
    "advanced": [75, 100]
  }
}', CURRENT_TIMESTAMP);
