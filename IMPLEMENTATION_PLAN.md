# Implementation Plan: Content Analytics Dashboard Tests

## Legend
- `[ ]` — pending
- `[x]` — done

---

## Architecture (already built)

| Layer | Status | Files |
|---|---|---|
| Backend DTOs (6 response types) | ✅ | `http/responses/content_dashboard.rs` |
| Backend handlers (4 endpoints) | ✅ | `http/handlers/content_dashboard.rs` |
| Backend routes (4 routes) | ✅ | `http/routes/content.rs` |
| TS types (generated) | ✅ | `generated-types/` |
| API client service (4 methods) | ✅ | `services/admin/content-dashboard.service.ts` |
| TanStack hooks (4 hooks + keys) | ✅ | `hooks/admin/content-dashboard.ts` |
| MSW factory (6 builders) | ✅ | `mock/factories/content-dashboard.factory.ts` |
| MSW handlers (4 handlers) | ✅ | `mock/handlers/content-dashboard.handlers.ts` |
| Frontend components (10 files) | ✅ | `features/content-dashboard/components/` |
| Route integration | ✅ | `routes/.../content/_content-layout/index.tsx` |

## Endpoints

| Method | Path | Response |
|---|---|---|
| GET | `/api/v1/content/dashboard/summary` | `ContentDashboardSummary` |
| GET | `/api/v1/content/dashboard/attention` | `ContentDashboardAttentionResponse` |
| GET | `/api/v1/content/dashboard/subjects` | `ContentDashboardSubjectProgress[]` |
| GET | `/api/v1/content/dashboard/signals` | `ContentDashboardSignalsResponse` |

---

## 0. Refactoring Prerequisite

- [x] **Extract `classify_signals` pure function** from `handler_get_content_dashboard_signals` into a testable `pub fn` in `http/handlers/content_dashboard.rs`
  - [x] Create `pub fn classify_signals(scores: &[(String, f64)]) -> (Vec<ContentDashboardSignalItem>, Vec<ContentDashboardSignalItem>)`
  - [x] Call it from the handler instead of inline math
  - [x] Verify: `cargo check -p backend`

---

## 1. Rust Fixtures — Infrastructure

- [x] Add `TestQuiz { id: Uuid, title: String }` to `context.rs`
- [x] Add `create_test_quiz(db, topic_id, title) -> TestQuiz` to `helpers.rs`
- [x] Verify: `cargo check -p backend --tests`

- [x] `tests/unit/mod.rs` → add `mod content_dashboard;` + `mod content_dashboard_snapshot;`
- [x] `tests/integration/mod.rs` → add `mod content_dashboard;`
- [x] `tests/scenarios/mod.rs` → add `mod content_dashboard;`
- [x] Verify: `cargo check -p backend --tests`

---

## 2. Rust Unit Tests — `tests/unit/content_dashboard.rs`

- [x] Create `tests/unit/content_dashboard.rs` (7 tests, all passing)
- [x] **Verify:** `cargo test -p backend --test unit_tests -- unit::content_dashboard`

---

## 3. Rust Snapshot Tests — `tests/unit/content_dashboard_snapshot.rs`

- [x] Create `tests/unit/content_dashboard_snapshot.rs` (6 snapshots, all passing)

---

## 4. Rust Integration Tests — `tests/integration/content_dashboard.rs`

- [x] Create `tests/integration/content_dashboard.rs` (18 tests, all passing)
- [x] **Verify:** `cargo test -p backend --test integration_tests -- integration::content_dashboard`

---

## 5. Rust Scenario Tests — `tests/scenarios/content_dashboard.rs`

- [x] Create `tests/scenarios/content_dashboard.rs` (3 tests)
- [x] **Test: `scenario_admin_views_full_dashboard`** — admin + subject with recall → GET all 4 → 200 + correct counts
- [x] **Test: `scenario_empty_dashboard_for_no_data`** — admin only, no content → all empty/zero
- [x] **Test: `scenario_dashboard_reflects_recall_change`** — 100% not flagged → add wrong answers → now flagged
- [x] **Verify:** `cargo test -p backend --test mod -- scenarios::content_dashboard` ✅

---

## 6. JS Utility Tests — `use-debounce-value.test.ts`

- [x] Create `apps/web-admin/src/hooks/use-debounce-value.test.ts` (6 tests)
- [x] **Test: `returns initial value immediately`**
- [x] **Test: `returns initial value from lazy initializer`**
- [x] **Test: `does not update before delay`**
- [x] **Test: `updates after delay`**
- [x] **Test: `resets timer on rapid calls`**
- [x] **Test: `cleans up timer on unmount`**
- [x] **Verify:** `pnpm --filter web-admin exec vitest run` ✅

---

## 7. JS Factory Tests — `content-dashboard.factory.test.ts`

- [x] Create `apps/web-admin/mock/factories/content-dashboard.factory.test.ts` (10 tests)

### `buildContentDashboardSummary` (2 tests)
- [x] **Test: `creates with default values`**
- [x] **Test: `overrides default values`**

### `buildContentDashboardAttentionItem` (2 tests)
- [x] **Test: `creates with default values`**
- [x] **Test: `overrides fields`**

### `buildContentDashboardAttentionResponse` (2 tests)
- [x] **Test: `creates with requested count`** — count=3
- [x] **Test: `creates with default count`** — count=4

### `buildContentDashboardSubjectProgress` (2 tests)
- [x] **Test: `creates with defaults`** — Physics, 87%
- [x] **Test: `overrides fields`**

### `buildContentDashboardSubjectsResponse` (1 test)
- [x] **Test: `creates requested number of subjects`** — count=3

### `buildContentDashboardSignalItem` (2 tests)
- [x] **Test: `creates with defaults`**
- [x] **Test: `overrides score and drop`**

### `buildContentDashboardSignalsResponse` (1 test)
- [x] **Test: `creates both arrays`** — 3 highest + 3 fastest

- [x] **Verify:** `pnpm --filter web-admin exec vitest run` ✅

---

## 8. MSW Verification — `msw-verification.test.ts`

- [x] Added 4 content dashboard endpoint checks to existing `mock/__tests__/msw-verification.test.ts`
- [x] **Test: `intercepts content dashboard summary`**
- [x] **Test: `intercepts content dashboard attention`**
- [x] **Test: `intercepts content dashboard subjects`**
- [x] **Test: `intercepts content dashboard signals`**
- [x] **Verify:** `pnpm --filter web-admin exec vitest run mock/` ✅

---

## 9. JS Component Tests — 10 files

### 9a. `content-dashboard-page.test.tsx` (8 tests)
- [x] **Test: `renders page heading`**
- [x] **Test: `renders all 4 sections`**
- [x] **Test: `renders metric cards with summary data`**
- [x] **Test: `renders subject cards`**
- [x] **Test: `renders signal sections`**
- [x] **Test: `renders skeleton while summary loads`**
- [x] **Test: `renders error state for summary`**
- [x] **Test: `renders empty state when no subjects`**
- [x] **Test: `calls refetch on refresh button click`**

### 9b. `metric-card.test.tsx` (2 tests)
- [x] **Test: `renders title and value`**
- [x] **Test: `renders skeleton when loading`**

### 9c. `issue-badge.test.tsx` (2 tests)
- [x] **Test: `renders the issue text`**
- [x] **Test: `renders a badge element`**

### 9d. `subject-progress-card.test.tsx` (1 test)
- [x] **Test: `renders subject name and stats`**

### 9e. `progress-bar.test.tsx` (3 tests)
- [x] **Test: `renders with correct width`**
- [x] **Test: `clamps value to 0`**
- [x] **Test: `clamps value to 100`**

### 9f. `quality-signals-section.test.tsx` (2 tests)
- [x] **Test: `renders section header`**
- [x] **Test: `renders both signal cards`**

### 9g. `signal-card.test.tsx` (5 tests)
- [x] **Test: `renders title and description`**
- [x] **Test: `renders empty state when no items`**
- [x] **Test: `renders signal items with score`**
- [x] **Test: `renders signal items with drop`**
- [x] **Test: `renders skeleton when loading`**

### 9h. `loading-skeleton.test.tsx` (4 tests)
- [x] **Test: `MetricCardSkeleton renders`**
- [x] **Test: `AttentionTableSkeleton renders`**
- [x] **Test: `SubjectProgressSkeleton renders`**
- [x] **Test: `SignalsSectionSkeleton renders`**

### 9i. `empty-state.test.tsx` (1 test)
- [x] **Test: `renders title and description`**

### 9j. `content-attention-table.test.tsx` (8 tests)
- [x] **Test: `renders table with items`**
- [x] **Test: `renders issue badges`**
- [x] **Test: `renders skeleton when loading`**
- [x] **Test: `renders empty state when no items`**
- [x] **Test: `shows pagination info`**
- [x] **Test: `calls onSearchChange when typing`**
- [x] **Test: `renders filter dropdown with issue options`**
- [x] **Test: `calls onSortChange when clicking column header`**

- [x] **Verify all component tests:** `pnpm --filter web-admin exec vitest run` ✅ (38 files, 261 tests)

---

## 10. E2E Tests (Mocked) — `e2e/dashboard/content-dashboard.spec.ts`

- [x] Create `apps/web-admin/e2e/dashboard/content-dashboard.spec.ts` (8 tests)
- [x] **Test: `renders all 4 section headers`**
- [x] **Test: `renders metric card values`**
- [x] **Test: `renders attention table rows`**
- [x] **Test: `renders subject progress cards`**
- [x] **Test: `renders quality signal cards`**
- [x] **Test: `shows skeleton while loading`**
- [x] **Test: `recovers after retry on error`**
- [x] **Test: `sections stack vertically at mobile`**
- [x] **Verify:** `pnpm --filter web-admin exec playwright test --project=unit-msw` ✅ 14/18 pass (4 pre-existing dashboard test failures)

---

## 11. E2E Tests (Real API) — `e2e/real-api/content-dashboard.spec.ts`

- [x] Create `apps/web-admin/e2e/real-api/content-dashboard.spec.ts` (4 tests)
- [x] **Test: `dashboard sections are visible`**
- [x] **Test: `shows metric values from seeded data`**
- [x] **Test: `no hydration mismatch warnings`**
- [x] **Test: `SSR content present in HTML`**
- [x] Updated `globalSetup.ts` / `globalTeardown.ts` to seed + cleanup content dashboard data
- [x] Added `loginAsCDAdmin` helper to `login.ts`
- [x] **Verify:** `pnpm --filter web-admin exec playwright test --project=real-api` ✅ 31/31 pass

---

## 12. E2E Tests (Visual Regression) — `e2e/real-api/content-dashboard-visual.spec.ts`

- [x] Create `apps/web-admin/e2e/real-api/content-dashboard-visual.spec.ts` (1 test)
- [x] **Test: `dashboard layout matches baseline`** — screenshot comparison
- [x] **Verify:** `pnpm --filter web-admin exec playwright test --project=real-api` ✅ 31/31 pass

---

## 13. Final Verification

- [x] **Rust:** `cargo test -p backend` — 98 passed (8 pre-existing pain_points failures)
- [x] **JS/TS:** `pnpm --filter web-admin exec vitest run` — 38 files, 261 tests ✅
- [x] **E2E mocked:** `pnpm --filter web-admin exec playwright test --project=unit-msw` — 14/18 pass (4 pre-existing dashboard failures)
- [x] **E2E real API:** `pnpm --filter web-admin exec playwright test --project=real-api` ✅ 31/31 pass
- [x] **Lint:** `pnpm biome check .` — 379 files, clean ✅
- [x] **Format:** `cargo fmt --check` — clean ✅
- [x] **Clippy:** `cargo clippy -- -D warnings` — clean ✅

---

## Summary

| # | Type | File | Tests |
|---|---|---|---|
| — | Refactoring | `http/handlers/content_dashboard.rs` | 1 extraction |
| — | Fixtures | `tests/fixtures/helpers.rs` + `context.rs` | 2 additions |
| 1 | Rust unit | `tests/unit/content_dashboard.rs` | 7 |
| 2 | Rust snapshot | `tests/unit/content_dashboard_snapshot.rs` | 6 snapshots |
| 3 | Rust integration | `tests/integration/content_dashboard.rs` | 19 |
| 4 | Rust scenario | `tests/scenarios/content_dashboard.rs` | 3 |
| 5 | JS utility | `hooks/use-debounce-value.test.ts` | 6 |
| 6 | JS factory | `mock/factories/content-dashboard.factory.test.ts` | 10 |
| 7 | MSW verification | `mock/__tests__/msw-verification.test.ts` | 4 additions |
| 8 | JS component | 10 files in `components/` | ~44 |
| 9 | E2E mocked | `e2e/dashboard/content-dashboard.spec.ts` | 8 |
| 10 | E2E real API | `e2e/real-api/content-dashboard.spec.ts` | 4 |
| 11 | E2E visual | `e2e/real-api/content-dashboard-visual.spec.ts` | 1 |
| | **Total** | | **~137 tests** |
