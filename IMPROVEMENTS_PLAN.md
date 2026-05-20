# Improvements Plan: Post-MVP Enhancements

> These items are intentionally deferred until Phase 3 of the implementation plan is complete. They add production maturity but are not required for core dashboard functionality. Do not start any of these until the Go/No-Go gate in `IMPLEMENTATION_PLAN.md` has passed.

---

## 1. Real-Time Update Strategy

### Rationale

The product plan implies live operational monitoring, but the Phase 1–3 implementation uses page-load fetches only. Adding real-time behavior improves perceived responsiveness and surfaces critical information (attendance drops, new quiz submissions) without manual refresh.

### Scope

#### 1.1 Polling Intervals

| Module | Current Behavior | Proposed Behavior | Interval |
|---|---|---|---|
| Notifications button badge | Fetched on nav load | Background refetch + badge count update | Every 60s |
| Upcoming Live Classes | Fetched on dashboard load | `staleTime` + background refetch | Every 120s |
| System Health Metrics | Fetched on dashboard load | `staleTime` + background refetch | Every 120s |
| Action Required insights | Fetched on dashboard load | `staleTime` + background refetch | Every 300s |

Use TanStack Query's `refetchInterval` option — no WebSocket infra needed.

#### 1.2 WebSocket Future Consideration

If live class attendance tracking or real-time quiz submissions become critical, introduce a lightweight WebSocket connection (e.g., via `socket.io` or native `EventSource`) scoped to:

- Live session attendee count updates
- New quiz submission notifications
- Real-time system health metric pushes

#### 1.3 Optimistic Updates

Existing mutations (mark notification as read) should use TanStack Query's `onMutate` to update the cache immediately and roll back on error. Already partially covered in Phase 1d — extend to:

- Creating a live class session
- Posting a community thread
- Submitting a quiz review

### Acceptance Criteria

- [ ] Notifications badge updates without page reload (max 60s delay)
- [ ] Dashboard insight cards update within 5 minutes of backend data changing
- [ ] Optimistic UI updates for all mutations: UI reflects the change immediately, reverts on API failure
- [ ] No UI flicker or layout shift during background refetch
- [ ] TanStack Query's `networkMode` is configured so refetches respect user's online/offline state

---

## 2. Role-Based Visibility & Permissions

### Rationale

The product plan defines three personas (Subject Teacher, Academic Coordinator, Institute Admin), but Phase 1–3 ships a single universal dashboard. Multi-role support ensures each persona sees only relevant data and actions.

### Scope

#### 2.1 User Roles

| Role | Scope | Dashboard Module Visibility | Sidebar Access |
|---|---|---|---|
| **Subject Teacher** | Own classes and subjects | Dashboard full, Content (own subjects), Quizzes (own), Live Classes (own) | All sidebar items except Analytics and Settings (read-only) |
| **Academic Coordinator** | Cross-class, cross-subject | All modules, cross-class comparisons | All sidebar items with full CRUD |
| **Institute Admin** | Entire institute | All modules + system health with admin thresholds | All sidebar items + admin-only sections |

#### 2.2 Frontend Implementation

| Task | Details |
|---|---|
| Expose role from `useMyProfileQuery` | Backend `MeResponse` already includes roles/permissions via RBAC module |
| Create `useRole()` hook | Returns current user's highest role and a `hasPermission(permission: string)` method |
| Gate sidebar items | `sidebar-config.tsx` accepts optional `requiredRole`; `sidebarmenu-list.tsx` filters items |
| Gate dashboard modules | Each module checks `hasPermission` before rendering; unauthorized users see nothing (not an error) |
| Gate API data | Backend `require_auth` middleware already supports permission checks; frontend passes user context |

#### 2.3 Scoped Data Fetching

- Subject Teacher: Insights API automatically scoped to teacher's subjects (backend `get_teacher_subjects` in `handler.rs` is already wired but returns `None` — fill in the implementation)
- Coordinator/Admin: Full data access

### Acceptance Criteria

- [ ] Logging in as a Subject Teacher shows only their subjects in Content, only their quizzes in Tests & Quizzes
- [ ] Sidebar hides Settings for Subject Teachers (read-only is accessible via profile dropdown)
- [ ] Admin sees a visual badge or indicator on modules that are scoped (e.g., "Viewing as Admin — all classes")
- [ ] `get_teacher_subjects` in the backend insights handler returns real data instead of `None`
- [ ] Unauthorized API calls return 403, and the frontend surfaces a user-friendly "Access restricted" message (not a blank page or console error)

---

## 3. Observability & Analytics Instrumentation

### Rationale

The product plan defines KPIs (instructor engagement, action completion rates, feature adoption), but Phase 1–3 has no instrumentation to measure them. Adding tracking post-MVP ensures data exists to validate product decisions.

### Scope

#### 3.1 Events to Track

| Category | Event Name | Payload | Trigger |
|---|---|---|---|
| **Dashboard** | `dashboard_module_view` | `{ module: 'system_health' \| 'action_required' \| 'pain_points' \| 'upcoming_classes' }` | Module renders on screen |
| | `dashboard_action_cta_click` | `{ insight_type, severity, target_route }` | User clicks an Action Required CTA |
| | `dashboard_topic_drilldown` | `{ topic_id, topic_name, practice_accuracy }` | User clicks a Student Pain Points topic card |
| **Search** | `search_opened` | — | Cmd+K or search icon clicked |
| | `search_query` | `{ query, result_count, selected_result_type }` | User submits a search query |
| **Notifications** | `notification_bell_click` | `{ unread_count }` | Bell icon clicked |
| | `notification_read` | `{ notification_id, notification_type }` | User clicks a notification |
| **Filters** | `dashboard_filter_applied` | `{ module, filter_type, filter_value }` | User applies a dashboard filter |
| **Navigation** | `sidebar_nav_click` | `{ route, label }` | User clicks a sidebar item |
| **Session** | `session_start` | `{ user_id, role }` | User lands on dashboard after auth |
| | `session_duration` | `{ duration_seconds, pages_viewed }` | User logs out or session expires |

#### 3.2 Implementation Approach

| Task | Details |
|---|---|
| Create `useTrack` hook | `hooks/use-track.ts` — wraps a lightweight analytics client; no-op in dev, fires in production |
| Choose backend | Start with a log-to-console approach + a `POST /api/v1/analytics/events` endpoint that writes to a separate `analytics_events` table. Avoid third-party SDKs initially. |
| Add to key components | Wire `useTrack` into: `app-navbar.tsx`, `sidebar-menu-list-item.tsx`, `action-required.tsx`, `student-pain-points.tsx`, `command-palette.tsx` |
| Create a dashboard query | `GET /api/v1/admin/analytics/summary` — returns aggregate event counts for the KPI dashboard |

#### 3.3 KPI Dashboard (Internal)

Build a minimal internal-only `/analytics/kpi` page that shows:

- Daily active instructors (line chart, 30d)
- Action CTA click-through rate (bar chart, by module)
- Drill-down rate from Pain Points to topic detail
- Search adoption rate (% of sessions that use search)
- Notification engagement rate (% of notifications that get clicked)

### Acceptance Criteria

- [ ] All events listed above fire in production without throwing errors
- [ ] Events include `user_id` (anonymized) and `timestamp`; no PII is sent
- [ ] `GET /api/v1/admin/analytics/summary` returns data for the KPI dashboard
- [ ] `/analytics/kpi` page renders aggregate charts for internal use
- [ ] Event tracking can be disabled via an environment variable (`DISABLE_ANALYTICS=true`)
- [ ] Bundle size impact of tracking code < 5KB gzipped

---

## 4. Advanced Accessibility

### Rationale

Phase 3 established an essential accessibility baseline (focus rings, aria-labels, contrast, colorblind-safe indicators). This section extends to full WCAG 2.1 AA compliance for all dashboard and route pages.

### Scope

#### 4.1 Screen Reader Support

| Component | Requirement |
|---|---|
| Dashboard modules | `aria-live="polite"` region that announces "3 insights need attention" or "No new alerts" when data loads |
| Action Required cards | `role="alert"` for high-severity (danger) cards; screen reader announces the title and severity |
| Notifications dropdown | `role="dialog"` with `aria-labelledby`; focus moves into the dialog when opened, returns to bell when closed |
| Command palette | `role="dialog"`, `aria-modal="true"`; screen reader announces "Search — type to filter results" |
| Live class schedule | Announce status changes: "Class 'Organic Chemistry' is now live" |
| Table data (Analytics) | Proper `<th>` scope, `<caption>`, and `aria-sort` on sortable columns |

#### 4.2 Keyboard Navigation Enhancement

| Area | Requirement |
|---|---|
| Dashboard | Arrow keys navigate between Insight Cards; Enter activates the CTA |
| Topic drill-down | Tab through topic details; no information is only accessible on hover |
| Filter controls | All filter dropdowns operable with keyboard (Enter to open, Arrow to select, Esc to close) |
| Modal/dialog focus | Focus is trapped inside dialog; Esc closes; focus returns to trigger element on close |

#### 4.3 Visual Accessibility

| Requirement | Details |
|---|---|
| Focus ring visibility | Minimum 2px offset, 3px width, high-contrast color (e.g., `ring-blue-400` on dark backgrounds) |
| Reduced motion | Respect `prefers-reduced-motion`: disable all animations, transitions, and skeleton pulse effects |
| Text resize | All layouts remain functional at 200% browser zoom; no horizontal scrolling at 1280px viewport |
| Form error announcements | Form validation errors use `aria-describedby` to link input to error message; screen reader announces on blur |

### Acceptance Criteria

- [ ] Dashboard home page passes a basic screen reader audit (VoiceOver or NVDA): all content is navigable and readable without visual reference
- [ ] `aria-live` region announces insight count updates
- [ ] All modal/dialog interactions have correct focus management (trap, return, close)
- [ ] `prefers-reduced-motion` disables all animations site-wide
- [ ] No functionality is lost at 200% browser zoom
- [ ] Keyboard navigation covers every interactive element; no mouse-dependent interactions exist
- [ ] Lighthouse Accessibility score ≥ 90

---

## Implementation Order

```
Phase 1-3 (IMPLEMENTATION_PLAN.md)
        │
        ▼
   ┌────┴────┐
   ▼         ▼
Real-time  Accessibility (advanced)
   │         │
   ▼         ▼
Observability
   │
   ▼
Role-Based
Visibility
```

- **Real-time** and **Advanced Accessibility** are independent and can be done in parallel
- **Observability** benefits from real-time being in place (polling enables session-duration tracking)
- **Role-Based Visibility** depends on observability data to validate the role model is correct before investing in gating

---

## When to Start Each Section

| Section | Trigger |
|---|---|
| Real-time | After Phase 3 is complete and at least 2 weeks of production usage data exists |
| Role-based visibility | When a coordinator or admin user requests differentiated views, or when permission-related support tickets arise |
| Observability | Before any product KPI review meeting where data is expected but unavailable |
| Advanced accessibility | After a QA pass identifies a11y issues, or before a compliance/enterprise sales requirement |

None of these should be started before Phase 3 deliverables are signed off.
