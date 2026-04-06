-- ============================================================
-- Toledo Athletics Onboarding Platform - Database Seed File
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO Categories (name, description) VALUES
  ('Department Overview', 'Leadership, strategic vision, facilities, and organizational structure'),
  ('NCAA Compliance', 'NCAA bylaws, ARMS platform, booster relations, and sports wagering policy'),
  ('Title IX & Gender Equity', 'Federal compliance, reporting obligations, and transgender athlete inclusion'),
  ('NIL (Name, Image & Likeness)', 'NIL policies, Toledo Rockets Exchange (Teamworks Influencer), Campus Ink, and disclosure requirements'),
  ('HR & Benefits', 'Onboarding timeline, benefits elections, retirement plans, and work-life harmony'),
  ('IT & Campus Access', 'UTAD account, Rocket Card, Mobile ID, MFA, and essential apps'),
  ('Parking & Transportation', 'ParkUToledo permits, enforcement schedules, and campus maps'),
  ('Student-Athlete Development', 'SASS, academic support, mental health resources, and career development'),
  ('Relocation & Toledo Life', 'Relocation allowance, neighborhoods, dining, and local culture');


-- ============================================================
-- ARTICLES — Department Overview
-- ============================================================

INSERT INTO Articles (category_id, title, current_content) VALUES
(1, 'Executive Leadership & Organizational Structure',
'The University of Toledo Athletics Department is led by Bryan B. Blair, Vice President and Director of Athletics. Blair has positioned Toledo as a national leader in student-athlete empowerment, academic achievement, and technological innovation.

Nicole Harris serves as Deputy Athletic Director, Chief Operating Officer, and Senior Woman Administrator. She is the sport administrator for Football, Women''s Basketball, Women''s Swimming & Diving, and Women''s Rowing, and maintains oversight over academics, student-athlete development, and strength and conditioning. She is a primary point of contact for a large segment of incoming staff.

For a full staff directory, visit: https://utrockets.com/staff-directory');

INSERT INTO Articles (category_id, title, current_content) VALUES
(1, 'Rise Together Strategic Plan',
'The "Rise Together" strategic plan is a five-year roadmap that guides every decision made by the Athletics Department. All new employees are expected to align their daily work with this framework.

The acronym R.I.S.E. stands for: Resilience, Integrity, Servanthood, and Excellence.

The six strategic goals are:

1. Recruit, Retain, and Develop Teammates — Commitment to professional development, inclusive hiring, and retaining elite administrative and coaching talent.

2. Generate Student-Athlete Success — Maintaining record-setting cumulative GPAs, securing MAC Institutional Academic Awards, and fostering holistic personal development.

3. Elevate the Brand — All staff act as brand ambassadors, utilizing modern media, creative services, and social platforms to increase national prominence.

4. Enhance "Team Toledo" Engagement — Prioritizing community integration, fan experience, and leveraging facilities as community hubs.

5. Grow Resources — Innovative revenue generation, donor relations, ticketing strategies, and expansion of the Rocket Fund.

6. Invest in Infrastructure — Ongoing enhancement of athletic facilities, technology integration, and modernization of student-athlete environments.

Full documentation: https://utrockets.com/news/2023/8/29/toledo-athletics-unveils-rise-together-a-strategic-vision-that-aims-to-elevate-the-program-into-national-prominence');

INSERT INTO Articles (category_id, title, current_content) VALUES
(1, 'Athletic Facilities Directory',
'New hires must quickly learn the physical layout of Toledo Athletics. The three primary facilities are:

SAVAGE ARENA
The primary hub for the Athletics Department. Houses the main administrative offices, the ticket office, and serves as the operational core for basketball and volleyball.

LARIMER ATHLETIC COMPLEX
Designated for football operations, strength and conditioning, and Student-Athlete Support Services (SASS). If you are working with student-athletes academically or physically, this is your primary destination.

FINDLAY ATHLETIC COMPLEX
Houses locker rooms, equipment rooms, training rooms, and coaches'' offices for both Baseball and Softball at the Scott Park complex.

For campus maps and directions, visit: https://www.utoledo.edu/offices/communications/pdfs/map.pdf

Note: This campus map PDF was last updated in 2011 and may not reflect current building names or layouts. Contact Facilities at 419-530-1000 for current campus information.');


-- ============================================================
-- ARTICLES — NCAA Compliance
-- ============================================================

INSERT INTO Articles (category_id, title, current_content) VALUES
(2, 'Compliance Office & Mandatory Acknowledgments',
'The Office of Athletics Compliance is led by:
- Brian Lutz — Senior Associate AD for Compliance and Integrity

ALL new staff must complete two mandatory acknowledgments:
1. Digitally sign the Employee Compliance Guide (available through the compliance office)
2. Review and acknowledge the UT Athletics Compliance Manual

These are not optional. Failure to complete them creates institutional liability. Contact the compliance office immediately upon your start date to obtain these documents.

Compliance resources: https://www.utoledo.edu/offices/internalaudit/institutional-compliance/athletics.html');

INSERT INTO Articles (category_id, title, current_content) VALUES
(2, 'Core NCAA Bylaws Every Staff Member Must Know',
'The following NCAA bylaws govern your daily operations. Ignorance is never an acceptable defense for an infraction.

BYLAW 11 — Personnel Conduct
Governs staff conduct, employment restrictions, and outside income.

BYLAW 12 — Amateurism
Defines what activities preserve or jeopardize a student-athlete''s eligibility.

BYLAW 13 — Recruiting
Extensive restrictions on recruiting contacts, campus visits, printed materials, and communications. This bylaw is among the most frequently violated — review it carefully.

BYLAW 14 — Academic Eligibility
Governs GPA requirements, credit hours, and progress-toward-degree standards.

BYLAW 15 — Financial Aid
Regulates scholarship amounts, renewals, reductions, and cancellations.

BYLAW 16 — Permissible Benefits
Defines exactly what you may and may not provide to student-athletes (meals, apparel, transportation, etc.).

BYLAW 17 — Playing and Practice Seasons
Establishes strict limits on countable athletically related activities (CARA) by sport.

When in doubt about any action, contact the compliance office BEFORE acting, not after.');

INSERT INTO Articles (category_id, title, current_content) VALUES
(2, 'ARMS Platform — Compliance Tracking Software',
'All coaches and athletics staff are required to use the ARMS (Athletic Recruiting Management System) platform for compliance tracking.

ARMS is used for:
- Logging Countable Athletically Related Activities (CARA)
- Managing recruiting communications
- Processing official and unofficial prospect visits
- Maintaining compliance documentation

You must be trained on ARMS before conducting any recruiting activities. Contact the compliance office to schedule your ARMS training session.

The "Captain Integrity" training model uses scenario-based modules to help you understand complex compliance situations in an accessible format. These modules are mandatory and available through the compliance office.');

INSERT INTO Articles (category_id, title, current_content) VALUES
(2, 'Booster Relations Policy',
'Representatives of Athletics Interests (commonly called "boosters") are subject to strict NCAA regulations. Violations in this area carry severe penalties.

WHAT BOOSTERS CANNOT DO:
- Engage in off-campus recruiting activities on behalf of the university
- Utilize established relationships to advantage Toledo in recruiting prospective student-athletes
- Provide any benefit, gift, or favor to a prospective student-athlete or their family

YOUR RESPONSIBILITY:
If a booster contacts you about a recruit or asks you to facilitate any introduction, you must report it to the compliance office immediately.

When in doubt about any booster interaction, do not proceed without compliance office approval.

Reference: https://utrockets.com/sports/2015/3/17/GEN_2014010160');

INSERT INTO Articles (category_id, title, current_content) VALUES
(2, 'Sports Wagering — Absolute Prohibition',
'NCAA legislation imposes an ABSOLUTE PROHIBITION on sports wagering for all athletics department staff, coaches, and student-athletes.

This prohibition covers wagering on ANY intercollegiate, amateur, or professional sporting event in which the NCAA conducts a championship. This includes:
- March Madness brackets
- Bowl game pools
- Any bet placed through a sportsbook, app, or informal office pool involving NCAA sports

There are no exceptions. The consequences include termination of employment and permanent show-cause penalties.

All new staff must sign a digital attestation confirming they have read and understood this policy. This attestation is collected by the compliance office during your first week.');


-- ============================================================
-- ARTICLES — Title IX & Gender Equity
-- ============================================================

INSERT INTO Articles (category_id, title, current_content) VALUES
(3, 'Title IX Compliance — What Every Staff Member Must Know',
'Title IX is a federal law that prohibits sex discrimination in any educational program receiving federal financial assistance. As an athletics department employee, you have legal obligations under Title IX.

THE THREE-PART TEST FOR ATHLETICS COMPLIANCE:

1. Equitable Participation — Athletic participation opportunities for men and women must be substantially proportionate to their full-time undergraduate enrollment.

2. Equitable Financial Support — Athletic scholarship funding for male and female athletes must be proportional to their participation rates.

3. Equitable Treatment (The "Laundry List") — Male and female athletes must receive equivalent treatment in: equipment, scheduling, travel allowances, tutoring access, coaching quality, locker rooms, medical facilities, and publicity.

MANDATORY REPORTING:
All staff must immediately report any suspected sexual violence to the Title IX coordinator. There are no exceptions based on your role or relationship to the parties involved.

Title IX training is completed during the first 30 days of employment through mandatory compliance modules.');

INSERT INTO Articles (category_id, title, current_content) VALUES
(3, 'Transgender Student-Athlete Inclusion',
'The Athletics Department is committed to the safe and dignified inclusion of all student-athletes. When working with transgender student-athletes, staff must:

- Respect and use the student-athlete''s preferred name and pronouns at all times
- Maintain strict confidentiality regarding a student-athlete''s transgender status — this information is private medical/personal information
- Ensure safe and dignified access to appropriate facilities
- Never disclose a student-athlete''s status to others without explicit consent

Questions about specific situations should be directed to the compliance office or Nicole Harris (Deputy AD / SWA) before taking any action.');


-- ============================================================
-- ARTICLES — NIL
-- ============================================================

INSERT INTO Articles (category_id, title, current_content) VALUES
(4, 'NIL at Toledo — Overview & Current Ecosystem',
'The University of Toledo has been proactive in supporting student-athlete NIL opportunities. NIL education is mandatory for all staff.

KEY FACTS:
- Toledo has secured exclusive apparel partnerships through Campus Ink (official NIL licensee for merchandise, since May 2023)
- The department supports student-athletes in navigating NIL opportunities through the NIL Resource Center
- "Liftoff" was a 2021 NIL education program operated through Opendorse — it was an education initiative, not a collective
- "Friends of Rocky" was the official Toledo NIL collective, founded June 2022 as the first in the MAC — it is currently concluding operations
- The current NIL marketplace is the Toledo Rockets Exchange, powered by Teamworks Influencer (launched September 2025)

CURRENT NIL ECOSYSTEM:
- Toledo Rockets Exchange (Teamworks Influencer) — the active NIL marketplace for student-athletes
- Campus Ink — official NIL merchandise licensee
- Friends of Rocky collective — concluding operations

Reference: https://utrockets.com/news/2025/9/29/toledo-athletics-partners-with-teamworks-influencer-to-launch-toledo-rockets-exchange-enhancing-nil-opportunities-for-student-athletes');

INSERT INTO Articles (category_id, title, current_content) VALUES
(4, 'NIL Compliance Rules & Staff Restrictions',
'Staff must understand the legal boundaries governing NIL to avoid inadvertent violations.

WHAT YOU NEED TO KNOW:

1. Institutional Involvement Limits — There are strict rules about how much the institution can facilitate or arrange NIL deals. Contact compliance before assisting any student-athlete with an NIL opportunity.

2. State Law vs. NCAA Policy — Ohio state law and NCAA interim policies both apply. When they conflict, the more restrictive rule governs.

3. Disclosure Requirements — Student-athletes must disclose NIL activities. Staff must ensure their athletes are completing required disclosures.

4. Prohibited During Team Events — Student-athletes may NOT wear non-compliant apparel or endorse commercial products during official team travel or university-funded athletic events.

When in doubt, contact the compliance office before advising a student-athlete on any NIL matter.');

INSERT INTO Articles (category_id, title, current_content) VALUES
(4, 'Toledo Rockets Exchange & Teamworks GM — NIL Platforms',
'Toledo uses the following platforms for NIL support and compliance tools. Staff should be familiar with both.

TOLEDO ROCKETS EXCHANGE (Teamworks Influencer)
The current NIL marketplace for Toledo student-athletes. Launched September 2025, it connects athletes with brand partners and facilitates NIL opportunities.
Reference: https://utrockets.com/news/2025/9/29/toledo-athletics-partners-with-teamworks-influencer-to-launch-toledo-rockets-exchange-enhancing-nil-opportunities-for-student-athletes

TEAMWORKS GENERAL MANAGER (GM)
Provides foundational financial literacy, brand management, and compliance courses. All student-athletes are enrolled.
Reference: https://teamworks.com/blog/toledo-gm/

New staff should request admin access to applicable platforms from the compliance office during their first week.');


-- ============================================================
-- ARTICLES — HR & Benefits
-- ============================================================

INSERT INTO Articles (category_id, title, current_content) VALUES
(5, 'Pre-Employment Checklist — Before Your First Day',
'Complete ALL of the following before your first day of work:

1. I-9 Employment Eligibility Verification — Complete Section 1 via the IntelliCorp digital link provided by HR. Do not wait until your first day.

2. Official College Transcripts — Must be mailed DIRECTLY from your institution to HR in sealed envelopes. Transcripts you bring yourself are not accepted.

3. Health Science Campus Staff — If your role involves the Health Science Campus, specific health screening requirements must be finalized before you begin.

Contact HR immediately if you have questions: https://www.utoledo.edu/depts/hr/');

INSERT INTO Articles (category_id, title, current_content) VALUES
(5, 'Your First Week — Critical Setup Tasks',
'Complete these tasks during your first week:

1. NEW EMPLOYEE ORIENTATION
Mandatory attendance. Held every Monday at 8:30 a.m. This session assimilates you into the university''s mission and values. You cannot skip this.

2. ACTIVATE YOUR UTAD ACCOUNT
Your UTAD username and password is your master credential for ALL university systems — email, payroll, parking, building access, and more. Activate it as your first priority.

3. SET UP MULTI-FACTOR AUTHENTICATION (MFA)
Download the Microsoft Authenticator app and set up MFA on your UTAD account before attempting to access any university system.

4. DIRECT DEPOSIT & TAX FORMS
After UTAD activation, log into the MyUT portal to set up direct deposit and complete federal/state tax withholding forms. You will not be paid correctly without this.');

INSERT INTO Articles (category_id, title, current_content) VALUES
(5, '30-Day Deadline — Benefits Enrollment (DO NOT MISS)',
'YOU HAVE EXACTLY 30 DAYS FROM YOUR START DATE TO ELECT OR WAIVE BENEFITS.

If you miss this deadline, you forfeit coverage until the next annual open enrollment period. There are no exceptions.

WHAT TO ENROLL IN:
- Medical insurance
- Dental insurance
- Vision insurance
- Life insurance

HOW TO ENROLL:
Log into the MyUT portal and navigate to Benefits. You must upload supporting documentation for any dependents you are adding (marriage certificates, birth certificates, etc.).

IMPORTANT: Even if you are declining coverage (e.g., because you are on a spouse''s plan), you must actively decline within 30 days. Inaction is not the same as declining.

Benefits information: https://www.utoledo.edu/depts/hr/total-rewards/benefits/');

INSERT INTO Articles (category_id, title, current_content) VALUES
(5, '120-Day Deadline — Retirement Plan Elections',
'You have 120 days from your hire date to finalize your retirement plan elections.

STEPS:
1. Review the retirement plan options available to your employee classification
2. Create accounts with the approved vendor(s) you select
3. Submit the required authorization forms within 120 days

Missing this deadline has long-term financial consequences. Set a calendar reminder now.

Your hiring manager should conduct formal 30, 60, and 90-day check-in meetings to review your performance and onboarding experience.');

INSERT INTO Articles (category_id, title, current_content) VALUES
(5, 'Employee Benefits & Work-Life Harmony Programs',
'Toledo offers a comprehensive benefits package beyond standard insurance. Key programs include:

EMPLOYEE ASSISTANCE PROGRAM (EAP) — AllOne Health
Provides confidential mental health support, stress reduction resources, and counseling for you AND your dependents. This service is free and completely confidential.

VOLUNTARY SUMMER REDUCED HOURS PROGRAM
Eligible staff may reduce their hours during summer. Check with HR for eligibility requirements.

FMLA & ADA ACCOMMODATIONS
Leave of absence options are available for qualifying medical and family situations.

CORPORATE DISCOUNTS
UToledo staff have access to discounts on software, regional hotels, and other services.

Full work-life harmony resources: https://www.utoledo.edu/depts/hr/work-life-harmony/

Employee resources hub: https://www.utoledo.edu/depts/hr/training-and-organizational-development/employee-resources.html');

INSERT INTO Articles (category_id, title, current_content) VALUES
(5, 'Mandatory Training Modules — First 30 Days',
'The following compliance training modules must be completed within your first 30 days:

1. Ohio Ethics Law — Required for all state employees
2. HIPAA Basics — Required if your role involves any health or medical information
3. Title IX / VAWA Anti-Harassment Training — Required for all university employees
4. NCAA Compliance Acknowledgment — Required for all athletics staff
5. Employee Compliance Guide Acknowledgment — Required for all athletics staff

These are tracked by HR and the compliance office. Failure to complete them on time will be flagged to your supervisor.');


-- ============================================================
-- ARTICLES — IT & Campus Access
-- ============================================================

INSERT INTO Articles (category_id, title, current_content) VALUES
(6, 'Getting Your Rocket Card & Mobile ID',
'The Rocket Card is your physical and digital identity credential at UToledo.

STEPS TO GET YOUR ROCKET CARD:
1. Activate your UTAD account and set up MFA (must be done first)
2. Log into the MyUT portal
3. Navigate to the Rocket Card section
4. Upload a compliant photograph (follow the photo guidelines carefully — rejections are common)
5. Your card will be produced and available for pickup

ROCKET MOBILE ID:
Toledo has transitioned to a mobile ID system. After receiving your physical card:
1. Download the Transact eAccounts app on your smartphone
2. Follow the instructions to provision your ID into Apple Wallet or Google Wallet
3. This enables tap-to-access for secured buildings, athletic facilities, and campus dining

Mobile ID information: https://www.utoledo.edu/rocketcard/rocket-mobile-id/
Rocket Card FAQ: https://www.utoledo.edu/rocketcard/faq.html');

INSERT INTO Articles (category_id, title, current_content) VALUES
(6, 'Essential Apps to Install',
'Install all of the following on your work and personal devices:

REQUIRED:
- Microsoft Authenticator — For MFA on your UTAD account (install before anything else)
- Transact eAccounts — For your Rocket Mobile ID

STRONGLY RECOMMENDED:
- Blackboard Mobile — For accessing internal course content and training modules
- Rave Guardian — For emergency campus safety alerts. This app sends real-time notifications for campus emergencies. All athletics staff should have this installed.

App directory: https://www.utoledo.edu/success/apps/');


-- ============================================================
-- ARTICLES — Parking & Transportation
-- ============================================================

INSERT INTO Articles (category_id, title, current_content) VALUES
(7, 'Parking Permits — What You Need & How to Get It',
'Parking on both Main Campus and the Health Science Campus is managed by ParkUToledo. Citations are issued aggressively — ignorance of zoning rules is not a defense.

YOUR PERMIT AS A FULL-TIME ATHLETICS STAFF MEMBER:

"A" PERMIT — Faculty & Staff
- Cost: $329/year or $110/semester
- Access: Yellow-lined spaces across campus
- This is the standard permit for full-time athletics department employees

OTHER PERMIT TYPES:
- "E" Permit (Executive) — $952/year — For senior leadership only (Note: E Permit pricing is subject to change — contact ParkUToledo at parkutoledo.com to confirm current rates.)
- "C" Permit (Guest/Daily) — $6.20/day or $62.50/month — For visitors or staff opting out of annual permits (white-lined spaces)

HOW TO PURCHASE:
Permits are purchased through the ParkUToledo portal: https://vpermit.com/parkutoledo/

IMPORTANT: Parking enforcement operates year-round including between semesters, during academic breaks, AND on weekends. There is no grace period.');

INSERT INTO Articles (category_id, title, current_content) VALUES
(7, 'Campus Parking Map & Facility Locations',
'Use the interactive campus map to identify parking areas near your assigned facilities before your first day.

Campus map (PDF): https://www.utoledo.edu/offices/communications/pdfs/map.pdf
Note: This campus map PDF was last updated in 2011 and may not reflect current building names or layouts. Contact Facilities at 419-530-1000 for current campus information.
Interactive parking finder: https://www.parkutoledo.com/find-parking
ParkUToledo news & updates: https://www.parkutoledo.com/parking-news/parking-updates-for-2025-26-school-year

QUICK REFERENCE — Parking near key athletics facilities:
- Savage Arena (main admin offices): Use A permit spaces on the east side of campus
- Larimer Athletic Complex (football/SASS): Dedicated athletics lots adjacent to the complex
- Findlay Building (baseball/softball): Surface lots on the south end of campus

When in doubt, arrive early on your first day and allow extra time to find parking.');


-- ============================================================
-- ARTICLES — Student-Athlete Development
-- ============================================================

INSERT INTO Articles (category_id, title, current_content) VALUES
(8, 'Student-Athlete Support Services (SASS)',
'SASS is located in the Larimer Athletic Complex and provides comprehensive academic and developmental support to all student-athletes.

KEY STAFF:
- Jillian Lehman — Associate AD for Student-Athlete Experience
- Duane Welch — Assistant Director of SASS

SERVICES PROVIDED:
- Course scheduling guidance
- Mandatory study tables
- Specialized tutoring
- Academic progress monitoring
- Referrals for learning disabilities and accommodations

WHEN TO REFER A STUDENT-ATHLETE TO SASS:
If a student-athlete you work with is missing class, falling behind academically, showing signs of academic distress, or approaching eligibility thresholds — contact SASS immediately. Early intervention is always more effective than crisis response.

SASS resources: https://www.utoledo.edu/success/sass/NCAASAA.html');

INSERT INTO Articles (category_id, title, current_content) VALUES
(8, 'Mental Health Resources & Crisis Referral Protocol',
'The mental health pressures on student-athletes have increased significantly due to NIL, the transfer portal, and performance expectations. Staff are often the first to notice warning signs.

WARNING SIGNS TO WATCH FOR:
- Withdrawal from teammates, coaches, or normal activities
- Sudden drop in academic or athletic performance
- Expressions of hopelessness, worthlessness, or being a burden
- Significant changes in sleep, eating, or behavior
- Talking about self-harm or not wanting to continue

YOUR ROLE:
You are not expected to diagnose or treat mental health conditions. Your role is to notice, express concern, and connect the student-athlete with professional help.

REFERRAL STEPS:
1. Express concern privately and directly to the student-athlete
2. Contact Jillian Lehman (Associate AD for Student-Athlete Experience) immediately
3. Direct the student-athlete to the University Health Center for psychiatric services
4. Document the interaction and your referral

CRISIS RESOURCES:
- University Health Center: Available during business hours for appointments
- 988 Suicide & Crisis Lifeline: Call or text 988 (24/7)
- Crisis Text Line: Text HOME to 741741

Do not attempt to manage a mental health crisis alone. Always involve professionals.');

INSERT INTO Articles (category_id, title, current_content) VALUES
(8, 'Career Development & Life After Sport',
'The N4A Student-Athlete Development framework guides Toledo''s approach to preparing athletes for life after sport.

KEY INITIATIVE — Rockets Rise: Networking & NIL Night
This annual event connects student-athletes with regional employers for internship and career opportunities. All athletics staff are encouraged to support and promote this event to their athletes.

HOW STAFF CAN SUPPORT CAREER DEVELOPMENT:
- Encourage athletes to attend career development programming
- Connect athletes with professional contacts in your network when appropriate
- Remind athletes that their athletic identity is one part of who they are — not the whole
- Support athletes who are exploring post-sport career paths, even during their playing careers');


-- ============================================================
-- ARTICLES — Relocation & Toledo Life
-- ============================================================

INSERT INTO Articles (category_id, title, current_content) VALUES
(9, 'Relocation Allowance Policy',
'If you are relocating to Toledo for this position, you may be eligible for a relocation stipend.

ELIGIBILITY:
Full-time faculty and professional administrative staff, including coaches.

MAXIMUM AMOUNT: $8,500

IRS REQUIREMENTS:
- Your new commute must be at least 50 miles greater than your previous commute
- The stipend is taxed as ordinary income (it will appear on your W-2)

PROCESS:
1. Negotiate the relocation stipend amount during your hiring process (it is not automatic)
2. Obtain THREE moving quotes from university-preferred vendors
3. Submit the quotes to HR for approval
4. Funds are disbursed via payroll after approval

Policy document: https://www.utoledo.edu/policies/administration/humanresources/pdfs/3364_25_19.pdf');

INSERT INTO Articles (category_id, title, current_content) VALUES
(9, 'Toledo Neighborhoods — Where Staff Live',
'Toledo is a resurgent, family-oriented metropolitan area with accessible infrastructure and a low cost of living. Here are the neighborhoods most popular with university personnel:

OLD ORCHARD
Located immediately north of the university. Highly coveted, walkable neighborhood with historic tree-lined streets. Extremely popular among faculty and staff. Ideal if you want to walk or bike to campus.

OTTAWA HILLS
Located near Wildwood Preserve Metropark. An affluent suburban enclave with prestigious housing and a tight-knit community atmosphere. Popular with senior staff and coaches with families.

WESTGATE
Ideal for individuals prioritizing immediate access to high-density retail, diverse dining options, and major grocery chains. More suburban feel with convenient highway access.

For broader neighborhood research:
For neighborhood information, search ''Toledo Ohio neighborhoods'' or visit the Toledo Regional Chamber of Commerce at toledochamber.com');

INSERT INTO Articles (category_id, title, current_content) VALUES
(9, 'Coffee Shops, Dining & Working Remotely in Toledo',
'For remote work, off-site meetings, or just getting out of the office, here are staff-recommended spots:

EARTH COFFEEHOUSE — Inside TolHouse
A sophisticated, plant-rich environment designed for focused work and collaboration. Excellent for meetings or deep work sessions.
https://earth.tolhouse.com/

BREW COFFEE BAR — Gateway Plaza (on campus)
Located directly on campus. Convenient for between-meeting coffees or quick working sessions without leaving the university area.
https://brewtoledo.com/

PLATE 21 — Beverly neighborhood
A well-regarded option in one of Toledo''s up-and-coming neighborhoods.

THINGS TO EXPLORE IN TOLEDO:
- Toledo Museum of Art — World-class collection, free admission
- Metroparks Toledo — Extensive network of parks and trails, including Wildwood Preserve and Oak Openings
- Fifth Third Field — Minor league baseball in a beautiful downtown ballpark
- Toledo Zoo — One of the top-rated zoos in the country');