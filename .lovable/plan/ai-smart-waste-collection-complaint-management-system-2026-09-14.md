# AI Smart Waste Collection & Complaint Management System

A demo web app matching the presentation: photo-based waste reporting, simulated AI analysis, worker assignment, verification and hotspot analytics. Everything runs on realistic built-in sample data — no accounts or server setup — so it can be shown and clicked through immediately.

## Pages

**1. Login (the opening screen)**
- Clean branded sign-in card with email/password fields.
- Three quick role buttons: User (resident/student), Worker, Admin — one tap enters that role's view.
- Signed-in role shown in the top bar with a way to switch roles at any time.

**2. Admin Dashboard (mirrors Page 10 of the deck)**
- Stat cards: Total 128, Pending 14, In Progress 22, Completed 76, Overdue 6.
- Complaint queue table/cards showing: complaint ID (e.g. WST1025), photo thumbnail, location, description, AI condition (Overflowing / Partially Filled / Normal), AI priority (High / Medium / Low), deadline with overdue highlight, status and assigned worker.
- Filters by status and priority, plus search.
- "Assign worker" popup listing available workers with their current load; assigning moves the complaint Pending → Assigned.
- Status lifecycle handling: Pending → Assigned → In Progress → Completed → Verified.
- Verification review: side-by-side before/after photo comparison with Approve (→ Verified) and Send for Rework (→ In Progress) buttons.
- Smart Waste Hotspot Detection panel: recurring locations (Canteen 45, Hostel Block A 32, Library 3, plus others) with complaint frequency bars and average resolution time per location.
- Worker performance strip: assigned, completed, average resolution time.

**3. User Portal**
- Submit complaint form: location picker (Canteen, Hostel Block A/B, Library, Academic Block, Parking), photo upload with instant preview, description.
- Simulated AI analysis: after the photo is added, a short "analyzing" moment reveals detected condition, waste type and a confidence score, which sets the priority automatically.
- On submit: complaint ID and deadline are issued, and the complaint appears in the admin queue.
- "My complaints" tracking list with a progress timeline through the five statuses, plus a rating/feedback option once resolved.

**4. Worker View**
- Assigned task list with location, photo, description, priority and deadline countdown.
- Start Work button (Assigned → In Progress).
- Completion proof upload with preview, then Submit (→ Completed, awaiting admin verification).
- Small personal stats: tasks today, completed, average time.

## Design

Clean modern dashboard look: deep green/teal primary with amber and red accents for priority, soft neutral surfaces, rounded cards, clear status pills, fully responsive down to mobile. All colors through the design system.

## Technical notes

- Frontend-only demo. Complaints, workers, users and photos live in a shared in-memory store (React context) seeded with realistic mock data, so actions in one role are visible in the others during a session.
- AI analysis is simulated locally with a short delay and a deterministic result, matching the deck's condition and priority categories.
- Routes: `/` (login), `/admin`, `/user`, `/worker`, each with its own page title and description.
- Uploaded photos are previewed via local object URLs; seeded complaints use generated sample waste images.

## Not included

No real login accounts, database, notifications or actual image-recognition model — those would need backend setup and can be added later.
