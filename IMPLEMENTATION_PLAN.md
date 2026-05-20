# Implementation Plan: Complete Dashboard + Core Routes

> Phase ordering is based on value delivery. Each phase is independently deployable and testable. AI layer should not be started until Phase 3 is complete and all acceptance criteria below have been met.

---

## Phase 1 — Complete the Dashboard Home Page

Goal: Turn the dashboard into a fully operational command center with all 5 modules.

> **Error & empty states** are a requirement of every module defined below. Each module must handle exactly 4 states: loading (skeleton), empty (meaningful message), error (message + retry CTA), and success. API failures must never produce a blank screen.

### 1a. Student Pain Points Module

| Area | Details |
|---|---|
| **Data source** | `GET /api/v1/admin/insights/topics` (already exists) |
| **New API client service** | `services/admin/topic-performance.service.ts` |
| **New TanStack hook** | `useTopicPerformanceQuery` in `hooks/admin/topic-performance.ts`, key `['topic-performance']` |
| **New component** | `modules/dashboard/components/student-pain-points.tsx` |
| **Added to** | `_private-routes/dashboard/index.tsx`, rendered below `<ActionRequired />` |

#### Acceptance Criteria
- [ ] **Loading state:** skeleton placeholders while fetching topic data; no layout shift
- [ ] **Empty state:** "No topic data available yet — data appears once students complete recall sessions" when API returns zero topics
- [ ] **Error state:** inline error message with "Retry" button when API call fails; does not crash the page or affect other modules
- [ ] Dashboard shows a list of topics sorted by weakness (lowest practice accuracy first)
- [ ] Each topic card displays: topic name, chapter, subject, recall strength (MCQ %), practice accuracy (%), students affected count, and a status badge (Weak / Medium / Strong)
- [ ] Weak topics (< 40% accuracy) are visually highlighted with a warning/danger indicator
- [ ] Clicking a topic navigates to `/content/topic/$id` with the correct topic loaded
- [ ] Data comes from `GET /admin/insights/topics` API
- [ ] Pagination works if there are more than 10 topics

---

### 1b. Upcoming Live Classes Module

| Area | Details |
|---|---|
| **Data source** | `GET /api/v1/live/classes/upcoming` (already exists) |
| **New API client service** | `services/live-class.service.ts` — `getUpcomingClasses()` |
| **New TanStack hook** | `useUpcomingClassesQuery` in `hooks/live-class/upcoming.ts` |
| **New component** | `modules/dashboard/components/upcoming-classes.tsx` |
| **Added to** | Dashboard below Student Pain Points |

#### Acceptance Criteria
- [ ] **Loading state:** skeleton placeholders while fetching classes
- [ ] **Empty state:** "No upcoming classes scheduled" with a "Schedule a Class" CTA
- [ ] **Error state:** inline error message with "Retry" button
- [ ] Dashboard shows next 3–5 upcoming live classes
- [ ] Each class card displays: title, date, time, scheduled status
- [ ] Each card has a "Launch" or "View" CTA button
- [ ] Data comes from `GET /live/classes/upcoming` API

---

### 1c. System Health Metrics Module

| Area | Details |
|---|---|
| **Data source** | `GET /api/v1/admin/insights` summary (already exists) or new lightweight endpoint |
| **New component** | `modules/dashboard/components/system-health.tsx` |
| **Added to** | Top of dashboard, above Action Required, rendered as a horizontal metrics bar |

#### Acceptance Criteria
- [ ] **Loading state:** skeleton stat cards (pulse animation) while fetching
- [ ] **Error state:** metric cards show "—" in place of values with a subtle error indicator; does not block the rest of the dashboard
- [ ] Dashboard shows 4 stat cards in a row: Active Students (7-day), Tests Conducted (this week), Content Published (total), Average Attendance (%)
- [ ] Each card shows a numeric value plus a trend direction indicator (up/down arrow)
- [ ] Each card uses color coding: green (healthy), yellow (warning), red (critical) based on thresholds
- [ ] Data updates on page load (no stale data)

---

### 1d. Wire Up Notifications to Top Nav

| Area | Details |
|---|---|
| **Data source** | `GET /api/v1/notifications`, `PATCH /api/v1/notifications/status` (already exist) |
| **New API client service** | `services/notification.service.ts` — `getNotifications()`, `markAsRead()` |
| **New TanStack hooks** | `useNotificationsQuery`, `useMarkNotificationReadMutation` in `hooks/notification/` |
| **Modified component** | `app-navbar.tsx` — add notification bell dropdown between breadcrumbs and user avatar |

#### Acceptance Criteria
- [ ] **Loading state:** bell icon shows no badge while notifications are loading (avoids false-zero)
- [ ] **Empty state:** bell shows no badge; dropdown says "No new notifications"
- [ ] **Error state:** bell shows no badge; dropdown says "Unable to load notifications" with a "Retry" link
- [ ] Bell icon in top nav shows unread notification count badge
- [ ] Clicking bell opens a dropdown with the 5 most recent notifications
- [ ] Each notification shows: type icon, message, timestamp, read/unread indicator
- [ ] Clicking a notification marks it as read (PATCH to `/notifications/status`)

---

## Phase 2 — Wire Up Placeholder Routes

Goal: Replace all `Hello` divs with functional pages. Every sidebar link leads to real content.

> **Error & empty states** are a requirement of every page defined below. Each page must handle: loading (spinner or skeleton), empty (descriptive message), error (message + retry). API failures must never produce a blank screen.

### 2a. Content Page

| Area | Details |
|---|---|
| **Data source** | `GET /api/v1/subjects`, `GET /subjects/{id}/chapters`, `GET /chapters/{id}/topics`, `GET /topics/{id}/videos`, `GET /topics/{id}/notes/official`, `GET /topics/{id}/quizzes` (all exist) |
| **New API client services** | `services/content/subject.service.ts`, `services/content/chapter.service.ts` |
| **New TanStack hooks** | `useSubjectsQuery`, `useChaptersQuery`, `useTopicsQuery` |
| **Modified routes** | `/content` and `/content/topic/$id` |

#### Acceptance Criteria
- [ ] **Loading state:** skeleton list items while subjects/chapters/topics load
- [ ] **Empty state:** "No subjects found" with guidance to add content
- [ ] **Error state:** inline message with "Retry" per section; failure in one section does not break others
- [ ] `/content` shows a list of subjects fetched from `GET /subjects`
- [ ] Clicking a subject reveals its chapters; clicking a chapter reveals its topics
- [ ] Each topic links to `/content/topic/$id`
- [ ] `/content/topic/$id` shows: topic name (from loader), related videos, official notes, related quizzes
- [ ] Breadcrumbs update correctly for all levels (Subject > Chapter > Topic)

---

### 2b. Tests & Quizzes Page

| Area | Details |
|---|---|
| **Data source** | `GET /api/v1/quizzes/{id}`, `GET /quizzes/{id}/questions`, `GET /topics/{id}/quizzes` (all exist) |
| **New API client service** | `services/quiz.service.ts` |
| **New TanStack hooks** | `useQuizQuery`, `useQuizQuestionsQuery` |
| **Modified route** | `/quizzes` |

#### Acceptance Criteria
- [ ] **Loading state:** skeleton table rows while quizzes load
- [ ] **Empty state:** "No quizzes created yet" with a "Create Quiz" CTA
- [ ] **Error state:** error banner with "Retry"
- [ ] `/quizzes` shows a list of quizzes with: title, subject, question count, status
- [ ] Clicking a quiz shows detail page with questions and pending review count
- [ ] Breadcrumb reads "Tests & Quizzes"

---

### 2c. Live Classes Page

| Area | Details |
|---|---|
| **Data source** | `GET /api/v1/live/classes/upcoming`, `POST /live/classes/{id}/join`, `GET /live/classes/{id}/recording` (all exist) |
| **Modified route** | `/live-classes` |

#### Acceptance Criteria
- [ ] **Loading state:** skeleton cards while sessions load
- [ ] **Empty state:** "No live classes scheduled" with a "Schedule a Class" button
- [ ] **Error state:** error message with "Retry"
- [ ] `/live-classes` shows a schedule/list of all upcoming and past live sessions
- [ ] Each session shows: title, scheduled date/time, status (upcoming/live/completed), attendance count
- [ ] "Create Class" button/modal to schedule a new session
- [ ] Breadcrumb reads "Live Classes"

---

### 2d. Community Page

| Area | Details |
|---|---|
| **Data source** | `GET /api/v1/community/topics/{id}/threads`, `POST /community/threads`, `GET /community/threads/{id}/posts` (all exist) |
| **New API client service** | `services/community.service.ts` |
| **New TanStack hooks** | `useThreadsQuery`, `usePostsQuery` |
| **Modified route** | `/community` |

#### Acceptance Criteria
- [ ] **Loading state:** skeleton thread list while loading
- [ ] **Empty state:** "No discussions yet — be the first to start a thread" with a "New Thread" button
- [ ] **Error state:** error message with "Retry"
- [ ] `/community` shows a topic-selector and a list of threads for the selected topic
- [ ] Each thread shows: title, author, post count, last activity timestamp
- [ ] Clicking a thread expands to show posts
- [ ] Breadcrumb reads "Community"

---

### 2e. Analytics Page

| Area | Details |
|---|---|
| **Data source** | `GET /api/v1/admin/insights/topics` (already exists, reuse from 1a) |
| **Modified route** | `/analytics` |

#### Acceptance Criteria
- [ ] **Loading state:** skeleton table while data loads
- [ ] **Empty state:** "No analytics data available yet — data appears once students complete assessments"
- [ ] **Error state:** error banner with "Retry"
- [ ] `/analytics` shows the topic performance table from the insights API
- [ ] Table columns: Topic Name, Chapter, Subject, Recall (MCQ), Recall (Reflection), Practice Accuracy, Students Affected
- [ ] Sortable by any column
- [ ] Searchable by topic/chapter/subject name
- [ ] Breadcrumb reads "Analytics"

---

### 2f. Settings Page

| Area | Details |
|---|---|
| **No new API needed** | Profile data already available from `/auth/me` via `useMyProfileQuery` |
| **Modified route** | `/settings` |

#### Acceptance Criteria
- [ ] **Loading state:** skeleton profile card while user data loads
- [ ] **Error state:** error message with "Retry"
- [ ] `/settings` shows basic user profile info (name, email, avatar)
- [ ] Account preferences section (placeholder or functional)
- [ ] Logout button works
- [ ] Breadcrumb reads "Settings"

---

## Phase 3 — Foundation Polish

Goal: Production-quality UX — search, filtering, loading states, responsive layout, accessibility.

### 3a. Global Search

| Area | Details |
|---|---|
| **New component** | `components/command-palette.tsx` — `Cmd+K` / `Ctrl+K` trigger |
| **Search targets** | Students, topics, quizzes, classes |

#### Acceptance Criteria
- [ ] `Cmd+K` or `Ctrl+K` opens a command palette
- [ ] Search queries students, topics, quizzes, and classes simultaneously
- [ ] Results appear within 300ms of typing, grouped by category
- [ ] Selecting a result navigates to the corresponding page
- [ ] `Esc` closes the palette

---

### 3b. Dashboard Filtering

| Area | Details |
|---|---|
| **Modified component** | `action-required.tsx` — add filter controls |

#### Acceptance Criteria
- [ ] Action Required module has filter controls for: severity (danger/warning/info/success/neutral), insight type (quiz review, attendance, difficulty, engagement), time period (7d, 30d, 90d)
- [ ] Filtering updates the displayed insights without page reload
- [ ] Active filter count shown as a badge on the filter button

---

### 3c. Skeleton Loading States

| Area | Details |
|---|---|
| **Components to update** | All dashboard modules + all Phase 2 pages |

#### Acceptance Criteria
- [ ] Every dashboard module shows a skeleton placeholder while data loads
- [ ] Every Phase 2 page shows a skeleton or spinner during initial load
- [ ] No layout shift between skeleton and loaded content

---

### 3d. Mobile Responsiveness

| Area | Details |
|---|---|
| **Layout updates** | Dashboard grid, sidebar, top nav |

#### Acceptance Criteria
- [ ] Dashboard modules stack to single column on screens < 768px
- [ ] Sidebar collapses to hamburger-menu on mobile
- [ ] Top nav remains usable with truncated breadcrumbs
- [ ] All Phase 2 pages remain readable at 320px–768px widths

---

### 3e. Keyboard Shortcuts

| Area | Details |
|---|---|
| **New utility** | `hooks/use-keyboard-shortcuts.ts` |

#### Acceptance Criteria
- [ ] `g d` → Dashboard, `g c` → Content, `g q` → Quizzes, `g l` → Live Classes
- [ ] `?` shows a shortcut cheat sheet overlay
- [ ] Shortcuts only fire when no input field is focused

---

### 3f. Sidebar Hover Tooltips

| Area | Details |
|---|---|
| **Modified component** | `sidebar-menu-list-item.tsx` — wrap with `<Tooltip>` |

#### Acceptance Criteria
- [ ] Every sidebar item shows a tooltip with its label after 500ms hover
- [ ] Insight cards show tooltip on truncated text

---

### 3g. Essential Accessibility Baseline

| Area | Details |
|---|---|
| **Components to audit** | All dashboard modules, sidebar, top nav, Phase 2 pages |

#### Acceptance Criteria
- [ ] **Focus indicators:** every interactive element (links, buttons, inputs, CTA cards) has a visible focus ring — never `outline: none` without a custom replacement
- [ ] **Color contrast:** all text meets WCAG AA minimum (4.5:1 normal, 3:1 large); verified against the dark-theme palette
- [ ] **ARIA labels:** icon-only buttons (bell, avatar dropdown, sidebar trigger, search trigger) have `aria-label` describing the action
- [ ] **Colorblind-safe indicators:** status badges (Weak / Medium / Strong, severity colors) use a shape or text label in addition to color — never color alone
- [ ] **Landmark regions:** main content area is wrapped in `<main>`, sidebar in `<nav>`, top nav in `<header>` with appropriate roles
- [ ] **Tab order:** navigating with Tab key moves through interactive elements in a logical left-to-right, top-to-bottom order; no focus traps

## Dependency Graph

```
Phase 1a ─┐
Phase 1b ─┤
Phase 1c ─┤
Phase 1d ─┘
              │
              ▼
         Phase 2a ─── Phase 2b ─── Phase 2c ─── Phase 2d
              │
              ▼
         Phase 2e ─── Phase 2f
              │
              ▼
           Phase 3
```

Phases 1a–1d can be done in parallel. Phases 2a–2f can be done in parallel once Phase 1 is complete. Phase 3 depends on everything above it.

---

## Go / No-Go Gate: Ready for AI Integration

All of the following must be true before any AI work begins:

- [ ] All 5 dashboard modules render real data and are fully interactive
- [ ] Sidebar navigation to all 7 routes results in fully functional pages (not placeholders)
- [ ] No console errors or API failures in normal flow
- [ ] At minimum, Content and Quizzes pages support drill-down to detail views
- [ ] Notifications are wired and displaying in top nav
- [ ] Dashboard modules show skeleton loading states during data fetch
- [ ] Basic mobile responsiveness verified at 375px and 768px breakpoints
- [ ] Every module handles loading, empty, and error states without page-level crashes
- [ ] Essential accessibility baseline met: focus rings visible, icon-only buttons have aria-labels, status indicators are colorblind-safe

---

## Effort Summary

| Phase | New Components | New API Services | New TanStack Hooks | Backend Changes |
|---|---|---|---|---|
| 1a — Pain Points | 1 | 1 | 1 | None |
| 1b — Upcoming Classes | 1 | 1 | 1 | None |
| 1c — System Health | 1 | 0 | 0 | Minor (or reuse) |
| 1d — Notifications | 1 | 1 | 2 | None |
| 2a — Content | ~3 pages | 2 | 3 | None |
| 2b — Quizzes | ~2 pages | 1 | 2 | None |
| 2c — Live Classes | 1 page | 0 | 0 | None |
| 2d — Community | 1 page | 1 | 2 | None |
| 2e — Analytics | 1 page | 0 | 0 | None |
| 2f — Settings | 1 page | 0 | 0 | None |
| 3 — Polish | ~2 utilities | 0 | 0 | None |
| **Total** | **~14 components** | **7 services** | **11 hooks** | **None** |

No backend changes required — all data is already served by existing Rust endpoints.
