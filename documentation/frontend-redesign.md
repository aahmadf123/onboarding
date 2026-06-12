# Toledo Athletics Onboarding Portal — Frontend Redesign Specification

## Purpose

This redesign turns the current onboarding portal from a simple content hub into a polished **Toledo Athletics onboarding command center**. The goal is not only to make the portal look better, but to help new staff immediately understand:

1. What they need to do next.
2. Where to find important systems, policies, and contacts.
3. How far they are in the onboarding process.
4. How they fit into the Toledo Athletics culture.

The visual direction should feel like **Toledo Athletics**, not a generic university web app.

---

## Design Direction

The redesign should use a dashboard-shell layout inspired by the concept mockups:

- Persistent left sidebar navigation.
- Strong Toledo Athletics hero area.
- Central onboarding workflow and quick actions.
- Right-side utility rail for announcements, upcoming tasks, and key contacts.
- Floating AI assistant for onboarding questions.
- Dark Midnight Blue foundation with Athletic Gold accents.

The experience should feel premium, calm, and operational — closer to an internal athletics OS than a brochure site.

---

## Brand Foundation

### Core Colors

Use the official Toledo Athletics colors as the foundation:

| Token | Color | Hex | Usage |
|---|---:|---:|---|
| Midnight Blue | Primary dark | `#0B2240` | Backgrounds, sidebar, hero, headers |
| Athletic Gold | Primary accent | `#FFCD00` | CTAs, active states, progress, highlights |
| Deep Navy | Dark extension | `#06162C` | App background, gradients |
| White | Surface text/background | `#FFFFFF` | Cards, content panels |
| Slate | Secondary text | `#64748B` | Descriptions, metadata |
| Soft Border | Border | `#DDE5F0` | Card borders, dividers |
| Success Green | Status | `#16A34A` | Completed tasks |
| Warning Amber | Status | `#D97706` | Pending review / due soon |

### Logo Usage

Use the updated Toledo Athletics assets:

- Primary Toledo logo for light surfaces.
- Primary Toledo logo for dark surfaces.
- Rocket-only mark as a supporting visual motif.
- Avoid overusing the logo in every card. Use it with restraint so the interface does not feel noisy.

### Brand Motifs

Use these motifs selectively:

- Rocket trails as subtle dividers or background accents.
- “For Toledo” energy in welcome copy or empty states.
- Savage Arena or athletics facility photography in the dashboard hero.
- Stadium-texture / midnight-blue texture only as a very subtle background layer.

Avoid making the UI look like a poster. It is still a working staff portal.

---

## Recommended Information Architecture

### Primary Navigation

The left sidebar should become the main navigation system:

1. Dashboard
2. Getting Started / My Onboarding
3. Policies & Compliance
4. Systems & Tools
5. Departments
6. Campus Resources
7. People & Contacts
8. Training & Development
9. Forms & Documents
10. FAQ
11. Give Feedback

Admin-only items should be visually separated near the bottom:

- Moderate
- Admin
- Users
- Settings

### Navigation Behavior

- Desktop: persistent sidebar.
- Tablet: collapsible sidebar.
- Mobile: drawer menu or bottom navigation for the most important items.
- Active state: Athletic Gold background with Midnight Blue text.
- Hover state: subtle white overlay on dark sidebar.

---

## Dashboard Page

The dashboard is the highest-priority redesign target.

### Dashboard Goals

The dashboard should answer three questions instantly:

1. What should I do next?
2. What resources do I need most often?
3. How much onboarding is left?

### Layout

Use a three-zone layout:

```text
┌──────────────────────────────────────────────────────────────┐
│ Header / Brand / Search / User Profile                       │
├───────────────┬───────────────────────────────┬──────────────┤
│ Sidebar       │ Main Dashboard Content         │ Right Rail    │
│ Navigation    │ Hero, quick links, progress    │ Tasks/News    │
└───────────────┴───────────────────────────────┴──────────────┘
```

### Hero Panel

Use the Savage Arena / athletics facility image as the main dashboard hero visual.

Hero content:

- Title: `Welcome to Toledo Athletics`
- Subtitle: `Your first steps, key systems, and people — all in one place.`
- Primary CTA: `Continue Onboarding`
- Secondary CTA: `Ask the Onboarding Assistant`
- Optional small badge: `For Toledo`

Hero treatment:

- Dark blue gradient overlay on image.
- White text with Athletic Gold highlights.
- Rounded card with shadow.
- Keep image contrast controlled so text remains readable.

### Quick Actions

Replace generic category cards with high-value action cards:

1. New Hire Checklist
2. Policies & Handbooks
3. Systems Directory
4. Department Contacts
5. Training Center
6. Campus Map / Facilities

Each card should include:

- Icon
- Label
- Short 1-line description
- Hover state
- Optional completion/status chip when relevant

### Onboarding Progress

The progress section should be more visual than the current simple progress bar.

Recommended structure:

- Progress summary: `5 / 10 completed`
- Horizontal progress bar using Athletic Gold
- Step timeline with phases:
  - Welcome & Orientation
  - HR & Benefits Setup
  - Compliance Training
  - Systems Access
  - Facilities Tour
  - Meet Your Team
  - First 30 Days
  - First 90 Days
  - Resources & Support
  - Complete

Use clear visual states:

| State | Visual |
|---|---|
| Completed | Gold filled circle with checkmark |
| Current | Midnight Blue filled circle |
| Pending | White circle with border |
| Blocked / approval needed | Amber badge |

### Right Rail

The right rail should make the dashboard operational.

Include three compact panels:

#### Announcements

- Latest department updates.
- Compliance reminders.
- HR or facilities updates.
- Link: `View all`.

#### Upcoming Tasks

- Due soon tasks.
- Training deadlines.
- Approval-required items.
- Link: `View all tasks`.

#### Your Contacts

- Assigned HR contact.
- Supervisor or onboarding owner.
- Compliance contact when relevant.
- Include email and phone when available.

---

## Page-Level Redesign Guidance

### My Onboarding

The current checklist logic is valuable. Keep the backend and task state model, but restyle the frontend.

Recommended improvements:

- Add phase tabs or a vertical timeline.
- Show assigned tasks separately at the top.
- Make approval-required tasks visually distinct.
- Add a sticky progress summary on desktop.
- Add “Next recommended task” at the top.

### Resources & Systems

Current combined Resources + Systems approach is good. Keep it.

Improve by adding:

- Search/filter input.
- Category chips: HR, IT, Compliance, Facilities, Athletics Ops.
- “Most used” section.
- External-link icons.
- Login notes shown as small warning/info chips.

### Contacts

Improve the contacts page from static cards into a directory.

Add:

- Search by name, department, or role.
- Department filters.
- Contact type badges: HR, Compliance, IT, Facilities, Sport Admin.
- One-click mailto and phone actions.

### Policies & Compliance

Make this feel more serious and structured.

Add:

- Compliance-first header.
- Required vs optional policy labels.
- Last updated metadata.
- Role-based policy grouping if possible.
- “Must read before first day” grouping.

### AI Assistant

Keep the floating assistant, but make it feel branded and scoped.

Recommended label:

- `Ask Toledo Athletics`
- `Ask the Onboarding Assistant`

Suggested starter prompts:

- `What do I need to complete this week?`
- `How do I get access to systems?`
- `Who should I contact for compliance?`
- `Where is Savage Arena?`

The assistant should stay secondary. It should support onboarding, not dominate the dashboard.

---

## Component System

### App Shell

Create a reusable shell component conceptually structured as:

```text
AppShell
├── SidebarNav
├── MainRegion
│   ├── TopBar
│   └── PageContent
└── OptionalRightRail
```

This avoids rebuilding layout logic for every page.

### Cards

Use a consistent card style:

```text
background: white
border: 1px solid #DDE5F0
border-radius: 16px
box-shadow: subtle, not heavy
padding: 20–24px
```

### Buttons

Primary button:

- Background: Midnight Blue or Athletic Gold depending on surrounding surface.
- Text: high contrast.
- Rounded corners.
- Clear hover/active state.

Secondary button:

- Transparent or white background.
- Border using Midnight Blue / soft border.
- Text Midnight Blue.

### Icons

Current emoji icons should eventually be replaced with a consistent icon system.

Recommended options:

- Inline SVG icons already used in the project.
- Lucide-style line icons if a build step is introduced later.
- Custom Toledo athletics icons only for high-visibility places.

Avoid mixing too many emoji, SVG, and logo marks in the same area.

---

## Typography

The branding screenshots mention athletic typography such as Niagara, Stratum, Holimount, and 1872. These can inspire the interface, but the web app should remain readable and maintainable.

Recommended practical approach:

- Use a strong athletic display style only for hero headings and major page titles.
- Use a clean sans-serif for body text, forms, cards, and dashboards.
- Avoid using highly decorative fonts for navigation or dense content.

Suggested fallback stack:

```css
font-family: Inter, Poppins, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

If official Toledo fonts are licensed and available, use them only after confirming web usage rights.

---

## UX Principles

### 1. Make the next action obvious

Every dashboard visit should show the user what to do next.

### 2. Reduce cognitive load

Do not show every category, announcement, task, and contact with equal visual weight.

### 3. Prioritize onboarding progress

Progress should feel visible, motivating, and easy to resume.

### 4. Keep branding strong but functional

Athletics energy should support the experience, not overwhelm it.

### 5. Design for staff under time pressure

Many users will open this while trying to complete a specific task. The interface should be fast, searchable, and direct.

---

## Accessibility Requirements

The redesign should preserve or improve accessibility.

Minimum expectations:

- Maintain strong color contrast, especially gold-on-blue and white-on-image.
- Do not rely on color alone for task status.
- Use visible focus states.
- Ensure sidebar and modals are keyboard navigable.
- Use readable font sizes.
- Avoid placing critical text directly over busy image areas.
- Support responsive layouts down to mobile widths.

---

## Responsive Behavior

### Desktop

- Full sidebar.
- Main content plus right rail.
- Large hero and timeline progress.

### Tablet

- Collapsible sidebar.
- Right rail moves below main content or becomes a stacked section.

### Mobile

- Sidebar becomes drawer.
- Hero becomes compact.
- Quick actions use 2-column grid.
- Progress timeline becomes horizontal scroll or vertical step list.
- Right rail panels stack below dashboard content.

---

## Implementation Plan

### Phase 1 — Dashboard Redesign

Scope:

- Build new dashboard layout.
- Add sidebar shell.
- Add hero with facility image.
- Add quick actions.
- Upgrade progress card.
- Add right rail panels.

Do this first because it gives the highest visual impact with the least backend risk.

### Phase 2 — Shared App Shell

Scope:

- Apply sidebar and topbar globally.
- Standardize card styles.
- Standardize buttons and active states.
- Ensure mobile drawer behavior works.

### Phase 3 — Page Reskins

Scope:

- My Onboarding
- Resources & Systems
- Contacts
- Policies
- Search results
- Submit / Contribute

Keep data logic unchanged where possible.

### Phase 4 — Brand Polish

Scope:

- Add subtle rocket trail accents.
- Add official logo variants.
- Refine typography.
- Improve loading states and empty states.
- Add microinteractions.

### Phase 5 — Admin UX Alignment

Scope:

- Keep admin pages more utilitarian.
- Match colors/components without making admin pages overly decorative.
- Prioritize clarity and moderation speed.

---

## Files Likely Affected

Expected frontend files:

- `worker/src/frontend.ts`
- `worker/src/frontend/shared.ts`
- `worker/src/frontend/content.ts`
- `worker/src/frontend/admin.ts`

Expected static/branding assets:

- `worker/public/branding/*` or equivalent existing branding directory

No database changes should be required for the first redesign pass unless new dynamic dashboard content is introduced.

---

## Data Already Available for the Redesign

The existing app already supports many of the redesigned dashboard pieces:

| Redesign Area | Existing Data / Logic |
|---|---|
| Onboarding progress | `/tasks` and task completion state |
| Quick links | `/quicklinks` |
| Systems | `/systems` |
| Contacts | `/contacts` |
| Policies | `/policies` |
| AI assistant | `/api/ai/chat/stream` |
| Auth/user state | session token + current user |

This means the redesign is mostly a frontend reorganization, not a backend rewrite.

---

## Copy Direction

Use confident, staff-focused copy.

Examples:

- `Welcome to Toledo Athletics`
- `Your first steps, key systems, and people — all in one place.`
- `Continue onboarding`
- `For Toledo`
- `Built for Rockets`
- `Everything you need for day one`
- `Your next task`
- `Ask Toledo Athletics`

Avoid generic phrases like:

- `Welcome to the portal`
- `Click here`
- `Resources page`
- `Learn more`

---

## Risks and Watchouts

### Too Much Branding

The brand assets are strong, but overusing logos, textures, and gold can make the app feel busy. Use brand elements as hierarchy, not decoration.

### Image Contrast

Facility photos should always use overlays or controlled crops.

### Mobile Complexity

The desktop dashboard can become too dense on mobile. Design mobile separately instead of only shrinking the desktop view.

### Font Licensing

Do not ship official or premium athletic fonts unless web licensing is confirmed.

### Admin Usability

Admin pages should not become overly stylized. Admin users need speed and clarity.

---

## Success Criteria

The redesign is successful if:

- A new staff member can immediately identify their next action.
- The dashboard feels clearly branded as Toledo Athletics.
- The app looks modern without feeling cluttered.
- Existing workflows still work without backend rewrites.
- Mobile layout remains usable.
- The portal feels like a real internal product, not a class project or static website.

---

## Final Recommendation

Implement the redesign in this order:

1. Dashboard page.
2. Shared sidebar/topbar shell.
3. My Onboarding page.
4. Resources, Contacts, and Policies.
5. Admin visual alignment.

Do not attempt a full visual rewrite all at once. The dashboard redesign will create the strongest first impression and establish the component language for the rest of the portal.
