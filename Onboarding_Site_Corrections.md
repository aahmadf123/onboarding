# Toledo Athletics Onboarding Site — Corrections & Verified Data

**Compiled:** April 6, 2026
**Sources:** UToledo.edu, UTRockets.com Staff Directory, ParkUToledo.com, Ohio Administrative Code, Teamworks, UToledo News, and public university pages.

---

## CRITICAL CORRECTIONS (High Impact — Will Mislead New Employees)

### 1. University President — OUTDATED
- **Current (wrong):** "Interim President Matthew J. Schroeder"
- **Correct:** **Dr. James Holloway**, 19th President of the University of Toledo (assumed office July 15, 2025). Schroeder returned to his role as EVP Finance & Administration / CFO.
- **Source:** [UToledo Presidential Search](https://www.utoledo.edu/presidential-search)

### 2. NIL Platform "Spry" — NOT USED BY TOLEDO
- **Current (wrong):** Site references "Spry" (spry.so) as Toledo's NIL education platform with a link to `https://spry.so/nil-education/`
- **Correct:** Toledo does **NOT** use Spry. There is no evidence of a Toledo-Spry partnership.
- **What to replace it with:** Toledo uses **Teamworks Influencer** (powering the **Toledo Rockets Exchange**) as its current NIL platform (launched September 2025). The earlier NIL education program was **Opendorse** (via the "Liftoff" program, launched 2021).
- **Sources:** [Toledo Rockets Exchange Launch](https://utrockets.com/news/2025/9/29/toledo-athletics-partners-with-teamworks-influencer-to-launch-toledo-rockets-exchange-enhancing-nil-opportunities-for-student-athletes), [Liftoff Program via Opendorse](https://news.utoledo.edu/index.php/07_01_2021/rockets-announce-liftoff-program-for-student-athletes-as-part-of-partnership-with-opendorse)

### 3. NIL Collective Name "Liftoff" — MISCHARACTERIZED
- **Current (wrong):** Site describes "Liftoff" as Toledo's centralized NIL collective/initiative
- **Correct:** "Liftoff" was the **2021 NIL education program** (via Opendorse), not a collective. The actual NIL **collective** was called **"Friends of Rocky"** (founded June 2022, first in the MAC). Friends of Rocky is currently concluding operations as Toledo transitions to a university-led NIL/revenue-sharing model.
- **Current NIL ecosystem:**
  - **Toledo Rockets Exchange** (Teamworks Influencer) — active NIL marketplace
  - **Campus Ink** — Official NIL Licensee for merchandise (since May 2023), confirmed
  - **Friends of Rocky** — concluding operations
- **Source:** [On3 - Friends of Rocky](https://www.on3.com/nil/news/toledo-nil-collective-friends-of-rocky-becomes-first-mac-collective/), [Campus Ink Partnership](https://utrockets.com/news/2023/5/18/athletics-rockets-announce-partnership-with-campus-ink-as-official-nil-licensee)

### 4. Kenneth Schank — LIKELY DEPARTED FROM ATHLETICS
- **Current (wrong):** Listed as "Assistant Athletic Director for Compliance"
- **Issue 1 — Title was wrong:** His actual title was **Associate Athletic Director for Compliance** (higher rank)
- **Issue 2 — Likely no longer in role:** LinkedIn shows he moved to "Senior Auditor" at UToledo in **February 2026**. He no longer appears in the main Athletics Compliance section of the staff directory.
- **Recommendation:** Verify whether this position has been filled and update or remove accordingly.
- **Source:** [UTRockets Staff Directory](https://utrockets.com/staff-directory)

---

## BROKEN LINKS (404 Errors — Must Fix)

| # | Current URL | Status | Correct URL |
|---|---|---|---|
| 1 | `https://www.utoledo.edu/depts/hr/newemployees/welcome/` | **404** | `https://www.utoledo.edu/depts/hr/employment/newemployees.html` |
| 2 | `https://www.utoledo.edu/administration/auxiliaryservices/rocketcard/` | **404** | `https://www.utoledo.edu/rocketcard/` |
| 3 | `https://www.utoledo.edu/policies/administration/humanresources/pdfs/3364_25_01_Standards_of_Conduct.pdf` | **404** | `https://www.utoledo.edu/policies/administration/humanresources/pdfs/3364_25_01.pdf` |
| 4 | `https://www.utoledo.edu/policies/administration/humanresources/pdfs/3364_25_07_New_Employee_Orientation.pdf` | **404** | `https://www.utoledo.edu/policies/administration/humanresources/pdfs/3364_25_07.pdf` |
| 5 | `https://blackboard.utoledo.edu/` | **DNS Error** | `https://blackboard.utdl.edu` (or access via MyUT portal) |

**Where these appear in the codebase:**
- Link #1: `seed-v2.sql` QuickLinks row id=1
- Link #2: `seed-v2.sql` QuickLinks row id=13, SystemsDirectory row id=11
- Link #3: `seed-v2.sql` PolicyResources row id=2
- Link #4: `seed-v2.sql` PolicyResources row id=1
- Link #5: `seed-v2.sql` SystemsDirectory row id=4

---

## FACTUAL CORRECTIONS (Moderate Impact)

### 5. Facility Name: "Findlay Building" → "Findlay Athletic Complex"
- **Current (wrong):** "FINDLAY BUILDING — The administrative base for the baseball and softball programs."
- **Correct:** **Findlay Athletic Complex** — houses locker rooms, equipment rooms, training rooms, and coaches' offices for both Baseball and Softball at the Scott Park complex.
- **Location in codebase:** `seed.sql`, Article "Athletic Facilities Directory"
- **Source:** [UTRockets Scott Park Baseball](https://utrockets.com/facilities/scott-park-baseball/4)

### 6. Communications Staff Titles — Missing "Athletic"
All three communications staff members have "Athletic" in their official titles:
- **Steve Easton:** Associate Director of **Athletic** Communications (not just "Communications")
- **Nick Kerver:** Associate Director of **Athletic** Communications
- **Jordyn Prok:** Assistant Director of **Athletic** Communications
- **Location in codebase:** `seed-v2.sql` OrgChart rows 20-22

### 7. Duane Welch — Expanded Title
- **Current:** "Assistant Director of SASS"
- **Correct:** **Assistant Director of SASS / Director of Football Advising**
- **Location in codebase:** `seed-v2.sql` OrgChart row 15

### 8. Jen Sorgenfrei — Title Correction
- **Current:** Referenced as "Executive Director" with context of "University Marketing"
- **Correct title:** **Executive Director of Marketing and Communications**
- **Correct email:** jennifer.sorgenfrei@utoledo.edu (not just utmarcom@utoledo.edu, though the department email is fine as a contact)
- **Location in codebase:** `seed-v2.sql` KeyContacts row 6

### 9. Nicole Harris — Email Uses Maiden Name
- **Note:** Her official email in the staff directory is **nicole.alderson@utoledo.edu** (maiden name), not nicole.harris@utoledo.edu.
- **Location in codebase:** `seed-v2.sql` OrgChart row 3

### 10. Danberry Neighborhoods Article Link — Unreliable
- **Current URL:** `https://www.danberry.com/blog/the-11-hottest-neighborhoods-in-the-toledo-area`
- **Issue:** The main danberry.com/blog URL returns "Request Rejected" (blocked). The content may exist on agent-specific subdomains but the link is not reliably accessible.
- **Recommendation:** Replace with a different Toledo neighborhoods resource, or remove the link.
- **Location in codebase:** `seed.sql`, Article "Toledo Neighborhoods — Where Staff Live"

### 11. E Permit Price — Unverified
- **Current:** $952/year for Executive parking
- **Issue:** This price does not appear in any official UToledo or ParkUToledo public source for 2025-26. The A and C permit prices are confirmed correct.
- **Recommendation:** Verify internally with Parking Services, or note "contact ParkUToledo for current E permit pricing."
- **Location in codebase:** `seed.sql`, Article "Parking Permits"
- **Confirmed correct prices:** A Permit $329/year or $110/semester, C Permit $6.20/day or $62.50/month
- **Source:** [ParkUToledo 2025-26 Updates](https://www.parkutoledo.com/parking-news/parking-updates-for-2025-26-school-year)

### 12. Campus Map PDF — Extremely Outdated
- **Current URL:** `https://www.utoledo.edu/offices/communications/pdfs/map.pdf`
- **Issue:** This PDF loads, but it was last updated **October 25, 2011** — over 14 years ago. Building names and layouts may have changed significantly.
- **Recommendation:** Check if a newer campus map exists, or note the date and add a disclaimer.

---

## VERIFIED CORRECT (No Changes Needed)

The following items were verified as accurate:

### Staff & Leadership
- **Bryan B. Blair** — VP and Director of Athletics ✅
- **Nicole Harris** — Deputy AD / COO / SWA ✅ (email note above)
- **Connor Whelan** — Deputy AD / Chief Revenue Officer ✅
- **Melissa DeAngelo** — Senior Associate AD / CFO ✅
- **Brian Lutz** — Senior Associate AD, Compliance and Integrity ✅ (phone 419-530-8496 ✅)
- **Josh Dittman** — Senior Associate AD for Development ✅
- **Paul Helgren** — Associate AD of Communications ✅ (phone 419-530-4918 ✅)
- **Tim Warga** — Associate AD of Operations/Events ✅
- **Jillian Lehman** — Associate AD for Student-Athlete Experience ✅
- **Brian Jones** — Senior Associate AD of Health and Wellness ✅
- **Michelle McDevitt** — Director of Title IX and Compliance ✅
- **Ellen Holton** — Assistant AD for Creative Services & Brand Strategy ✅
- **Traci Snyder** — Director of Student-Athlete Development ✅
- **Brandon Hannum** — Director of Sports Performance ✅
- **Brandon Norris** — Assistant AD of Equipment ✅
- **Christopher Harris** — Director of Ticket Sales & Operations ✅
- **Rebecca Lugo** — Executive Assistant to the VP and Director of Athletics ✅
- **Kevin Taylor** — Brand and Licensing Manager ✅ (email kevin.taylor3@utoledo.edu ✅)

### Head Coaches — ALL VERIFIED ✅
- Mike Jacobs (Football — hired Dec 2025, replacing Jason Candle who left for UConn)
- Tod Kowalczyk (Men's Basketball)
- Ginny Boggess (Women's Basketball)
- Rob Reinstetle (Baseball)
- Jessica Bracamonte (Softball)
- Mark Batman (Women's Soccer)
- Brian Wright (Women's Volleyball)
- Andrea Grove-McDonough (Cross Country/Track & Field)
- Jeff Roope (Men's Golf)
- Ali Green (Women's Golf)
- Jacy Dyer (Women's Swimming & Diving)
- Tracy Mauntler (Women's Tennis)
- Al Wermer (Men's Tennis)
- Chris Bailey-Greene (Women's Rowing)
- Shelby Tincher (Cheerleading)

### Phone Numbers — ALL VERIFIED ✅
| Department | Phone |
|---|---|
| IT Help Desk | 419-530-2400 |
| HR | 419-530-4747 |
| Plant Operations (Facilities) | 419-530-1000 |
| Payroll | 419-530-8780 |
| Marketing/Communications | 419-530-5546 |

### Policies — ALL VERIFIED ✅
- Policy 3364-25-19 Relocation Allowance, $8,500 max (revised Feb 7, 2025)
- Policy 3364-25-36 Vacation, 176 hours (22 days) for unclassified staff
- 13 MAC championships in 3 years (official claim, verified)

### Local Toledo Recommendations — ALL VERIFIED ✅
- Earth Coffeehouse at TolHouse (1447 N. Summit St.) — Open
- Brew Coffee Bar at Gateway Plaza (1440 Secor Rd.) — Open
- Plate 21 in Beverly neighborhood (3664 Rugby Dr.) — Open
- Toledo Museum of Art — Open, free admission
- Metroparks Toledo — Active

### Working Links — ALL VERIFIED ✅
| Link | Status |
|---|---|
| MyUT Portal (myut.utoledo.edu) | OK |
| ParkUToledo (utoledo.edu/parkingservices/parkutoledo/) | OK |
| Payroll PDF | OK |
| Staff Directory (utrockets.com/staff-directory) | OK |
| Athletics Branding (utrockets.com branding page) | OK |
| Marketing Toolkit (utoledo.edu/offices/marketing/toolkit/) | OK |
| University Policies (utoledo.edu/policies/) | OK |
| Benefits Page | OK |
| Winter Break Schedule | OK |
| IT Page | OK |
| Facilities Page | OK |
| Toledo Rockets Exchange (INFLCR news) | OK |
| Rise Together Strategic Vision | OK |
| NIL Resource Center | OK |
| Booster Relations Page | OK |
| Rocket Mobile ID | OK |
| Rocket Card FAQ | OK |
| Useful Apps Page | OK |
| vPermit ParkUToledo Portal | OK |
| ParkUToledo Find Parking | OK |
| ParkUToledo 2025-26 Updates | OK |
| Campus Map PDF (note: outdated 2011) | OK |
| SASS Programs & Services | OK |
| HR Main Page | OK |
| Work-Life Harmony | OK |
| Employee Resources | OK |
| Teamworks GM Blog | OK |
| Ohio Admin Code 3364-25-123 | OK |
| FERPA Faculty & Staff | OK |
| Relocation Policy PDF | OK |
| Facilities Team Page | OK |
| Earth Coffeehouse | OK |
| Brew Coffee Bar | OK |
| Office.com | OK |
| Teamworks.com | OK |
| Teamworks Compliance | OK |
| Teamworks General Manager | OK |
| Spry.so (site exists, but Toledo doesn't use it) | N/A |
| Vacation Policy PDF | OK |
| FMLA Policy PDF | OK |
| Compliance Rules Education PDF | OK |

---

## SUMMARY — CHANGES NEEDED

| Priority | Item | Type | What to Fix |
|---|---|---|---|
| **CRITICAL** | University President | Factual | Change "Interim President Matthew J. Schroeder" → "President Dr. James Holloway" |
| **CRITICAL** | Spry NIL platform | Factual | Remove all Spry references; replace with Teamworks Influencer / Toledo Rockets Exchange |
| **CRITICAL** | "Liftoff" NIL description | Factual | Correct to show it was an Opendorse education program, not a collective |
| **CRITICAL** | Kenneth Schank | Personnel | Update or remove — likely no longer in Athletics Compliance role |
| **HIGH** | 5 broken URLs | Links | Replace with correct URLs (see table above) |
| **MEDIUM** | Findlay Building → Complex | Factual | Rename to "Findlay Athletic Complex" |
| **MEDIUM** | Communications staff titles | Factual | Add "Athletic" to all three titles |
| **MEDIUM** | Duane Welch title | Factual | Add "/ Director of Football Advising" |
| **MEDIUM** | Jen Sorgenfrei title | Factual | "Executive Director of Marketing and Communications" |
| **MEDIUM** | Nicole Harris email | Contact | Use nicole.alderson@utoledo.edu |
| **LOW** | Danberry link | Link | Replace or remove unreliable URL |
| **LOW** | E permit price | Factual | Verify internally or add disclaimer |
| **LOW** | Campus map PDF | Factual | Note it's from 2011; find newer version if available |
