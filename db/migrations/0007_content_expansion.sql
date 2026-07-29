-- ============================================================
-- 2026-06-14 Content expansion — fill researched content gaps
-- ============================================================
-- Adds eight staff-onboarding articles drawn from official UToledo sources
-- (June 2026 research) and indexes them for the AI assistant.
-- Additive & idempotent (guarded inserts). Edit later in Admin → Content.
--
-- Category ids: 1 Department Overview, 2 NCAA Compliance, 3 Title IX,
-- 4 NIL, 5 HR & Benefits, 6 IT & Campus Access, 7 Parking, 8 SAS Dev, 9 Toledo Life.
--
-- VERIFY-BEFORE-RELYING flags are called out inline (e.g. exact mileage rate,
-- which can change). Sources are linked in each article.
-- ============================================================

-- 1) Travel & Expense Reimbursement (HR & Benefits) --------------------------
INSERT INTO Articles (category_id, title, current_content)
SELECT 5, 'Travel & Expense Reimbursement',
'University travel and business-expense reimbursement is governed by policy **3364-40-03** and runs through **SAP Concur**.

BEFORE YOU TRAVEL — get approval:
- A **Travel Request must be submitted and fully approved in Concur before any travel begins** (even when you expect no out-of-pocket cost). Do not book travel or pay conference registration until it is approved.

MEALS — per diem:
- Meals/incidentals use the **GSA per diem** rate for the destination (auto-loaded in Concur). You must be on **overnight travel status** to claim per diem, and you receive **75% of per diem on the first and last day** of travel. Actual-cost meal claims cannot exceed the daily per diem.

LODGING:
- Reimbursed at **actual cost** (per diem does not apply); keep the original itemized receipt and keep costs reasonable for the location.

MILEAGE (personal vehicle):
- Enter mileage in the expense report using the **Personal Car Mileage** type, which opens Concur''s mileage calculator. (The exact cents-per-mile rate lives in policy 3364-40-03 / the Employee Travel form — confirm the current figure before submitting.)

AFTER THE TRIP:
- Submit one expense report with all event expenses and original receipts **within 14 days of the end of the event**.

PCARD vs. personal funds:
- Both the Purchasing Card (PCard) and out-of-pocket reimbursements are reconciled in Concur (Accounts Payable).

ATHLETICS TEAM TRAVEL:
- Team travel also follows 3364-40-03 plus internal Athletics/Compliance procedures — confirm specifics with Athletics Compliance.

Policy: https://www.utoledo.edu/policies/administration/finance/pdfs/3364_40_03.pdf
Concur & travel guidance: https://www.utoledo.edu/offices/controller/accounts_payable/concur_training/travelandexpensepolicies.html'
WHERE NOT EXISTS (SELECT 1 FROM Articles WHERE title = 'Travel & Expense Reimbursement');

-- 2) Title IX reporting (Title IX & Gender Equity) ----------------------------
INSERT INTO Articles (category_id, title, current_content)
SELECT 3, 'Title IX — How to Report & Your Duty as a Mandated Reporter',
'**As a University employee, you are a mandated reporter.** If anyone shares an incident of sex/gender discrimination, sexual harassment, sexual assault, dating/domestic violence, or stalking with you, you are required to share that information with the Title IX Office. This applies to athletics staff just like all university employees.

WHO TO CONTACT:
- **Michelle McDevitt — Director of Title IX and Compliance** (the University''s Title IX Coordinator)
- Office: Snyder Memorial Hall, Room 1120
- **titleix@utoledo.edu · 419-530-3152**

HOW TO REPORT:
1. Online complaint form / contact the Coordinator: https://www.utoledo.edu/title-ix/
2. By phone or email to the Coordinator (above)
3. **Anonymous hotline: 888-416-1308** (trained interviewer; no name required)

RETALIATION is prohibited and is itself separately reportable.

CONFIDENTIAL vs. NON-CONFIDENTIAL:
- **Confidential** resources will not share details without your consent — e.g. the University Counseling Center (students) and **Advocates** (free and confidential; available to students, faculty, and staff).
- **Non-confidential** = mandated reporters (general employees), who must forward reports to the Title IX Office.

Policies: 3364-50-01 (Title IX Policy) and 3364-50-01-01 (Title IX Procedures).
Reporting & resources: https://www.utoledo.edu/title-ix/'
WHERE NOT EXISTS (SELECT 1 FROM Articles WHERE title = 'Title IX — How to Report & Your Duty as a Mandated Reporter');

-- 3) Emergency & campus safety (Department Overview) --------------------------
INSERT INTO Articles (category_id, title, current_content)
SELECT 1, 'Emergency Procedures & Campus Safety',
'Know these before you need them.

EMERGENCY: call **911**.
UTPD (non-emergency): **419-530-2600** · utpolice@utoledo.edu

UT ALERT — emergency notifications (DO THIS DAY ONE):
- UT Alert sends text + email for active threats, severe weather, and major campus emergencies.
- Enroll by adding your cell number in **MyUT → Personal/Office Information → "Update Office Address & Phone Numbers"** (digits only, no hyphens). The system pulls your number from the Cell Phone field.

RAVE GUARDIAN app (free, iPhone/Android):
- One-button 911, safety timer, panic button to campus/local police, and crime-tip submission.

VIOLENT INTRUDER — Run · Hide · Fight (UToledo also trains ALICE):
- **Run:** evacuate yourself and others from danger if you can.
- **Hide:** if you can''t run, shelter in a room that locks/barricades; block the door with heavy furniture.
- **Fight:** only as a last resort when life is in imminent danger.
- Internal procedure: "Code Violet – Violent Situation." Departments can request free Run-Hide-Fight training from UTPD.

SEVERE WEATHER / CLOSURES:
- Delays/cancellations are announced at https://www.utoledo.edu/weather/ and via UT Alert, ideally on a phased schedule (morning by 6 a.m., afternoon by 10 a.m., evening by 3 p.m.). Governed by policy 3364-25-14.

Emergency preparedness hub: https://www.utoledo.edu/depts/emergency/
Police & active-threat info: https://www.utoledo.edu/depts/police/'
WHERE NOT EXISTS (SELECT 1 FROM Articles WHERE title = 'Emergency Procedures & Campus Safety');

-- 4) IT security essentials (IT & Campus Access) ------------------------------
INSERT INTO Articles (category_id, title, current_content)
SELECT 6, 'IT Security Essentials',
'Protecting your UTAD account and University data.

PASSWORDS:
- Minimum **8 characters** with upper/lower case, numbers, and punctuation; avoid dictionary words and personal info.
- Expire every **180 days**; you cannot reuse any of your last **10** passwords.
- Manage/reset at https://myutaccount.utoledo.edu/

MULTI-FACTOR AUTHENTICATION (MFA):
- UToledo uses **Microsoft MFA (Microsoft Authenticator app)** — not Duo. YubiKey 5 hardware keys are also supported. Set it up at first sign-in; your account shows as username@rockets.utoledo.edu. Setup help: IT Help Desk 419-530-2400 (24/7).

PHISHING / SUSPICIOUS EMAIL:
- Use the **"Report Phishing/Spam" button in Outlook**, or forward the message to **emailabuse@utoledo.edu**. Unsure about a request? Call the Help Desk before clicking.

REMOTE ACCESS (VPN):
- UToledo uses **Palo Alto GlobalProtect**. Sign in with username@rockets.utoledo.edu + your UTAD password and approve the MFA prompt. A VPN Access Form is required.

PROTECTING DATA (FERPA / PII):
- Don''t email student records or sensitive personal data; follow data-handling guidance. Governed by Information Security policy **3364-65-02** and FERPA policy **3364-71-15**.

LEAVING UToledo:
- IT access is deprovisioned on separation per HR policy 3364-25-48.

IT Help Desk: **419-530-2400** · ithelpdesk@utoledo.edu · https://www.utoledo.edu/it/'
WHERE NOT EXISTS (SELECT 1 FROM Articles WHERE title = 'IT Security Essentials');

-- 5) Payroll details (HR & Benefits) -----------------------------------------
INSERT INTO Articles (category_id, title, current_content)
SELECT 5, 'Payroll — Pay Schedule, Pay Stubs & Fixing Problems',
'HOW OFTEN YOU''RE PAID:
- Staff are paid **biweekly, on Fridays**.

YOUR FIRST PAYCHECK (arrears):
- Pay timing depends on your group: Main Campus classified/hourly staff are paid **one week in arrears**, Health Science Campus employees **two weeks in arrears**, and Main Campus faculty/unclassified staff are paid **to date**. Your first deposit lands accordingly — check the payroll schedule for exact dates.

PAY STUBS & LEAVE:
- View every pay stub and leave balance in **MyUT → Employee tab → Pay Details & Leave Balances**.

DIRECT DEPOSIT (pay is issued only by direct deposit):
- MyUT → Employee tab → **Direct Deposit Information**. Up to three accounts; the last must be set to 100% or pay can be delayed. Changes must be saved by **1:00 p.m. the Tuesday before** a Friday payday.

W-4 / OHIO WITHHOLDING:
- After your first paycheck, update federal and Ohio withholding in **MyUT → Pay Details & Leave Balances → Tax Forms**.

PROBLEMS:
- Payroll Department: **419-530-8780 · payroll@utoledo.edu**.

(See also "MyUT Self-Service: Direct Deposit, W-4 & Emergency Contacts.")
Payroll FAQ: https://www.utoledo.edu/offices/controller/payroll/frequentlyaskedquestions.html'
WHERE NOT EXISTS (SELECT 1 FROM Articles WHERE title = 'Payroll — Pay Schedule, Pay Stubs & Fixing Problems');

-- 6) Key dates / academic calendar (Department Overview) ----------------------
INSERT INTO Articles (category_id, title, current_content)
SELECT 1, 'Key Dates & Academic Calendar',
'Dates that shape the athletics work year. **The academic calendar changes annually — confirm current dates at** https://www.utoledo.edu/offices/provost/calendar/.

FALL 2025:
- Classes Aug 25 – Dec 5; finals Dec 8–12.
- Labor Day Sep 1; Fall Break Oct 13–14; Veterans Day Nov 11; Thanksgiving Break Nov 27–28.

SPRING 2026:
- Classes Jan 12 – Apr 24; finals Apr 27 – May 1.
- MLK Day Jan 19; Spring Break Mar 2–6.

HR / BENEFITS DEADLINES:
- **Benefits open enrollment is each October** (the 2026 plan-year window ran Oct 2–31, 2025).
- New hires: **benefits within 30 days** of hire; **retirement plan election within 120 days**.

Tip: recruiting calendars, championship windows, and compliance deadlines are sport-specific — check with your supervisor and Athletics Compliance for your area.'
WHERE NOT EXISTS (SELECT 1 FROM Articles WHERE title = 'Key Dates & Academic Calendar');

-- 7) Athletic scholarships overview (NCAA Compliance) -------------------------
INSERT INTO Articles (category_id, title, current_content)
SELECT 2, 'Athletic Scholarships — A Staff Overview',
'A quick orientation to how athletics aid works. For anything specific to a Toledo sport, route through Athletics Compliance.

THE BASICS:
- **Head-count sports** award a fixed number of full scholarships, one per athlete.
- **Equivalency sports** get a scholarship "budget" that can be split into partial awards across many athletes.
- A **counter** is any athlete receiving athletics aid; their aid counts against the team''s limit.
- Aid is documented in an athletics **financial aid agreement**.

WHAT CHANGED — House v. NCAA settlement (effective **July 1, 2025**):
- For schools that opt in, **roster limits replace per-sport scholarship caps** — each athlete may receive a full, partial, or no scholarship, up to the sport''s roster limit.
- Schools may also **share revenue directly with athletes**, capped at roughly **$20.5 million per school for 2025–26** (rising over the 10-year agreement.)
- This is a fast-moving area; confirm Toledo''s current approach with Compliance.'
WHERE NOT EXISTS (SELECT 1 FROM Articles WHERE title = 'Athletic Scholarships — A Staff Overview');

-- 8) Role-based compliance + recruiting calendar (NCAA Compliance) ------------
INSERT INTO Articles (category_id, title, current_content)
SELECT 2, 'Role-Based Compliance & the Recruiting Calendar',
'Your compliance obligations depend on your role.

COACHES:
- Any coach who recruits off-campus must **pass the NCAA recruiting-certification test annually by August 1** (it covers the full NCAA manual, not just recruiting). Only certified coaches may make off-campus contacts/evaluations.

SUPPORT STAFF (operations, video, GAs, admin):
- **Not permitted to recruit off-campus.** Encouraged (not required) to stay current on rules.

RECRUITING CALENDAR PERIODS:
- **Contact** — in-person off-campus contact and evaluation allowed.
- **Evaluation** — off-campus assessment allowed, but **no in-person contact** with the prospect.
- **Quiet** — in-person contact allowed **only on campus**.
- **Dead** — no in-person contact/evaluation anywhere; digital/phone contact still allowed.

SYSTEMS:
- **ARMS / Teamworks Compliance** — recruiting activity logs, complimentary tickets, and **CARA** (Countable Athletically Related Activities) time logs that certify practice/activity hours against NCAA limits.
- **Vector LMS** — assigns and tracks mandated training (Title IX, harassment/discrimination, hazing prevention).

WHEN IN DOUBT, ASK FIRST: route questions to Athletics Compliance (Brian Lutz, Senior Associate AD of Compliance; Lauren Best-Hovermale, Associate AD of Compliance) before acting.'
WHERE NOT EXISTS (SELECT 1 FROM Articles WHERE title = 'Role-Based Compliance & the Recruiting Calendar');

-- ---- AI content index for the new articles (so the assistant can cite them) --
INSERT INTO SiteContentIndex (source_type, source_id, source_title, content_text, section_path)
SELECT 'article', a.id, a.title, substr(a.current_content, 1, 1500), 'Onboarding > ' || a.title
FROM Articles a
WHERE a.title IN (
  'Travel & Expense Reimbursement',
  'Title IX — How to Report & Your Duty as a Mandated Reporter',
  'Emergency Procedures & Campus Safety',
  'IT Security Essentials',
  'Payroll — Pay Schedule, Pay Stubs & Fixing Problems',
  'Key Dates & Academic Calendar',
  'Athletic Scholarships — A Staff Overview',
  'Role-Based Compliance & the Recruiting Calendar'
)
AND NOT EXISTS (
  SELECT 1 FROM SiteContentIndex s WHERE s.source_type = 'article' AND s.source_id = a.id
);
