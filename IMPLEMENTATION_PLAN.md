# Implementation Plan: Dashboard + Core Routes

> Supersedes the previous Phases 1-3 plan. All acceptance criteria from the prior plan are incorporated below with updated status.

### Implementation Order

```txt
  2 (Dashboard Core UI)
  │
  3 (Action Required)
  │
  3.5 (Reliability Baseline — shared DashboardModule state contract)
  │
  6 (System Health — lowest complexity, validates module architecture)
  │
  4 (Student Pain Points — table, pagination, sorting)
  │
  5 (Upcoming Live Classes — cards, create modal, status chips)
  │
  7 (Backend Analytics — fix attendance stub, teacher filter)
  │
  8a (Release Blocking — a11y, crash isolation, responsive, utility tests)
  │
  8b (Runtime Validation — Playwright loading/error/hydration/offline)
  │
  8a.5 (Productivity UX — keyboard shortcuts, command palette, global search)
  │
  8c (Real API E2E — full stack, visual regression, hydration checks)
```

### Phase Summary

| Phase | Focus | Backend Dep | Test Added | Blocking |
|---|---|---|---|---|
| 1 | Foundation Setup | — | — | ✅ Done |
| 2 | Dashboard Core UI | None | 2 | ❌ Partial (3/6 criteria) |
| 3 | Action Required Section | Insights query | 8 | ❌ Partial (3/7 criteria) |
| 3.5 | **Reliability Baseline** | Phase 3 | 7 | ❌ Not started |
| 6 | **System Health** | Insights query | 6 | ❌ Not started |
| 4 | Student Pain Points | Topic perf query | 9 | ❌ Not started |
| 5 | Upcoming Live Classes | Live class query | 7 | ❌ Not started |
| 7 | Backend Analytics Logic | Insights repository | 3 | ⏳ Partial (4/6 tasks) |
| 8a | Release Blocking | Phase 2–7 complete | 6 | ❌ Not started |
| 8b | Runtime Validation | Phase 8a complete | 14 categories | ❌ Not started |
| 8a.5 | Productivity UX | Phase 8a complete | 0 | ❌ Not started |
| 8c | Real API E2E | Phase 8b complete | ~51 total | ❌ Not started |

---

## Phase 1 — Foundation Setup

**Status: ✅ Complete**

All items fully implemented.

| Task | What exists |
|---|---|
| Setup frontend project structure | React 19 + TanStack React Start (SSR) + TanStack Router + TanStack Query + TanStack React Form + Tailwind v4 + shadcn/ui + Biome |
| Setup backend service structure | Axum 0.8 + SeaORM 1.1 + PostgreSQL 16+ with clean architecture: `http/handlers/` → `application/` → `domain/` → `infra/` |
| Configure authentication/session | Auth.js (credentials provider) on frontend, JWT access/refresh tokens with cookie & bearer on backend, bcrypt password hashing |
| Setup database and analytics models | 16 SeaORM migrations across 7 domains, insights repository with 5 methods (quizzes pending review, low attendance, difficult topics, low engagement, topic performance) |
| Configure routing and state management | TanStack Router (file-based, auto-generated `routeTree.gen.ts`), TanStack Query with SSR integration (`setupRouterSsrQueryIntegration`), `@aspiron/tanstack-client` workspace package |
| Setup testing frameworks | Vitest + jsdom + MSW (@testing-library/react), Playwright (Chromium), testcontainers Postgres + tower `ServiceExt::oneshot` (Rust), insta snapshots, `just ci` with husky + lint-staged |

### Test Deliverables

| Item | Status |
|---|---|
| Backend harness (TestApp + testcontainers) | ✅ 8 tests |
| Frontend vitest setup (jsdom + MSW) | ✅ Configured |
| `@aspiron/test-utils` factories package | ✅ 9 factory modules across all domains |
| CI pipeline (`ci-fast`/`ci-medium`/`ci-slow`) | ✅ `just ci` via husky + lint-staged |
| Contract coverage metrics | ✅ `just contract-coverage` |

---

## Phase 2 — Dashboard Core UI

**Status: ⏳ Partial** (4/6 tasks done)

### Tasks

| Task | Status | Details |
|---|---|---|
| Build sidebar navigation | ✅ Done | 6 shadcn sidebar components (`sidebar-root`, `sidebar-context`, `sidebar-menu`, `sidebar-layout`, `sidebar-group`, `sidebar.tsx` barrel) + `app-sidebar.tsx` + `sidebar-config.tsx` (7 nav items: Dashboard, Content, Tests & Quizzes, Live Classes, Community, Analytics, Settings) + active-state detection via `useLocation()` |
| Build top navigation/header | ✅ Done | `app-navbar.tsx` — sticky with `backdrop-blur-xl`, SidebarTrigger, breadcrumbs from `useBreadcrumbs()`, user avatar dropdown with logout |
| Create dashboard layout | ✅ Done | `_private-routes.tsx` — auth guard → SidebarProvider → AppSidebar → SidebarInset → AppNavbar → Outlet |
| Implement responsive behavior | ✅ Done | Sheet overlay on mobile (< 768px), `useIsMobile()` hook with `matchMedia`, cookie-persisted sidebar state, `Ctrl+B` keyboard shortcut toggle |
| Add loading/skeleton states | ❌ Not done | `<Skeleton>` component exists but **not wired** into `ActionRequired` or `InsightCard`. Currently `data?.insights` could be `undefined` causing `.map()` crash |
| Add empty/error states | ❌ Not done | No `isError` check, no empty-array guard, no retry button in `ActionRequired` or `InsightCard` |

### Test Deliverables

| Test Category | Coverage | Status |
|---|---|---|
| **Component** — Sidebar rendering | Verify sidebar renders nav items, active states, collapse toggle | ❌ Not done |
| **Component** — Header rendering | Verify navbar renders breadcrumbs, user avatar, sidebar trigger | ❌ Not done |
| **Component** — Skeleton states | Verify `<Skeleton>` shows during loading | ❌ Not done |
| **Feature Component** — Full dashboard layout | Verify SidebarProvider + AppSidebar + AppNavbar + Outlet render correctly | ❌ Not done |

### Acceptance Criteria

- [ ] ✅ Sidebar renders 7 navigation items with active-state highlighting
- [ ] ✅ Sidebar collapses to icon mode on desktop, sheet overlay on mobile
- [ ] ✅ Top nav shows breadcrumbs matching current route
- [ ] ✅ User avatar dropdown shows profile and logout
- [ ] ❌ `ActionRequired` shows skeleton placeholders while `useInsightQuery` is loading
- [ ] ❌ `ActionRequired` shows "No items need attention" when `data.insights` is empty
- [ ] ❌ `ActionRequired` shows error message with "Retry" button on API failure
- [ ] ❌ No layout shift between skeleton and loaded content

### TanStack Query Runtime Configuration

Set default query behavior before building any dashboard modules. These options must be in place for runtime tests (Phase 8b) to be deterministic.

```ts
// QueryClient defaults
defaultOptions: {
  queries: {
    retry: 1,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  }
}
```

Module-specific polling (set at hook level):
| Module | Polling |
|---|---|
| System Health | `refetchInterval: 60_000` |
| Upcoming Classes | `refetchInterval: 30_000` |
| Action Required | Manual / focus only |
| Student Pain Points | Focus only |

### Test ID Convention (shared infrastructure)

Add `data-testid` and `data-dashboard-section` attributes to components as they are created — **not retrofitted later**. These are shared infrastructure used by component tests, MSW tests, runtime Playwright, and real API E2E.

| Test ID | Element | Applied When |
|---|---|---|
| `data-testid="insight-skeleton"` | Skeleton placeholder in ActionRequired | Phase 3 |
| `data-testid="insight-error"` | Error state container in ActionRequired | Phase 3 |
| `data-testid="retry-button"` | Retry CTA in any module error state | Phase 3 |
| `data-testid="pain-point-table"` | Student Pain Points table container | Phase 4 |
| `data-testid="pain-point-skeleton"` | Skeleton for Pain Points loading | Phase 4 |
| `data-testid="system-health-card"` | Individual system metric stat card | Phase 6 |
| `data-testid="class-card"` | Upcoming class schedule card | Phase 5 |
| `data-testid="class-skeleton"` | Skeleton for upcoming classes loading | Phase 5 |
| `data-testid="sidebar-mobile-toggle"` | Mobile sidebar hamburger button | Phase 2 |
| `data-dashboard-section="action-required"` | Action Required section container | Phase 3 |
| `data-dashboard-section="pain-points"` | Student Pain Points section container | Phase 4 |
| `data-dashboard-section="upcoming-classes"` | Upcoming Live Classes section container | Phase 5 |
| `data-dashboard-section="system-health"` | System Health section container | Phase 6 |

---

## Phase 3 — Action Required Section

**Status: ⏳ Partial** (4/5 tasks done)

### Tasks

| Task | Status | Details |
|---|---|---|
| Build alert cards | ✅ Done | `<InsightCard>` handles 4 insight types: `topic_difficulty`, `quiz_review_pending`, `low_attendance`, `low_engagement`. `<ActionRequired>` maps over `data.insights` array. Tests exist. |
| Add severity indicators | ✅ Done | `<IconContainer>` with `severityVariants` cva — 5 levels (danger/warning/success/info/neutral), gradient backgrounds, border + text colors |
| Add CTA buttons | ✅ Done | `SimpleActionButton` (severity-styled button with metadata), `TopicDifficultyActionButton` (link to `/content/topic/$id` via `useGetTopicByIdQuery`) |
| Implement dynamic rendering from backend | ✅ Done | Full pipeline: `useInsightQuery` → `@aspiron/api-client` → `GET /api/v1/admin/insights` → backend handler → application → repository (4 real queries) |
| **Add loading/empty/error states** | ❌ Not done | Skeleton, empty message, and error+retry are missing from both `ActionRequired` and `InsightCard` |

### Test Deliverables

| Test Category | Coverage | Status |
|---|---|---|
| **Feature Component** — Loading state | `isLoading: true` → skeleton renders, no crash | ❌ Not done |
| **Feature Component** — Empty state | `data.insights: []` → empty message renders | ❌ Not done |
| **Feature Component** — Error state | `isError: true` → error message + "Retry" button renders | ❌ Not done |
| **MSW** — Failed API response | MSW returns 500 → component shows error state | ❌ Not done |
| **MSW** — Delayed response | MSW delays 2s → skeleton shows during delay | ❌ Not done |
| **MSW** — Empty response | MSW returns `{ insights: [] }` → empty state renders | ❌ Not done |
| **Factory** — Alert object generation | `buildAlertResponse()` with severity, type, metadata overrides | ❌ Not done |
| **Snapshot** — Alert object structure | `insta`-style snapshot of Insight response shape | ❌ Not done |

### Acceptance Criteria

- [ ] ✅ 4 insight types render with correct icons, metadata, and CTAs
- [ ] ✅ Severity colors match danger/warning/success/info/neutral
- [ ] ✅ Topic difficulty card links to `/content/topic/$id`
- [ ] ❌ Loading state renders skeleton pulse placeholders
- [ ] ❌ Empty state shows "No items need attention right now"
- [ ] ❌ Error state shows error message with "Retry" button
- [ ] ❌ API failure in this module does not crash other dashboard modules
- [ ] ❌ Section container has `data-dashboard-section="action-required"`
- [ ] ❌ Each insight card has `data-testid` for runtime testing



---

## Phase 3.5 — Dashboard Reliability Baseline (Shared Module State Contract)

**Status: ❌ Not Started**

**Rationale:** Before adding Pain Points (Phase 4), Upcoming Classes (Phase 5), or System Health (Phase 6), standardize the module render contract. Every dashboard section implements the same 4-state pattern, preventing duplicated state logic and making runtime testing (Phase 8b) dramatically simpler.

### Tasks

| Task | Pre-requisites | Status |
|---|---|---|
| Create `<DashboardModule>` wrapper component | None | ❌ Not done |
| Implement loading skeleton container per module shape | None | ❌ Not done |
| Implement empty state with meaningful message + CTA | None | ❌ Not done |
| Implement error state with retry button | None | ❌ Not done |
| Refactor ActionRequired to use `DashboardModule` | Phase 3 complete | ❌ Not done |
| Verify module isolation: one module's failure does not affect others | Phase 3 complete | ❌ Not done |

### `DashboardModule` Component Spec

```tsx
interface DashboardModuleProps<T> {
  title: string
  sectionId: string          // data-dashboard-section value
  query: UseQueryResult<T>   // TanStack Query result
  skeleton: ReactNode        // skeleton placeholder matching final layout
  empty: DashboardEmpty      // { title: string; description: string; action?: { label: string; onClick: () => void } }
  render: (data: T) => ReactNode
}
```

Every section implements this exact contract:

| State | Condition | Behavior |
|---|---|---|
| **Loading** | `query.isLoading` | Show `skeleton` placeholder; no layout shift vs final content |
| **Error** | `query.isError` | Show error message + "Retry" button calling `query.refetch()` |
| **Empty** | `data` is empty/null/undefined | Show `empty.title` + `empty.description` + optional `empty.action` CTA |
| **Success** | `data` is populated | Call `render(data)` to display final content |

### Failure Isolation Principle

Each `DashboardModule` is wrapped in an `ErrorBoundary` (or equivalent try/catch at the module level). An API failure or render crash in one module must:
- Show an inline error indicator for that module
- NOT propagate up to crash the parent dashboard page
- NOT affect content or visibility of other modules

### New Code Required

| Artifact | Path |
|---|---|
| Component | `apps/web-admin/src/features/dashboard/components/dashboard-module.tsx` |
| Skeleton variants | `apps/web-admin/src/features/dashboard/components/dashboard-skeletons.tsx` |
| Error boundary | `apps/web-admin/src/features/dashboard/components/module-error-boundary.tsx` |

### Acceptance Criteria

- [ ] `DashboardModule` renders skeleton when `query.isLoading` is true
- [ ] `DashboardModule` renders error block with retry when `query.isError` is true
- [ ] `DashboardModule` renders empty message when data is null/empty
- [ ] `DashboardModule` calls `render(data)` when data exists
- [ ] ActionRequired uses `DashboardModule` — zero custom state logic
- [ ] Module failure isolation confirmed: force error on ActionRequired → System Health still renders
- [ ] No undefined `.map()` crash possible on any dashboard module

---

## Phase 6 — System Health Section

**Status: ❌ Not Started**

### Tasks

| Task | Pre-requisites | Status |
|---|---|---|
| Build metric cards (4 stat cards in a row) | No new backend endpoint needed | ❌ Not done |
| Add trend indicators | Up/down arrows with thresholds | ❌ Not done |
| Implement dynamic stats rendering | Color coding: green/yellow/red | ❌ Not done |

**Backend dependency:** ⚠️ Partial — `GET /api/v1/admin/insights` summary exists. May need a lightweight endpoint for aggregated counts (active students, tests conducted, content published, average attendance).

### New Code Required

| Artifact | Path |
|---|---|
| Component | `apps/web-admin/src/features/dashboard/components/system-health.tsx` |
| Integration | Dashboard `index.tsx` — rendered at top as horizontal metrics bar |
| Tests | `apps/web-admin/src/features/dashboard/__tests__/system-health.test.tsx` |

### Test Deliverables

| Test Category | Coverage | Status |
|---|---|---|
| **Component** — Metric cards | Verify 4 cards render in a row with values | ❌ Not done |
| **Component** — Trend indicators | Up/down arrows render based on trend data | ❌ Not done |
| **Component** — Color coding | Green (> 80%), yellow (50-80%), red (< 50%) thresholds | ❌ Not done |
| **Feature Component** — Loading/error | Skeleton stat cards, "—" fallback on error (uses `DashboardModule`) | ❌ Not done |
| **Factory** — Metric generation | `buildSystemMetricResponse()` | ❌ Not done |
| **Contract Snapshot** — Metric response shape | Snapshot of `GET /api/v1/admin/insights` summary response | ❌ Not done |
| **E2E** — Dashboard load flow | Dashboard loads → all 4 sections render correctly | ❌ Not done |

### Acceptance Criteria

- [ ] **Loading state:** skeleton stat cards via `DashboardModule` skeleton prop (pulse animation, no layout shift)
- [ ] **Error state:** metric cards show error block via `DashboardModule`; does not block rest of dashboard
- [ ] 4 stat cards in a row: Active Students (7-day), Tests Conducted (this week), Content Published (total), Average Attendance (%)
- [ ] Each card shows numeric value + trend direction arrow
- [ ] Color coding: green (healthy), yellow (warning), red (critical)
- [ ] Each card has `data-testid="system-health-card"`
- [ ] Section container has `data-dashboard-section="system-health"`
- [ ] All state handling delegates to `DashboardModule` — no custom loading/error/empty logic in SystemHealth component

---

## Phase 4 — Student Pain Points Section

**Status: ❌ Not Started**

### Tasks

| Task | Pre-requisites | Status |
|---|---|---|
| Build analytics table / topic cards | `useTopicPerformanceQuery` hook | ❌ Not done |
| Add status badges (Weak / Medium / Strong) | `<Badge>` component exists | ❌ Not done |
| Add sorting/filtering support | By recall strength, practice accuracy, students affected | ❌ Not done |
| Add pagination handling | `<Pagination>` component exists | ❌ Not done |

**Backend dependency:** ✅ Already exists — `GET /api/v1/admin/insights/topics` returns topic performance with sorting by recall strength, practice accuracy, students affected.

### New Code Required

| Artifact | Path |
|---|---|
| API service | `packages/api-client/src/services/admin/topic-performance.service.ts` |
| TanStack hook | `packages/tanstack-client/src/hooks/admin/topic-performance.ts` with key `['topic-performance']` |
| Query key | `packages/tanstack-client/src/types/query-keys.ts` — add `topicPerformance` |
| Component | `apps/web-admin/src/features/dashboard/components/student-pain-points.tsx` |
| Integration | `apps/web-admin/src/routes/_private-routes/dashboard/index.tsx` — render below `<ActionRequired />` |

### Test Deliverables

| Test Category | Coverage | Status |
|---|---|---|
| **Component** — Table rendering | Verify topic cards render name, chapter, subject, recall %, accuracy %, students affected, status badge | ❌ Not done |
| **Component** — Status badge rendering | Weak (< 40%) shows warning indicator, Medium (40-70%) shows info, Strong (> 70%) shows success | ❌ Not done |
| **Feature Component** — Loading/empty/error | Uses `DashboardModule` — skeleton, empty message, error+retry | ❌ Not done |
| **Contract Snapshot** — Topic performance response | Snapshot of `GET /api/v1/admin/insights/topics` response shape | ❌ Not done |
| **MSW** — Partial data | MSW returns incomplete topic records → graceful fallback | ❌ Not done |
| **Factory** — Pain point object generation | `buildTopicPerformanceResponse()` with overrides | ❌ Not done |
| **Utility Unit** — Badge mapping | `getStatusBadge(accuracy)` returns Weak/Medium/Strong with correct colors | ❌ Not done |
| **Utility Unit** — Sorting | `sortByWeakness(topics)` sorts ascending by practice accuracy | ❌ Not done |
| **E2E** — Navigation flow | Click topic card → navigates to `/content/topic/$id` | ❌ Not done |

### Acceptance Criteria

- [ ] **Loading state:** skeleton via `DashboardModule`; no layout shift
- [ ] **Empty state:** "No topic data available yet — data appears once students complete recall sessions"
- [ ] **Error state:** retry button via `DashboardModule`; does not crash other modules
- [ ] Topics sorted by weakness (lowest practice accuracy first)
- [ ] Each topic card shows: topic name, chapter, subject, recall strength (MCQ %), practice accuracy (%), students affected, status badge (Weak / Medium / Strong)
- [ ] Weak topics (< 40% accuracy) visually highlighted with warning indicator
- [ ] Clicking topic navigates to `/content/topic/$id`
- [ ] Pagination works for > 10 topics
- [ ] Table container has `data-testid="pain-point-table"`
- [ ] Section container has `data-dashboard-section="pain-points"`

---

## Phase 5 — Upcoming Classes Section

**Status: ❌ Not Started**

### Tasks

| Task | Pre-requisites | Status |
|---|---|---|
| Build class schedule cards | `useUpcomingClassesQuery` hook | ❌ Not done |
| Add class status labels | Status: upcoming/live/completed | ❌ Not done |
| Implement create class action flow | Modal/form for scheduling | ❌ Not done |
| Add schedule navigation | View upcoming, past sessions | ❌ Not done |

**Backend dependency:** ✅ Already exists — `GET /api/v1/live/classes/upcoming`, `POST /live/classes/{id}/join`, `GET /live/classes/{id}/recording`.

### New Code Required

| Artifact | Path |
|---|---|
| API service | `packages/api-client/src/services/live-class/live-class.service.ts` |
| TanStack hook | `packages/tanstack-client/src/hooks/live-class/upcoming.ts` |
| Query key | `packages/tanstack-client/src/types/query-keys.ts` — add `liveClass` |
| Component | `apps/web-admin/src/features/dashboard/components/upcoming-classes.tsx` |
| Integration | Dashboard `index.tsx` — render below Student Pain Points |

### Test Deliverables

| Test Category | Coverage | Status |
|---|---|---|
| **Component** — Class cards | Verify cards render title, date/time, status, CTA button | ❌ Not done |
| **Component** — Status labels | Upcoming/live/completed render correct colors and text | ❌ Not done |
| **Feature Component** — Loading/empty/error | Uses `DashboardModule` — skeleton, empty CTA, error+retry | ❌ Not done |
| **Contract Snapshot** — Upcoming classes response | Snapshot of `GET /api/v1/live/classes/upcoming` response shape | ❌ Not done |
| **MSW** — Empty upcoming classes | MSW returns empty list → empty state renders | ❌ Not done |
| **Factory** — Class object generation | `buildLiveClassResponse()` with overrides | ❌ Not done |
| **Snapshot** — Class object structure | JSON shape snapshot of live class response | ❌ Not done |
| **E2E** — Create class flow | Fill form → submit → class appears in list | ❌ Not done |

### Acceptance Criteria

- [ ] **Loading state:** skeleton via `DashboardModule`; no layout shift
- [ ] **Empty state:** "No upcoming classes scheduled" with "Schedule a Class" CTA
- [ ] **Error state:** retry button via `DashboardModule`; does not crash other modules
- [ ] Shows next 3–5 upcoming live classes
- [ ] Each class card displays: title, date, time, scheduled status
- [ ] Each card has "Launch" or "View" CTA button
- [ ] Each card has `data-testid="class-card"`
- [ ] Section container has `data-dashboard-section="upcoming-classes"`

---

## Phase 7 — Backend Analytics Logic

**Status: ⏳ Partial** (4/6 tasks done)

### Tasks

| Task | Status | Details |
|---|---|---|
| Analytics aggregation logic | ✅ Done | `execute_get_insights` aggregates 4 insight types with severity/search/sort/pagination filtering. `execute_get_topic_performance` with 3 sort modes. |
| Weak-topic detection | ✅ Done | `get_difficult_topics` flags topics with < 60% average progress. `get_topic_performance` calculates recall_strength_mcq, recall_strength_reflection, practice_accuracy, students_affected. |
| Attendance calculations | ⚠️ **Stub** | `get_low_attendance_sessions` uses `topic_id.to_string().len() % 20` as fake attendee count — **needs real query against live_session_attendees table** |
| Dashboard data composition | ✅ Done | Insights handler merges all 4 insight types into unified `DashboardResponse` |
| Teacher subject filtering | ⚠️ **Stub** | `handler_get_topic_performance` returns `None` for teacher subject filter — **needs real teacher→subject mapping** |
| Caching and optimization | ❌ Not done | No cache layer for insights queries |

### Backend Fixes Required

| Fix | Location | Priority |
|---|---|---|
| Replace fake attendee count stub with real DB query | `infra/db/repositories/insights_repo.rs` — `get_low_attendance_sessions` | High |
| Wire teacher subject filtering | `http/handlers/insights.rs` — `handler_get_topic_performance` | Medium |
| Add caching for expensive aggregation queries | New `infra/cache/` module | Low |

### Test Deliverables

| Test Category | Coverage | Status |
|---|---|---|
| **Unit** — Attendance calculations | Verify correct attendee count from DB query | ❌ Not done |
| **Unit** — Weak-topic detection | Verify < 60% threshold, recall strength formulas | ❌ Not done |
| **Unit** — Alert generation logic | Verify severity calculation based on thresholds | ❌ Not done |
| **Integration** — Dashboard aggregation | Full flow: call insights endpoint → verify 4 insight types returned | ❌ Not done |
| **Integration** — Analytics + DB interaction | Verify repository queries return correct aggregated data | ❌ Not done |
| **Scenario** — Weak topic detected | Create student with low recall scores → verify weak topic appears in insights | ❌ Not done |
| **Scenario** — Attendance drop | Create live session with 0 attendees → verify low attendance alert | ❌ Not done |
| **Scenario** — Pending reviews | Create quiz with unanswered questions → verify pending review alert | ❌ Not done |
| **Scenario** — No upcoming classes | No live sessions scheduled → upcoming classes returns empty | ❌ Not done |
| **Snapshot** — Dashboard response structure | JSON shape snapshot of full dashboard response | ❌ Not done |
| **Snapshot** — Analytics payload structure | JSON shape snapshot of topic performance response | ❌ Not done |

---

## Phase 8a — Release Blocking (Foundation Quality)

**Status: ⏳ Not Started**

**Rationale:** Release-blocking quality items that must complete before Phase 8b runtime validation. Non-blocking productivity features (keyboard shortcuts, global search) deferred to Phase 8a.5.

### Tasks

| Task | Status | Details |
|---|---|---|
| Loading/empty/error guards | ❌ Not done | All modules use `DashboardModule` (Phase 3.5) — verify no bare `.map()` calls |
| ARIA labels on icon-only buttons | ❌ Not done | avatar dropdown, search trigger, sidebar mobile toggle |
| Landmark regions | ❌ Not done | `<main>`, `<nav>`, `<header>` on dashboard page |
| Tab order audit | ❌ Not verified | Logical left-to-right, top-to-bottom across all modules |
| Colorblind-safe indicators | ❌ Not done | Severity badges use icon + text in addition to color |
| Color contrast audit | ❌ Not audited | WCAG AA against dark-theme palette |
| Module crash isolation | ❌ Not verified | Force crash in one module → others remain visible |
| No undefined `.map()` crash | ❌ Not verified | All `data?.insights.map()` etc. guarded by `DashboardModule` |
| Mobile responsiveness | ❌ Not done | Single-column layout < 768px, truncated breadcrumbs, 320px–768px readability |
| Performance — Lighthouse audit | ❌ Not audited | Baseline LCP, CLS, TBT metrics for dashboard page |

### A11y Checklist

- [ ] **Focus indicators:** every interactive element has visible focus ring — ✅ Done (all shadcn/ui components have `focus-visible:ring-2`)
- [ ] **Color contrast:** all text meets WCAG AA — ❌ Not audited against dark-theme palette
- [ ] **ARIA labels:** icon-only buttons have `aria-label` — ❌ Not done (avatar dropdown, search trigger, sidebar mobile toggle)
- [ ] **Colorblind-safe indicators:** status badges use shape/text in addition to color — ❌ Not done (severity colors may rely on color alone)
- [ ] **Landmark regions:** `<main>`, `<nav>`, `<header>` — ❌ Not audited
- [ ] **Tab order:** logical left-to-right, top-to-bottom — ❌ Not verified

### Mobile Responsiveness

- [ ] Dashboard modules stack to single column on < 768px
- [ ] Sidebar collapses to hamburger-menu on mobile — ✅ Done
- [ ] Top nav remains usable with truncated breadcrumbs — ❌ Not verified
- [ ] All Phase 2–6 pages remain readable at 320px–768px — ❌ Not verified

### Test Deliverables

| Test Category | Coverage | Status |
|---|---|---|
| **E2E** — Responsive mobile | Viewport 375px → verify dashboard stacks to single column | ❌ Not done |
| **E2E** — Responsive tablet | Viewport 768px → verify sidebar collapse behavior | ❌ Not done |
| **E2E** — Accessibility validation | Run axe-core or Playwright a11y check on dashboard page | ❌ Not done |
| **Utility Unit** — Date formatting | `formatRelativeTime(date)` returns "2 hours ago", "yesterday", etc. | ❌ Not done |
| **Utility Unit** — Percentage formatting | `formatPercentage(0.756)` returns "75.6%" | ❌ Not done |
| **Utility Unit** — Data transformation | `transformInsightResponse(raw)` maps API shape to component props | ❌ Not done |

### Error Handling Standard (via Phase 3.5 `DashboardModule`)

Every module across Phases 2–6 uses `DashboardModule` which enforces exactly 4 states:

| State | Behavior |
|---|---|
| **Loading** | Skeleton placeholder matching final layout dimensions; no layout shift |
| **Empty** | Meaningful message explaining why data is absent and what action to take |
| **Error** | Descriptive error message + "Retry" CTA that re-fetches data |
| **Success** | Data rendered normally |

API failures must never produce a blank screen. Failure in one module must not affect other modules.

---

## Phase 8b — Runtime Behavior & Live UX Validation (Playwright)

**Status: ❌ Not Started**

### Goal

Validate the dashboard the way users actually experience it — loading transitions, polling/refetch behavior, realtime updates, retry flows, optimistic UI, keyboard interactions, responsiveness during runtime, and performance under delayed APIs.

### Runtime Test Categories

| Test Category | Coverage | Status |
|---|---|---|
| **Runtime — Skeleton Transition** | Skeleton visible → replaced with loaded content without layout shift | ❌ |
| **Runtime — Refetch on Focus** | Switching tabs/window refetches dashboard data | ❌ |
| **Runtime — Retry Recovery** | Failed API → Retry button → successful render | ❌ |
| **Runtime — Polling Updates** | Dashboard metrics update without reload | ❌ |
| **Runtime — Live Attendance Updates** | Attendance count changes reflected in UI | ❌ |
| **Runtime — Dynamic Sorting** | Student Pain Points reorder after live data update | ❌ |
| **Runtime — Slow Network** | UI remains interactive during 3G throttling | ❌ |
| **Runtime — Offline Recovery** | Browser offline → reconnect → data restored | ❌ |
| **Runtime — Session Expiry** | Expired JWT redirects to auth without crash | ❌ |
| **Runtime — Mobile Runtime** | Sidebar + cards behave correctly during resize/orientation change | ❌ |
| **Runtime — Keyboard Shortcuts** | `Cmd+K`, `g d`, `g c`, `?` work during active navigation | ❌ |
| **Runtime — Toast Notifications** | Success/error toasts appear and dismiss correctly | ❌ |
| **Runtime — Mutation Feedback** | Create Class flow updates UI instantly | ❌ |
| **Runtime — No Blank States** | Modules never disappear during transitions | ❌ |
| **Rendered — Section Presence** | All 4 dashboard sections visible on page (Action Required, Pain Points, Classes, Health) | ❌ |
| **Rendered — Layout Order** | Sections render in correct visual hierarchy (Health → Action Required → Pain Points → Classes) | ❌ |
| **Rendered — Above Fold** | Header + Action Required visible without scrolling | ❌ |
| **Rendered — Scroll Stability** | Scroll position preserved during query refetch | ❌ |
| **Rendered — Mobile Sections** | Sections stack to single column at 375px, cards remain readable | ❌ |

### Acceptance Criteria

#### Runtime Stability
- [ ] Dashboard never flashes blank during query refetch
- [ ] Skeletons preserve layout dimensions
- [ ] Refetches do not reset scroll position
- [ ] Error in one module never remounts the whole dashboard
- [ ] Query invalidation updates only affected widgets

#### Live UX
- [ ] Retry button restores failed module without page refresh
- [ ] Polling updates metrics/cards automatically
- [ ] UI remains interactive under delayed APIs
- [ ] Runtime resize preserves layout integrity
- [ ] Keyboard shortcuts remain responsive during loading states

#### Rendered Dashboard Validation

##### Section Presence & Order
- [ ] All 4 sections present on page: Action Required, Student Pain Points, Upcoming Live Classes, System Health
- [ ] Sections render in correct visual hierarchy (Health bar → Action Required → Pain Points → Classes)
- [ ] Header + Action Required visible above the fold at 1280px viewport

##### Section Content Fidelity
- [ ] **Action Required** — Exactly 3 insight cards rendered, each with severity icon, description, and CTA button
- [ ] **Student Pain Points** — Table columns present: Topic Name, Recall Strength (MCQ %), Practice Accuracy (%), Students Affected, Status
- [ ] **Upcoming Live Classes** — Each card displays title, scheduled date/time, and status chip (Upcoming/Live/Completed)
- [ ] **System Health** — Exactly 4 stat cards rendered: Active Students, Tests Conducted, Content Published, Average Attendance
- [ ] Each stat card shows numeric value + trend direction indicator (up/down arrow)

##### Runtime Behavior
- [ ] Scroll position preserved during query refetch (no jump)
- [ ] Mobile viewport (375px) preserves readability of all sections
- [ ] Cards stack vertically without overlap at mobile widths
- [ ] Sections remain mounted during partial module failures

##### SSR Hydration Invariant (Required)
- [ ] Console error listener: `page.on('console', msg => expect(msg.text()).not.toContain('hydration'))` — no hydration mismatch warnings
- [ ] Pre-hydration SSR HTML contains all section labels: `expect(html).toContain('Action Required')`, `expect(html).toContain('Student Pain Points')`, `expect(html).toContain('Upcoming Live Classes')`, `expect(html).toContain('Active Students')`
- [ ] No flash-of-wrong-content on hydration (server and client render identical markup)

### Recommended Playwright Structure

```
apps/web-admin/e2e/
├── dashboard/
│   ├── dashboard-runtime.spec.ts
│   ├── dashboard-loading.spec.ts
│   ├── dashboard-retry.spec.ts
│   ├── dashboard-live-updates.spec.ts
│   ├── dashboard-mobile-runtime.spec.ts
│   ├── dashboard-shortcuts.spec.ts
│   └── dashboard-page-sections.spec.ts
```

### Runtime Test Priorities

Priority order for implementation:

1. Loading → success transitions (skeleton stability)
2. Retry recovery (failed module isolation)
3. Partial module failure isolation (one module error ≠ whole page crash)
4. Polling updates (metrics refresh without reload)
5. Mobile runtime resizing (layout integrity during orientation change)
6. Offline/reconnect handling (connection lost → restored)
7. Keyboard shortcuts during async activity
8. No layout shift during hydration

### New Infrastructure

| Item | Purpose |
|---|---|
| +8 Playwright spec files | Runtime + rendered-page E2E specs in `e2e/dashboard/` (includes `dashboard-page-sections.spec.ts`) |
| +4 MSW route handlers | Mock handlers for delayed, offline, polling scenarios |

---

## Phase 8a.5 — Productivity UX (Non-Blocking)

**Status: ❌ Not Started**

**Rationale:** High-polish productivity features (keyboard shortcuts, command palette, global search). These are standalone features that do not block Phase 8b runtime validation or Phase 8c real API E2E. They can be implemented in any order and at any time after Phase 8a.

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `g d` | Navigate to Dashboard |
| `g c` | Navigate to Content |
| `g q` | Navigate to Quizzes |
| `g l` | Navigate to Live Classes |
| `?` | Show shortcut cheat sheet overlay |
| `Cmd+K` / `Ctrl+K` | Open command palette |
| `Esc` | Close palette / cheat sheet |

- [ ] Shortcuts only fire when no input field is focused
- [ ] Cheat sheet overlay is dismissible via `Esc` or click outside

### Global Search Command Palette

- [ ] `Cmd+K` / `Ctrl+K` opens command palette component
- [ ] Search queries students, topics, quizzes, classes simultaneously
- [ ] Results within 300ms, grouped by category
- [ ] Selecting a result navigates to the corresponding page
- [ ] `Esc` closes the palette
- [ ] Accessible: focus trap within palette, `aria-label` on search input

### New Code Required

| Artifact | Path |
|---|---|
| Command palette component | `apps/web-admin/src/components/command-palette.tsx` |
| Keyboard shortcut provider | `apps/web-admin/src/providers/keyboard-shortcuts.ts` |
| Shortcut cheat sheet | `apps/web-admin/src/components/shortcut-cheat-sheet.tsx` |

### Acceptance Criteria

- [ ] `g d` navigates to `/dashboard` from any page
- [ ] `Cmd+K` opens palette with focus in search input
- [ ] Global search returns categorized results within 300ms
- [ ] `Esc` closes palette and cheat sheet
- [ ] Shortcuts do not fire when typing in an input/textarea

---

## Phase 8c — Real API E2E Testing

**Status: ❌ Not Started**

### Goal

Validate the dashboard end-to-end with the real stack — frontend SSR → Axum backend → PostgreSQL — using no mocked API responses. Catches bugs that MSW tests never will: analytics aggregation errors, SSR hydration issues, auth session expiry, polling/refetch against real DB state, and partial module failure isolation.

### E2E Environment

```
Playwright (Chromium)
   ↓
Frontend (React Start SSR, port 3000)
   ↓
Backend API (Axum, port 8082)
   ↓
PostgreSQL Test DB (shared, pre-seeded)
```

### Test DB Strategy

**Shared database** with seed + teardown hooks, not per-test isolated Postgres.

| Service | Purpose |
|---|---|
| **PostgreSQL** | Shared via `docker compose up -d postgres` |
| **Axum backend** | Real API server pointed at test DB config |
| **React frontend** | SSR frontend pointed at real backend |
| **Playwright** | Browser automation against real stack |

#### Seed + Teardown Flow

Each Playwright test suite uses a `globalSetup` / `globalTeardown` pattern:

```
just e2e-start                     # Boot backend + frontend with test DB config
  └─ pnpm --filter web-admin exec playwright test --project=real-api
       ├─ e2e/real-api/globalSetup.ts   # Connect to test DB via pg, insert deterministic records
       │   ├─ insert e2e_run record (tagged with run ID)
       │   ├─ seed weak topics, pending reviews, attendance records
       │   └─ seed live classes (upcoming, live, completed)
       ├─ *.spec.ts                     # Tests assert against known seeded values
       └─ e2e/real-api/globalTeardown.ts # DELETE WHERE e2e_run_id = <run_id>
just e2e-stop                      # Stop services
```

No new Rust code needed for seeding. Playwright test setup connects directly to PostgreSQL via `pg` (node-postgres) and inserts deterministic records with known IDs and values. Teardown deletes by a unique `e2e_run_id` tag.

### Playwright Project Configuration

```ts
// playwright.config.ts
projects: [
  {
    name: 'unit-msw',
    testDir: './e2e/msw',
    // MSW-intercepted runtime tests (Phase 8b)
  },
  {
    name: 'real-api',
    testDir: './e2e/real-api',
    globalSetup: './e2e/real-api/globalSetup.ts',
    globalTeardown: './e2e/real-api/globalTeardown.ts',
    // No MSW — hits real backend
  },
]
```

### Folder Structure

```
apps/web-admin/e2e/
├── real-api/
│   ├── globalSetup.ts           # pg client, seed deterministic data
│   ├── globalTeardown.ts        # Cleanup seeded data
│   ├── dashboard-layout.spec.ts # Auth, SSR, navigation, breadcrumbs
│   ├── dashboard-action-required.spec.ts  # Insights cards from real DB
│   ├── dashboard-pain-points.spec.ts      # Sorting, pagination, dynamic reorder
│   ├── dashboard-classes.spec.ts          # Status rendering, create class
│   ├── dashboard-health.spec.ts           # Aggregation values match DB
│   ├── dashboard-reliability.spec.ts      # Network resilience, recovery
│   ├── dashboard-visual.spec.ts           # Screenshot regression tests
│   └── dashboard-hydration.spec.ts        # Per-section hydration + SSR content
```

### Section-wise Real API E2E Tests

#### Dashboard Layout

| Test Case | Description |
|---|---|
| Authentication flow | Login with real credentials → JWT cookie persisted → session survives navigation |
| SSR hydration | Dashboard SSR renders initial content → no hydration mismatch warnings in console |
| Navigation | Sidebar links load real routes → breadcrumbs update correctly → layout persists |

#### Action Required

| Test Case | Seed | Assertion |
|---|---|---|
| Initial render | 1 weak topic, 1 pending quiz review, 1 low attendance session | 3 insight cards visible with correct data |
| Retry recovery | — | Stop backend → trigger refetch → error state → restart backend → click Retry → cards reappear |
| Module isolation | 1 weak topic, 1 pending review | Insights endpoint fails → other dashboard sections remain rendered |
| Real navigation | 1 topic_difficulty insight | Click topic CTA → navigates to `/content/topic/:id` → topic details load |

#### Student Pain Points

| Test Case | Seed | Assertion |
|---|---|---|
| Sorting | 15 topic records with mixed accuracy (20%–90%) | Weakest topics appear first |
| Pagination | 15 topic records, page size 10 | Page 1 shows 10, Page 2 shows 5 |
| Dynamic update | — | Update a topic's accuracy in DB → trigger refetch → verify reordered table |
| Empty state | 0 topic records | "No topic data available yet" message renders |

#### Upcoming Classes

| Test Case | Seed | Assertion |
|---|---|---|
| Status rendering | 1 upcoming, 1 live, 1 completed class | Each status label renders correctly |
| Create class flow | — | Open modal → submit form → verify card appears in list |
| Live update | 1 upcoming class | Change status to live in DB → poll/refetch → UI updates |

#### System Health

| Test Case | Seed | Assertion |
|---|---|---|
| Aggregation accuracy | X students, Y attendance records, Z content items | Metric card values match actual DB counts |
| Refetch stability | — | Modify a metric in DB → refetch → values update without layout shift |

#### Runtime Reliability

| Test Case | Description |
|---|---|
| Slow API | Playwright route throttling → skeleton persists → UI remains interactive |
| Offline recovery | Browser goes offline → queries fail → error states appear → browser online → queries recover |

### Backend Query Accuracy Validation

End-to-end verification that analytics logic matches real DB state:

| Scenario | Seed | Verify |
|---|---|---|
| Weak topic detected | Students with < 60% recall scores on a topic | Topic appears in Action Required with Weak severity |
| Attendance drop | Session with 2 attendees out of 30 enrolled | Low attendance alert generated |
| Pending reviews | Quiz submission awaiting grading | Pending review insight generated |
| No upcoming classes | Zero live sessions in future range | Upcoming Classes shows empty state |

### Visual & Hydration Validation

End-to-end verification that the rendered dashboard matches the approved visual composition and hydrates without SSR mismatches.

#### Test Cases

| Test Case | Description |
|---|---|
| **Visual regression — dashboard home** | Full-page screenshot of dashboard matches approved baseline (catches spacing, card height, typography, gradient, sidebar width regressions) |
| **Visual regression — dark theme** | Screenshot with dark theme active; prevents CSS variable regressions |
| **Visual regression — mobile** | Screenshot at 375px viewport; verifies stacking, readability, no overlap |
| **Per-section hydration** | Each dashboard section (Health, Action Required, Pain Points, Classes) hydrates independently without console hydration warnings |
| **SSR content match** | Pre-hydration SSR HTML contains section headings and content; no blank server render |

#### New Spec Files

```
apps/web-admin/e2e/real-api/
├── dashboard-visual.spec.ts     # Screenshot regression tests
└── dashboard-hydration.spec.ts  # Per-section hydration + SSR content checks
```

#### Acceptance Criteria

- [ ] Dashboard visually matches approved composition (section order + spacing) against baseline screenshot
- [ ] No visual regressions in dark theme
- [ ] Mobile screenshot shows stacked layout without overlap
- [ ] Zero `hydration` mismatch warnings in console for any dashboard section
- [ ] SSR response HTML contains all 4 section headings before JS execution
- [ ] Visual baseline snapshots checked into repo and updated on intentional UI changes

### Performance Assertions

| Lane | What runs | Frequency |
|---|---|---|
| **ci-fast** | Unit + Component + MSW tests (Phases 2-7) | Every commit |
| **ci-medium** | Rust integration + scenario tests + MSW Playwright (Phase 8b) | PR merge |
| **ci-e2e** | Real API Playwright (Phase 8c) — boot full stack → seed → test → teardown | PR merge (parallel with medium) |
| **ci-slow** | Runtime stress + polling + offline + performance (Phase 8b + 8c extended) | Nightly |

### New Just Recipes

| Recipe | Purpose |
|---|---|
| `just e2e-start` | Boot backend + frontend with test DB config, run migrations, seed test data |
| `just e2e-stop` | Stop E2E backend + frontend services |
| `just ci-e2e` | `just e2e-start && pnpm --filter web-admin exec playwright test --project=real-api && just e2e-stop` |

### New Dependencies

| Package | Purpose |
|---|---|
| `pg` (node-postgres) | Direct DB connection from Playwright global setup for seed/teardown |
| `@playwright/test` | Already installed |

---

## Dependency Graph

```
Phase 1 ── ✅ Complete (foundation)

Phase 2 ── ⏳ Partial (loading/empty/error states missing; test IDs in place)
    │
    └──→ Phase 3 ── ⏳ Partial (uses DashboardModule skeleton/error states)
              │
              └──→ Phase 3.5 ── ❌ (Dashboard Reliability Baseline — creates DashboardModule)
                        │
                        ├──→ Phase 6 ── ❌ (System Health — validates DashboardModule contract)
                        │         │
                        │         └──→ Phase 4 ── ❌ (Pain Points — table, pagination, sorting)
                        │                   │
                        │                   └──→ Phase 5 ── ❌ (Upcoming Classes — cards, modal)
                        │
                        ├──→ Phase 7 ── ⏳ Partial (backend fixes: attendance, teacher filter)
                        │
                        └──→ Phase 8a ── ❌ (Release Blocking: a11y, crash isolation, responsive)
                                  │
                                  └──→ Phase 8b ── ❌ (Runtime Validation: Playwright loading/error/hydration)
                                            │
                                            ├──→ Phase 8a.5 ── ❌ (Productivity UX: shortcuts, command palette)
                                            │
                                            └──→ Phase 8c ── ❌ (Real API E2E: full stack, visual regressions)
```

Phase 7 is independent (backend only) and can run in parallel with Phases 4-6.
Phase 8a.5 is non-blocking and can be started at any time after Phase 8a.
All phases must complete before Phase 8c, but 8a.5 may remain unfinished.

---

## Effort Summary

| Phase | New Components | New API Services | New Hooks | Backend Changes | Test Files |
|---|---|---|---|---|---|
| 2 — Loading/Error states + test IDs | 0 | 0 | 0 | 0 | +4 |
| 3 — Loading/Error states + snapshots | 0 | 0 | 0 | 0 | +3 |
| 3.5 — Reliability Baseline | 2 (`DashboardModule`, `ModuleErrorBoundary`) + skeleton variants | 0 | 0 | 0 | +7 |
| 6 — System Health | 1 (metric cards via DashboardModule) | 0 | 0 | 0 (or minor) | +6 |
| 4 — Pain Points | 1 (table via DashboardModule) | 1 | 1 | 0 | +9 |
| 5 — Upcoming Classes | 1 (cards via DashboardModule) | 1 | 1 | 0 | +7 |
| 7 — Backend Analytics | 0 | 0 | 0 | 2 fixes (attendance stub, teacher filter) | +11 |
| 8a — Release Blocking | 0 | 0 | 0 | 0 | +6 |
| 8b — Runtime + Rendered Validation | 0 | 4 MSW handlers | 0 | 0 | +8 |
| 8a.5 — Productivity UX | 2 (command palette, cheat sheet) | 0 | 1 (keyboard shortcuts) | 0 | 0 |
| 8c — Real API E2E + Visual/Hydration | 0 | 0 | 0 | 0 (seed via pg from Playwright) | +8 |
| **Total** | **~7 components** | **2 services** | **3 hooks** | **2 backend fixes** | **~69 test additions** |
