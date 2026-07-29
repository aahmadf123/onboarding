-- ============================================================
-- Seed V3 — Researched content refresh (June 2026 feedback round)
-- Verified against live UToledo / ParkUToledo / Resend sources.
-- Run AFTER db/migrations/0003_auth_tasks_email.sql:
--   npx wrangler d1 execute toledo-onboarding-db-prod --remote --file=../db/seed-v3.sql
--
-- Idempotent: UPDATEs key on titles/slugs; INSERTs are guarded.
-- Going forward, day-to-day edits happen in the Admin CMS — seed files
-- are for bootstrap and bulk refreshes only.
-- ============================================================

-- ============================================================
-- ARTICLE UPDATES (existing rows, keyed by title)
-- ============================================================

-- Rocket Card: correct contact (rocketcard@, not dooraccess@), add office
-- locations with embedded maps, 48-hour note, first-card-free.
UPDATE Articles SET current_content =
'The Rocket Card is your physical and digital identity credential at UToledo. Your first badge is **free**.

ACCOUNT SETUP (do this first):
Before requesting your Rocket Card, create or activate your UTAD account at https://myutaccount.utoledo.edu/

- New hires: use "New Account Creation/Activation" — you will need the Rocket Number (R + 8 digits) emailed by your HR Consultant/Specialist: https://myutaccount.utoledo.edu/Home/NewAccount
- Rehires / returning employees: use the password reset flow instead: https://myutaccount.utoledo.edu/Home/PasswordReset
- Manage account services (once activated): https://myutaccount.utoledo.edu/UTAD/ManageServices

REQUESTING YOUR ROCKET CARD:
1. Activate your UTAD account and set up MFA (allow up to 48 hours after activation)
2. Log into the MyUT portal (https://myut.utoledo.edu) → Employee tab → **Other Services** → "Request New/Replacement Rocket Card"
3. Review your information, pick a pickup location, and upload a compliant photo (follow the photo guidelines carefully — rejections are common)
4. You get an email confirmation when the request is submitted and another when the card is ready

WHERE TO PICK IT UP:

**Main Campus — Rocket Card Office, Thompson Student Union Room 1560** (Mon–Fri 8:00 a.m.–4:30 p.m.)

::map https://www.google.com/maps?q=Thompson+Student+Union,+University+of+Toledo,+Toledo,+OH&output=embed

**Health Science Campus — Mulford Library basement, Security window Room 007** (3000 Arlington Ave, Toledo, OH 43614)

::map https://www.google.com/maps?q=Mulford+Library,+3000+Arlington+Ave,+Toledo,+OH+43614&output=embed

QUESTIONS: rocketcard@utoledo.edu or 419-530-5842. Replacement cards carry a fee (cash or check only).

ROCKET MOBILE ID (keep your ID on your phone):
1. Download the **Transact eAccounts** app on your smartphone
2. Sign in with your UTAD credentials (MFA must be enabled)
3. Provision your Rocket Mobile ID into Apple Wallet or Google Wallet
4. Tap your phone or watch at campus readers for buildings, athletic facilities, dining, and library checkout

Mobile ID information: https://www.utoledo.edu/rocketcard/rocket-mobile-id/
Rocket Card FAQ: https://www.utoledo.edu/rocketcard/faq.html',
last_updated = CURRENT_TIMESTAMP
WHERE title = 'Getting Your Rocket Card & Mobile ID';

-- Benefits: verified providers, EAP detail, contacts, links.
UPDATE Articles SET current_content =
'YOU HAVE EXACTLY 30 DAYS FROM YOUR START DATE TO ELECT OR WAIVE BENEFITS.

If you miss this deadline, you forfeit coverage until the next annual open enrollment period or a qualifying life event. There are no exceptions.

WHAT TO ENROLL IN (2026 plan year):
- Medical — Medical Mutual SuperMed network in Ohio (Cigna network outside Ohio); the university covers roughly 80% of premiums
- Dental — Delta Dental of Ohio (Blue and Gold plan options; PPO network is most cost-effective)
- Vision — see the current plan details on the benefits site
- Life & AD&D — employer-paid basic coverage through Unum; submit voluntary elections AND beneficiary designations within the same 30 days
- Flexible Spending Account (use-it-or-lose-it) or Health Savings Account (carries over, pairs with the high-deductible plan)

HOW TO ENROLL:
Log into the MyUT portal and navigate to Benefits. You must upload supporting documentation for any dependents you are adding (marriage certificates, birth certificates, etc.).

IMPORTANT: Even if you are declining coverage (e.g., because you are on a spouse''s plan), you must actively decline within 30 days. Inaction is not the same as declining.

EMPLOYEE ASSISTANCE PROGRAM (EAP) — AllOne Health: 800-227-6007, available 24/7. Up to five free, confidential counseling sessions per issue per 12 months for you, your dependents, and household members.

TUITION WAIVER: benefit-eligible employees get undergraduate tuition waived (after probation); spouses and dependents become eligible after one year of service (graduate coursework waived at 50%). Request it through the Benefits section of MyUT.

QUESTIONS: benefits@utoledo.edu or 419-530-4747 (HR — Center for Administrative Support, 2935 E. Rocket Dr.)

Benefits home: https://www.utoledo.edu/depts/hr/total-rewards/benefits/
New-hire benefits guide: https://www.utoledo.edu/depts/hr/total-rewards/benefits/new-hire.html
New Employee Benefits Overview (video): https://youtu.be/LWU4FZiIx8Q',
last_updated = CURRENT_TIMESTAMP
WHERE title = '30-Day Deadline — Benefits Enrollment (DO NOT MISS)';

-- Retirement: verified plan structure, percentages, vendors.
UPDATE Articles SET current_content =
'You have 120 days from your hire date to finalize your retirement plan election. Ohio public employees do NOT pay into Social Security — your state retirement plan takes its place (Medicare still applies), so this choice matters.

YOUR MANDATORY PLAN:
- Staff positions → **OPERS** (Ohio Public Employees Retirement System): you contribute 10% of salary; the university contributes about 14%
- Faculty positions → **STRS** (State Teachers Retirement System)

THE 120-DAY CHOICE — ALTERNATIVE RETIREMENT PLAN (ARP):
Eligible full-time employees may opt out of OPERS/STRS into the ARP, a defined-contribution 401(a) plan where the employer share is 100% vested from day one. Approved ARP vendors: **TIAA, Voya, Corebridge, and Fidelity**. If you do nothing within 120 days, you stay in OPERS/STRS — which can be the right choice; review both before deciding.

STEPS:
1. Review the plan options for your employee classification: https://www.utoledo.edu/depts/hr/total-rewards/retirement/
2. If electing the ARP, open an account with your chosen vendor
3. Submit the election form to the Benefits office within 120 days of hire

OPTIONAL EXTRA SAVINGS (any time):
Supplemental 403(b) and 457(b) plans (TIAA and Ohio Deferred Compensation) are available on top of your mandatory plan; manage them via Retirement@Work.

Missing this deadline has long-term financial consequences. Set a calendar reminder now.

Your hiring manager should conduct formal 30, 60, and 90-day check-in meetings to review your performance and onboarding experience.',
last_updated = CURRENT_TIMESTAMP
WHERE title = '120-Day Deadline — Retirement Plan Elections';

-- Compliance training: Vector LMS is the actual platform.
UPDATE Articles SET current_content =
'Compliance training is delivered through **Vector LMS** (Vector Solutions) and must be completed within your first 30 days.

HOW TO ACCESS VECTOR LMS:
- MyUT portal → Employee tab → **Training and Career Development** section, or
- Directly at https://utoledo-oh.vectorlmsedu.com (sign in with your UTAD credentials)
- Use Chrome or Firefox; each course takes about an hour

REQUIRED COURSES:
1. Building Supportive Communities: Clery Act and Title IX — all UToledo employees (refreshed every other year)
2. HIPAA — Health Science Campus employees and anyone handling health information (annual)
3. Medicare Fraud, Waste & Abuse — HSC and clinical-area staff
4. NCAA Compliance Acknowledgment — all athletics staff (assigned by the department)
5. Employee Compliance Guide Acknowledgment — all athletics staff

Completion is tracked by HR and the compliance office. Failure to complete on time will be flagged to your supervisor.

Compliance training overview: https://www.utoledo.edu/offices/internalaudit/institutional-compliance/compliancetraining.html',
last_updated = CURRENT_TIMESTAMP
WHERE title = 'Mandatory Training Modules — First 30 Days';

-- Parking: 2025-26 verified rates, enforcement, citations/appeals, contact.
UPDATE Articles SET current_content =
'Parking on both campuses is managed by **ParkUToledo** (info@parkutoledo.com, 419-530-4100). Enforcement uses license-plate recognition — your plate IS your permit, so keep your vehicle info current.

PERMIT TYPES & 2025-26 RATES:
- **"A" Permit (faculty/staff)** — $329/year or $110/semester. Closer lots; required when using disability spaces (with a state placard). Standard for full-time athletics staff. Pre-tax payroll deduction is available (under $13 per paycheck for 12-month employees).
- **"U" Permit (CWA/AFSCME/FOP bargaining units)** — negotiated rate; see your collective bargaining agreement. Lots may be farther from buildings.
- **"C" Permit (guest/daily)** — $6.20/day or $62.50/month, white-lined spaces
- Metered/hourly — $1.35–$2.50/hour via the ParkMobile app
- "E" Permit (Executive) — senior leadership only; confirm current pricing with ParkUToledo

HOW TO PURCHASE:
Register your vehicle through MyUT → Other Services → "Request/Update Parking Permit", or directly at https://vpermit.com/parkutoledo/. Allow up to 48 hours after UTAD activation. Until your A permit is active, a daily C permit is the safe play.

ENFORCEMENT:
7 a.m.–10 p.m. Mon–Fri and 9 a.m.–5 p.m. weekends, year-round — including between semesters and on breaks. No grace period. If you register two vehicles, do not have both on campus within the same 3-hour window or both can be ticketed.

CITATIONS & APPEALS:
Tickets can run around $50 per violation (see https://www.parkutoledo.com/citations for the current fine schedule). Pay or appeal through the "My Citations" section of your parking account. **Appeals must be filed within 30 days** — after that, appeal rights are forfeited. One citation per appeal form.

EV CHARGING: stations in Areas 20, 2, 31, 25 and the East Ramp garage (ChargePoint app; charging fee plus hourly parking).',
last_updated = CURRENT_TIMESTAMP
WHERE title = 'Parking Permits — What You Need & How to Get It';

-- ============================================================
-- NEW ARTICLES
-- ============================================================

-- HR & Benefits (category 5)
INSERT INTO Articles (category_id, title, current_content)
SELECT 5, 'Employment & Income Verification (JobTrax)',
'UToledo does NOT handle employment or income verification through HR or Payroll — everything runs through **JobTrax** at https://www.verifyjobhistory.com (UToledo company code: **2419**).

EMPLOYMENT VERIFICATION (VOE) — for landlords, lenders, agencies:
Point the verifier to www.verifyjobhistory.com with company code 2419 and either your Rocket Number or your full name and date of birth.

INCOME VERIFICATION (VOI) — you control access to salary data:
1. Log into www.verifyjobhistory.com yourself
2. Generate an authorization code
3. Give that code to the verifier — they use it to pull your income information

Official page: https://www.utoledo.edu/offices/controller/payroll/employment%20verifications.html
Payroll questions: payroll@utoledo.edu or 419-530-8780'
WHERE NOT EXISTS (SELECT 1 FROM Articles WHERE title = 'Employment & Income Verification (JobTrax)');

INSERT INTO Articles (category_id, title, current_content)
SELECT 5, 'MyUT Self-Service: Direct Deposit, W-4 & Emergency Contacts',
'Three MyUT portal tasks every new employee must handle. Log in at https://myut.utoledo.edu with your UTAD credentials and open the **Employee tab**.

DIRECT DEPOSIT (mandatory — pay is issued only by direct deposit):
Employee tab → Pay Details & Leave Balances → **Direct Deposit Information**. Set this up immediately after activating UTAD/MFA. Issues? payroll@utoledo.edu or 419-530-8780.

W-4 FEDERAL TAX WITHHOLDING:
Employee tab → Pay Details & Leave Balances → **Tax Forms**. Once you have received your first paycheck, you can update your federal exemptions or allocations here at any time. Issues? payroll@utoledo.edu or 419-530-8780.

EMERGENCY CONTACTS:
Personal/Office Information → **Update Emergency Contacts**. While you are there, use "Update Office Address & Phone Numbers" to add your cell number (digits only) so you receive **UT Alert** emergency notifications.

PAY STUBS & LEAVE BALANCES:
The same Pay Details & Leave Balances section shows every pay stub and your current leave accruals.'
WHERE NOT EXISTS (SELECT 1 FROM Articles WHERE title = 'MyUT Self-Service: Direct Deposit, W-4 & Emergency Contacts');

INSERT INTO Articles (category_id, title, current_content)
SELECT 5, 'Union Membership & Collective Bargaining Agreements',
'Several UToledo employee groups are represented by unions. If your position is in a bargaining unit, YOU are responsible for knowing the contents of your collective bargaining agreement (CBA) — you can view, download, or print it any time.

ALL AGREEMENTS: https://www.utoledo.edu/depts/hr/labor-relations/laboragreements.html

UNIONS AT UTOLEDO:
- **CWA Local 4319** — clerical, maintenance, and custodial staff (mainly Main Campus)
- **AFSCME** (Ohio Council 8 / Local 2415) — roughly 1,900 Health Science Campus employees
- **FOP** (Ohio Labor Council) and **UTPPA** — police and public safety personnel
- **AAUP** — tenured/tenure-track faculty and lecturers

Why it matters day to day: your CBA can set negotiated parking rates ("U" permit), pay scales, scheduling rules, and grievance procedures. Questions go to HR Labor Relations via humanresourcesdepartment@utoledo.edu or 419-530-4747.'
WHERE NOT EXISTS (SELECT 1 FROM Articles WHERE title = 'Union Membership & Collective Bargaining Agreements');

-- IT & Campus Access (category 6)
INSERT INTO Articles (category_id, title, current_content)
SELECT 6, 'IT Help Desk & Getting Tech Support',
'Phones are answered 24/7 (staffed live 9 a.m.–5 p.m. Mon–Fri; after-hours calls are answered in order received).

MAIN CAMPUS IT HELP DESK: **419-530-2400**
HEALTH SCIENCE CAMPUS IT HELP DESK: **419-383-2400**
UTAD / MyUT ACCOUNT ISSUES: **419-530-3005** (if your new account is not working by the next day, call this line)
EMAIL: ithelpdesk@utoledo.edu
WEB: https://www.utoledo.edu/it/

WALK-UP SUPPORT:
- Main Campus: Information Commons, Carlson Library (personal devices; call 419-530-4563 before visiting)
- Health Science Campus: Dowling Hall Room 025 (Mon–Fri 8:30 a.m.–5 p.m.)

ATHLETICS IT CONTACT:
For department-specific systems and AV in athletics facilities, contact the Athletics IT liaison (see Key Contacts — "Athletics IT"). For everything UTAD/email/MyUT related, the central Help Desk above is fastest.'
WHERE NOT EXISTS (SELECT 1 FROM Articles WHERE title = 'IT Help Desk & Getting Tech Support');

INSERT INTO Articles (category_id, title, current_content)
SELECT 6, 'HSC Proxy Card — Door Access at the Health Science Campus',
'Health Science Campus employees need a proxy card for door access (this is separate from your Rocket Card).

HOW TO REQUEST:
1. Log into MyUT → Employee tab → **Other Services** → "Request Door Access for HSC Proxy Card"
2. Allow about 48 hours for processing
3. Pick up your card at the HSC Security Office — Mulford Library basement, Room 007 (bring your Rocket Card as ID)

::map https://www.google.com/maps?q=Mulford+Library,+3000+Arlington+Ave,+Toledo,+OH+43614&output=embed

For athletics-facility door access plans (Savage Arena, Larimer, etc.), badge and access changes go through the athletics front office — see Key Contacts ("Door Access and Security") or email dooraccess@utoledo.edu.'
WHERE NOT EXISTS (SELECT 1 FROM Articles WHERE title = 'HSC Proxy Card — Door Access at the Health Science Campus');

-- ============================================================
-- TASK REFRESH + NEW TASKS
-- ============================================================

-- The Rocket Card office doesn't activate UTAD; fix the day-one task copy.
UPDATE Tasks SET
  title = 'Get Your UTAD Account & Rocket Card',
  description = 'Activate your UTAD account at myutaccount.utoledo.edu using the Rocket Number (R + 8 digits) emailed by HR — new hires use "New Account Creation/Activation", rehires use the password reset flow. Then request your Rocket Card in MyUT (Other Services) and pick it up at Thompson Student Union RM 1560 (Main) or Mulford Library RM 007 (HSC). First card is free. You can also add it to Apple/Google Wallet via the Transact eAccounts app.'
WHERE slug = 'rocket-id';

INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('emergency-contacts', 'first-week', 'Add Emergency Contacts & UT Alert Number', 'In MyUT under Personal/Office Information, click "Update Emergency Contacts" to designate your contacts, and add your cell number under "Update Office Address & Phone Numbers" so you receive UT Alert emergency notifications.', 'required', 5, 'all', 'category', '5');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('w4-review', 'first-month', 'Review Your W-4 After Your First Paycheck', 'Once your first paycheck lands, open MyUT → Employee tab → Pay Details & Leave Balances → Tax Forms and confirm your federal withholding/allocations are what you intended. Contact payroll@utoledo.edu or 419-530-8780 with issues.', 'recommended', 5, 'all', 'category', '5');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('hsc-proxy-card', 'first-week', 'Request HSC Proxy Card (HSC Staff Only)', 'If you work on the Health Science Campus, request door access via MyUT → Other Services → "Request Door Access for HSC Proxy Card" (about 48 hours to process), then pick it up at HSC Security, Mulford Library basement Room 007.', 'optional', 6, 'all', 'category', '6');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('cba-review', 'first-month', 'Review Your Collective Bargaining Agreement', 'Bargaining-unit employees (CWA, AFSCME, FOP/UTPPA, AAUP): you are responsible for the contents of your CBA — it covers your negotiated parking rate, pay scale, scheduling, and grievance rights. Find yours at utoledo.edu/depts/hr/labor-relations/laboragreements.html.', 'optional', 6, 'all', 'category', '5');
INSERT OR IGNORE INTO Tasks (slug, phase, title, description, priority, display_order, audience, link_view, link_param) VALUES
('employment-verification', 'first-90-days', 'Know How Employment Verification Works', 'When a landlord or lender needs proof of employment or income, point them to verifyjobhistory.com (JobTrax, company code 2419). For income verification you log in yourself and generate an authorization code — HR/Payroll no longer process these requests directly.', 'optional', 5, 'all', 'category', '5');

-- ============================================================
-- KEY CONTACTS (guarded inserts; all editable later in the CMS)
-- ============================================================

INSERT INTO KeyContacts (function_area, department, contact_name, title, email, phone, url, notes, display_order)
SELECT 'Athletics IT', 'Athletics', 'JJ', 'Athletics IT Liaison', NULL, 'TBD — update in Admin → Content → Contacts', NULL, 'Department-level IT support for athletics systems and facilities. For UTAD/email/MyUT issues use the central IT Help Desk (419-530-2400).', 35
WHERE NOT EXISTS (SELECT 1 FROM KeyContacts WHERE function_area = 'Athletics IT');

INSERT INTO KeyContacts (function_area, department, contact_name, title, email, phone, url, notes, display_order)
SELECT 'IT Help Desk — Health Science Campus', 'Information Technology', 'IT Help Desk (HSC)', '24/7 phone support', 'ithelpdesk@utoledo.edu', '419-383-2400', 'https://www.utoledo.edu/it/', 'Walk-up: Dowling Hall RM 025, Mon–Fri 8:30–5. UTAD/MyUT account issues: 419-530-3005.', 36
WHERE NOT EXISTS (SELECT 1 FROM KeyContacts WHERE function_area = 'IT Help Desk — Health Science Campus');

INSERT INTO KeyContacts (function_area, department, contact_name, title, email, phone, url, notes, display_order)
SELECT 'Rocket Card Office', 'Auxiliary Services', 'Rocket Card Office', 'ID badges & Rocket Mobile ID', 'rocketcard@utoledo.edu', '419-530-5842', 'https://www.utoledo.edu/rocketcard/', 'Thompson Student Union RM 1560, Mon–Fri 8:00–4:30. HSC pickup: Mulford Library RM 007. First badge free.', 37
WHERE NOT EXISTS (SELECT 1 FROM KeyContacts WHERE function_area = 'Rocket Card Office');

INSERT INTO KeyContacts (function_area, department, contact_name, title, email, phone, url, notes, display_order)
SELECT 'Parking (ParkUToledo)', 'ParkUToledo', 'ParkUToledo', 'Permits, citations & appeals', 'info@parkutoledo.com', '419-530-4100', 'https://www.parkutoledo.com/', '2801 W. Bancroft St., MS 107. Citation appeals must be filed within 30 days.', 38
WHERE NOT EXISTS (SELECT 1 FROM KeyContacts WHERE function_area = 'Parking (ParkUToledo)');

INSERT INTO KeyContacts (function_area, department, contact_name, title, email, phone, url, notes, display_order)
SELECT 'Benefits (HR Total Rewards)', 'Human Resources', 'Benefits Office', 'Enrollment, retirement & tuition waiver', 'benefits@utoledo.edu', '419-530-4747', 'https://www.utoledo.edu/depts/hr/total-rewards/benefits/', 'Center for Administrative Support, 2935 E. Rocket Dr. New hires: 30-day enrollment deadline; 120-day retirement election.', 39
WHERE NOT EXISTS (SELECT 1 FROM KeyContacts WHERE function_area = 'Benefits (HR Total Rewards)');

INSERT INTO KeyContacts (function_area, department, contact_name, title, email, phone, url, notes, display_order)
SELECT 'Employment & Income Verification', 'Payroll / JobTrax', 'JobTrax (verifyjobhistory.com)', 'Automated verification service', 'payroll@utoledo.edu', '419-530-8780', 'https://www.verifyjobhistory.com', 'Company code 2419. Income verification: employee logs in and generates an authorization code for the verifier.', 40
WHERE NOT EXISTS (SELECT 1 FROM KeyContacts WHERE function_area = 'Employment & Income Verification');

-- ============================================================
-- QUICK LINKS (guarded inserts)
-- ============================================================

INSERT INTO QuickLinks (title, url, category, audience, description, display_order)
SELECT 'Vector LMS (Compliance Training)', 'https://utoledo-oh.vectorlmsedu.com', 'Training', 'All Staff', 'Required compliance training — also reachable via MyUT → Employee tab → Training and Career Development. Complete within 30 days of start.', 20
WHERE NOT EXISTS (SELECT 1 FROM QuickLinks WHERE title = 'Vector LMS (Compliance Training)');

INSERT INTO QuickLinks (title, url, category, audience, description, display_order)
SELECT 'HR — New Employees Welcome', 'https://www.utoledo.edu/depts/hr/employment/newemployees.html', 'HR', 'New Hires', 'The university''s official new-employee checklist: UTAD/email setup, W-4, direct deposit, Rocket Card, parking, emergency contacts.', 21
WHERE NOT EXISTS (SELECT 1 FROM QuickLinks WHERE title = 'HR — New Employees Welcome');

INSERT INTO QuickLinks (title, url, category, audience, description, display_order)
SELECT 'New Hire Forms (HR)', 'https://www.utoledo.edu/depts/hr/employment/newhireforms.html', 'HR', 'New Hires', 'I-9, federal and Ohio W-4, direct deposit, and the other paperwork HR needs before/at your start.', 22
WHERE NOT EXISTS (SELECT 1 FROM QuickLinks WHERE title = 'New Hire Forms (HR)');

INSERT INTO QuickLinks (title, url, category, audience, description, display_order)
SELECT 'New-Hire Benefits Enrollment', 'https://www.utoledo.edu/depts/hr/total-rewards/benefits/new-hire.html', 'HR', 'New Hires', '30-day enrollment window, plan documents, and required dependent documentation.', 23
WHERE NOT EXISTS (SELECT 1 FROM QuickLinks WHERE title = 'New-Hire Benefits Enrollment');

INSERT INTO QuickLinks (title, url, category, audience, description, display_order)
SELECT 'New Employee Benefits Overview (video)', 'https://youtu.be/LWU4FZiIx8Q', 'HR', 'New Hires', 'HR''s video walkthrough of new-hire benefits. (Title to confirm — editable in Admin → Content.)', 24
WHERE NOT EXISTS (SELECT 1 FROM QuickLinks WHERE title = 'New Employee Benefits Overview (video)');

INSERT INTO QuickLinks (title, url, category, audience, description, display_order)
SELECT 'Retirement Plans (OPERS/STRS/ARP)', 'https://www.utoledo.edu/depts/hr/total-rewards/retirement/', 'HR', 'All Staff', 'Mandatory state retirement membership, the 120-day ARP election, and supplemental 403(b)/457(b) options.', 25
WHERE NOT EXISTS (SELECT 1 FROM QuickLinks WHERE title = 'Retirement Plans (OPERS/STRS/ARP)');

INSERT INTO QuickLinks (title, url, category, audience, description, display_order)
SELECT 'ParkUToledo', 'https://www.parkutoledo.com/', 'Campus', 'All Staff', 'Permit rates, citations and 30-day appeals, the interactive parking finder, and parking news.', 26
WHERE NOT EXISTS (SELECT 1 FROM QuickLinks WHERE title = 'ParkUToledo');

INSERT INTO QuickLinks (title, url, category, audience, description, display_order)
SELECT 'Employment Verification (JobTrax)', 'https://www.verifyjobhistory.com', 'HR', 'All Staff', 'Employment & income verification — company code 2419. HR/Payroll no longer process these directly.', 27
WHERE NOT EXISTS (SELECT 1 FROM QuickLinks WHERE title = 'Employment Verification (JobTrax)');

INSERT INTO QuickLinks (title, url, category, audience, description, display_order)
SELECT 'Collective Bargaining Agreements', 'https://www.utoledo.edu/depts/hr/labor-relations/laboragreements.html', 'HR', 'Bargaining Units', 'Current CWA, AFSCME, FOP/UTPPA, and AAUP contracts — view, download, or print your agreement.', 28
WHERE NOT EXISTS (SELECT 1 FROM QuickLinks WHERE title = 'Collective Bargaining Agreements');

-- ============================================================
-- SYSTEMS DIRECTORY (system_name is UNIQUE — plain INSERT OR IGNORE)
-- ============================================================

INSERT OR IGNORE INTO SystemsDirectory (system_name, category, access_url, login_notes, owner_department, support_contact, description, display_order)
VALUES ('Vector LMS', 'Training', 'https://utoledo-oh.vectorlmsedu.com', 'UTAD credentials; Chrome or Firefox recommended', 'Risk Management & Institutional Compliance', 'ithelpdesk@utoledo.edu', 'Compliance training platform (Clery/Title IX, HIPAA, Medicare FWA). Required courses due within 30 days of start; ~1 hour each.', 20);

INSERT OR IGNORE INTO SystemsDirectory (system_name, category, access_url, login_notes, owner_department, support_contact, description, display_order)
VALUES ('JobTrax (verifyjobhistory.com)', 'HR / Payroll', 'https://www.verifyjobhistory.com', 'Company code 2419; employees log in to generate income-verification authorization codes', 'Payroll', 'payroll@utoledo.edu', 'Automated employment & income verification for landlords, lenders, and agencies.', 21);

-- ============================================================
-- AI CHAT INDEX — refresh updated articles, add new ones
-- ============================================================

DELETE FROM SiteContentIndex WHERE source_type = 'article' AND source_title IN (
  'Getting Your Rocket Card & Mobile ID',
  '30-Day Deadline — Benefits Enrollment (DO NOT MISS)',
  '120-Day Deadline — Retirement Plan Elections',
  'Mandatory Training Modules — First 30 Days',
  'Parking Permits — What You Need & How to Get It',
  'Employment & Income Verification (JobTrax)',
  'MyUT Self-Service: Direct Deposit, W-4 & Emergency Contacts',
  'Union Membership & Collective Bargaining Agreements',
  'IT Help Desk & Getting Tech Support',
  'HSC Proxy Card — Door Access at the Health Science Campus'
);

INSERT INTO SiteContentIndex (source_type, source_id, source_title, content_text, section_path)
SELECT 'article', a.id, a.title, a.title || char(10) || substr(COALESCE(a.current_content, ''), 1, 8000),
       COALESCE(c.name, 'Articles') || ' > ' || a.title
FROM Articles a LEFT JOIN Categories c ON c.id = a.category_id
WHERE a.title IN (
  'Getting Your Rocket Card & Mobile ID',
  '30-Day Deadline — Benefits Enrollment (DO NOT MISS)',
  '120-Day Deadline — Retirement Plan Elections',
  'Mandatory Training Modules — First 30 Days',
  'Parking Permits — What You Need & How to Get It',
  'Employment & Income Verification (JobTrax)',
  'MyUT Self-Service: Direct Deposit, W-4 & Emergency Contacts',
  'Union Membership & Collective Bargaining Agreements',
  'IT Help Desk & Getting Tech Support',
  'HSC Proxy Card — Door Access at the Health Science Campus'
);
