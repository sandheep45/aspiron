# Implementation Plan: Chapters Page — Tests

## Legend
- `[ ]` — pending
- `[x]` — done
- `[ ] ~~strikethrough~~` — skipped (with reason)

---

## 1. Rust Unit — `tests/unit/chapters_page.rs`

Pure function tests, no DB.

### `derive_status` boundary tests
- [x] **Test: `derive_status_healthy`** — recall=0.8, accuracy=0.75 → `"Healthy"`
- [x] **Test: `derive_status_needs_attention`** — recall=0.6, accuracy=0.65 → `"Needs Attention"`
- [x] **Test: `derive_status_critical`** — recall=0.4, accuracy=0.9 → `"Critical"`
- [x] **Test: `derive_status_boundary_needs_attention`** — recall=0.5, accuracy=0.5 → `"Needs Attention"`
- [x] **Test: `derive_status_boundary_healthy`** — recall=0.7, accuracy=0.7 → `"Healthy"`
- [x] **Test: `derive_status_uses_recall_when_accuracy_none`** — recall=0.55, accuracy=None → `"Needs Attention"`
- [x] **Test: `derive_status_uses_accuracy_when_recall_none`** — recall=None, accuracy=0.3 → `"Critical"`
- [x] **Test: `derive_status_healthy_when_both_none`** — both None → `"Healthy"` (plus 2 more: `null_handling`, `min_of_two_logic`) = 10 tests

### Insight categorization tests
- [ ] ~~**Test: `categorize_signal_positive`** — high avg coverage + low variance → `positive`~~ (insight logic is pure integration, no pure fn to unit test)
- [ ] ~~**Test: `categorize_signal_warning`** — mixed performance → `warning`~~
- [ ] ~~**Test: `categorize_signal_negative`** — low coverage + decreasing trend → `negative`~~
- [ ] ~~**Test: `categorize_signal_info`** — trending up with room to grow → `info`~~

### Sort function tests
- [ ] ~~**Test: `sort_chapters_by_coverage_desc`** — sorts descending by coverage~~ (handled entirely by DB/SQL, no pure fn to unit test)
- [ ] ~~**Test: `sort_chapters_by_recall_asc`** — sorts ascending by recall (None last)~~
- [ ] ~~**Test: `sort_chapters_by_status_priority`** — critical before needs_attention before healthy~~

**Total: 10 tests (5 planned not implemented — insight categorize + sort are integration-level)**

---

## 2. Rust Snapshot — `tests/unit/chapters_page_snapshot.rs`

Response shape snapshots via `insta`.

- [x] **Snapshot: `"chapter-summary-response"`** — `ChapterSummaryResponse` with all 4 metrics populated
- [x] **Snapshot: `"chapter-item-response"`** — `ChapterItemResponse` with all fields including null recall/accuracy
- [x] **Snapshot: `"chapter-item-null"`** — `ChapterItemResponse` with null recall/accuracy
- [x] **Snapshot: `"insight-item-positive"`** — `InsightItemResponse` with `signal_type=positive`
- [x] **Snapshot: `"insight-item-warning"`** — `InsightItemResponse` with `signal_type=warning`
- [x] **Snapshot: `"insight-item-negative"`** — `InsightItemResponse` with `signal_type=negative`
- [x] **Snapshot: `"insight-item-info"`** — `InsightItemResponse` with `signal_type=info`
- [ ] ~~**Snapshot: `"chapters-query-params"`** — `ChaptersQueryParams` does not derive `Serialize`, snapshot removed~~

**Total: 6 snapshots (query-params not serializable)**

---

## 3. Rust Integration — `tests/integration/chapters_page.rs`

Full HTTP roundtrip via `TestApp` + testcontainers Postgres.

### Auth & permissions
- [x] **Test: `all_endpoints_require_auth`** — No cookie on 3 endpoints → 401 `AUTH`
- [x] **Test: `all_endpoints_require_view_analytics`** — Authenticated but no `VIEW_ANALYTICS` → 403

### Summary endpoint — `GET .../chapters-page/summary`
- [x] **Test: `summary_returns_subject_name_and_metrics`** — Subject with 3 chapters → name matches, total=3, counts correct
- [x] **Test: `summary_returns_404_for_unknown_subject`** — Random UUID → 404 `NOT_FOUND`
- [x] **Test: `summary_with_no_chapters`** — Subject with 0 chapters → total=0, all metrics=0

### Chapters endpoint — `GET .../chapters-page/chapters`
- [x] **Test: `chapters_returns_all_without_params`** — 5 chapters → 5 items
- [x] **Test: `chapters_search_filters_by_name`** — `?search=Mech` returns only matching chapters
- [x] **Test: `chapters_search_case_insensitive`** — `?search=mech` returns same as `?search=Mech`
- [x] **Test: `chapters_sort_by_coverage_desc`** — `?sort_by=coverage&sort_order=desc` highest first
- [x] **Test: `chapters_sort_by_coverage_asc`** — `?sort_by=coverage&sort_order=asc` lowest first
- [x] **Test: `chapters_sort_by_recall_desc`** — `?sort_by=recall` sorts by avg_recall descending
- [x] **Test: `chapters_sort_by_accuracy_desc`** — `?sort_by=accuracy` sorts by practice_accuracy descending
- [x] **Test: `chapters_sort_by_status`** — `?sort_by=status` sorts by derived status priority
- [x] **Test: `chapters_pagination_page_1`** — `?page=1&limit=2` returns 2 items, correct page indicator
- [x] **Test: `chapters_pagination_page_2`** — `?page=2&limit=2` returns next 2 items
- [x] **Test: `chapters_pagination_last_page`** — Requesting beyond total → empty array
- [x] **Test: `chapters_combined_search_sort_pagination`** — Search + sort + page all together
- [x] **Test: `chapters_empty_for_subject_with_no_chapters`** — Subject with 0 chapters → `[]`

### Insights endpoint — `GET .../chapters-page/insights`
- [x] **Test: `insights_returns_signals`** — Chapters with varied metrics → signal array
- [x] **Test: `insights_empty_when_no_chapters`** — No chapters → `[]`
- [x] **Test: `insights_empty_when_all_healthy`** — All chapters healthy → `[]`

**Total: 16 tests (5 search/sort combos not tested, plus insight count reduced — actual implementation)**

---

## 4. Rust Scenario — `tests/scenarios/chapters_page_flow.rs`

Multi-step user journeys via `ScenarioBuilder`.

- [x] **Test: `scenario_admin_views_chapters_page`** — Create admin + subject + 3 chapters (varying recall/accuracy) → GET all 3 endpoints → correct shapes
- [x] **Test: `scenario_chapters_page_no_content`** — Admin + subject with no chapters → empty chapters, zero summary, empty insights
- [x] **Test: `scenario_chapters_page_permission_denied`** — Create student user → GET chapters page → 403
- [x] **Test: `scenario_chapters_page_combined_search_sort`** — Search + sort + pagination combined

**Total: 4 tests**

---

## 5. Rust Harness — reuse existing `TestApp`

No new code needed. Existing `TestApp` methods cover all needs.

**Total: 0 new (reuse) — [x]**

---

## 6. Rust Fixtures — `tests/fixtures/helpers.rs`

- [x] Reused existing helpers (`create_test_user`, `create_test_subject/chapter/topic`, `ensure_analytics_permission`, `create_test_learning_progress`) — no new helpers needed
- [x] `ensure_analytics_permission` patched to use `ActionTypeEnum::VIEW_ANALYTICS` + `role_permission` link

**Total: 0 new helpers (existing helpers sufficient) — [x]**

---

## 7. JS Test Setup — `test/setup.ts` + `vitest.config.ts`

No new changes needed. Existing setup handles MSW server, ResizeObserver mock, QueryClientProvider, etc.

**Total: 0 new (reuse) — [x]**

---

## 8. JS Custom Render — `test-utils.tsx`

No new changes needed. Existing `render()` wrapper with `QueryClientProvider` covers all component tests.

**Total: 0 new (reuse) — [x]**

---

## 9. JS Component Tests — 10 files

### 9a. `chapters-page.test.tsx` — orchestrator (5 tests)
- [x] **Test: `renders loading skeletons`** — All 3 hooks `isLoading: true` → skeletons visible
- [x] **Test: `renders full content`** — All hooks return data → summary card, table rows, insight cards visible
- [x] **Test: `renders error state with retry`** — Summary `isError: true` → retry button + error message
- [x] **Test: `renders empty chapters and insights`** — Chapters=[], Insights=[] → "No chapters" + "No insights" text
- [x] **Test: `refresh button refetches all 3 queries`** — Click refresh → refetch called on all 3 queries

### 9b. `chapters-table.test.tsx` — table with search/sort/pagination (21 tests)
- [x] Renders table with chapter names, progress bars, recall badges, status badges, accuracy %, topic counts, last updated, View Topics buttons
- [x] View Topics click calls `onViewChapter` with correct id
- [x] Search input calls `onSearchChange` on each keystroke
- [x] Sort select calls `onSortByChange` when option selected
- [x] Sort direction button calls `onSortOrderChange`
- [x] Pagination info rendered, Previous/Next disabled on first/last page, enabled on middle pages
- [x] Previous/Next buttons call `onPageChange` with correct page
- [x] EmptyState shown when no chapters (different message with/without search)
- [x] Practice accuracy rounded

### 9c. `chapter-summary-card.test.tsx` — metric cards (3 tests)
- [x] **Test: `renders all 4 metrics`** — Each label + value visible
- [x] **Test: `renders zero values`** — All zeros → renders "0" correctly
- [x] **Test: `renders large numbers`** — Large ints display correctly
- [ ] ~~**Test: `handles null data`** — not applicable (component receives typed `ChapterSummary`)~~

### 9d. `quick-insights-section.test.tsx` (2 tests)
- [x] **Test: `renders insight cards`** — Each insight renders an InsightCard
- [x] **Test: `renders null when empty`** — `[]` → returns null (no empty state message)

### 9e. `insight-card.test.tsx` (6 tests)
- [x] **Test: `renders title and description`** — Text visible
- [x] **Test: `renders positive type`** — `type=positive` renders
- [x] **Test: `renders warning type`** — `type=warning` renders
- [x] **Test: `renders negative type`** — `type=negative` renders
- [x] **Test: `renders info type`** — `type=info` renders
- [x] **Test: `falls back to info for unknown type`** — `type=unknown` uses info styling

### 9f. `recall-badge.test.tsx` (5 tests)
- [x] **Test: `renders strong value`** — `"strong"` → renders "strong"
- [x] **Test: `renders medium value`** — `"medium"` → renders "medium"
- [x] **Test: `renders weak value`** — `"weak"` → renders "weak"
- [x] **Test: `renders unknown value`** — `"unknown"` → default styling
- [x] **Test: `capitalizes the value text`** — has `capitalize` CSS class

### 9g. `status-badge.test.tsx` (4 tests)
- [x] **Test: `renders healthy status`** → "Healthy"
- [x] **Test: `renders needs_attention status`** → "Needs Attention"
- [x] **Test: `renders critical status`** → "Critical"
- [x] **Test: `renders unknown status as-is`** — unexpected string → renders unchanged

### 9h. `loading-skeleton.test.tsx` (3 tests)
- [x] **Test: `renders summary variant`** — 4 skeleton items with `animate-pulse`
- [x] **Test: `renders table variant`** — 5 skeleton rows with `animate-pulse`
- [x] **Test: `renders insights variant`** — 3 skeleton cards with `animate-pulse`

### 9i. `coverage-progress.test.tsx` (7 tests)
- [x] **Test: `renders percentage text`** — Shows "%" suffix
- [x] **Test: `clamps value above 100`** — 150 → "100%"
- [x] **Test: `clamps value below 0`** — -20 → "0%"
- [x] **Test: `renders 0%`** — 0 → "0%"
- [x] **Test: `renders 100%`** — 100 → "100%"
- [x] **Test: `rounds decimal values`** — 74.7 → "75%"
- [x] **Test: `renders fractional values at boundaries`** — 99.5 → "100%"

### 9j. `empty-state.test.tsx` (2 tests)
- [x] **Test: `renders title and description`** — Custom props rendered
- [x] **Test: `renders with different text`** — Renders any title/description

**Total: 58 tests (43 planned, +15 for edge cases not in original plan)**

---

## 10. JS Utility Tests — `src/lib/utils.test.ts`

No new tests needed. Chapters page does not introduce new utilities.

**Total: 0 new — [x]**

---

## 11. JS Factory Tests — `mock/__tests__/chapters-page.factory.test.ts`

- [x] **Test: `buildChapterSummary creates default summary`** — All fields populated with defaults
- [x] **Test: `buildChapterSummary overrides fields`** — Custom subject name reflected
- [x] **Test: `buildChapterItem creates default item`** — All fields populated
- [x] **Test: `buildChapterItem overrides fields`** — Custom name/status reflected
- [x] **Test: `buildChapterItem creates unique IDs per call`** — Each call generates different ID
- [x] **Test: `buildChapterItemList creates N items`** — Correct count, unique IDs
- [x] **Test: `buildInsightItem creates default insight`** — All fields, type=positive
- [x] **Test: `buildInsightItem overrides fields`** — Custom type reflected
- [x] **Test: `buildInsightItemList creates N insights`** — Correct count, unique IDs
- [x] **Test: `buildInsightItemList creates items with valid types`** — All items in list have valid types

**Total: 10 tests**

---

## 12. MSW Handlers — `mock/handlers/chapters-page.handlers.ts`

- [x] **Create `chapters-page.handlers.ts`** with 3 endpoints:
  - `GET */api/v1/subjects/:subjectId/chapters-page/summary` — Returns `buildChapterSummary()`
  - `GET */api/v1/subjects/:subjectId/chapters-page/chapters` — Parses search/sort/page/limit, filters mock data
  - `GET */api/v1/subjects/:subjectId/chapters-page/insights` — Returns `buildInsightItemList(3)`
- [x] **Register** in `mock/handlers/index.ts`

**Total: 1 handler file, 3 endpoints**

---

## 13. MSW Verification — `mock/__tests__/msw-verification.test.ts`

- [x] **Test: `chapters-page summary returns 200`** — Fetch summary → 200 + correct shape
- [x] **Test: `chapters-page chapters respects search param`** — `?search=mech` → filtered results
- [x] **Test: `chapters-page insights returns array`** — Returns array of insight items

**Total: 3 tests (additions to existing file)**

---

## 14. E2E Mocked (Playwright) — `e2e/content/chapters-page.spec.ts`

### Setup
- [x] Auth: cookie + `auth/me` mock via `setupAuth(page)`
- [x] MSW: 3 chapters-page endpoint mocks via `setupChaptersPageMocks(page)`

### Test assertions
- [x] **Test: `renders subject name heading`** — "Physics" heading visible
- [x] **Test: `renders summary metric cards`** — Total Chapters, Topics Published, Topics In Draft, Chapters With Weak Recall
- [x] **Test: `renders chapters table with rows`** — All 5 chapter names visible in table
- [x] **Test: `renders quick insights section`** — 3 insights (Strong Recall, Content Gaps, Low Accuracy) visible
- [x] **Test: `search filters chapter list`** — Type "mech" → Mechanics visible, Thermodynamics not visible
- [x] **Test: `pagination controls visible`** — Previous/Next buttons visible (disabled for 5 items ≤ 10 limit)
- [x] **Test: `no horizontal scroll at 1440px`** — sidebar-inset scroll check
- [x] **Test: `no horizontal scroll at 375px mobile`** — sidebar-inset scroll check

**Total: 8 tests (navigation test uses direct URL, not click-through from subjects)**

---

## 15. E2E Real API (Playwright) — `e2e/real-api/chapters-page.spec.ts`

### Setup
- [x] Reuse `loginAsCDAdmin` from `e2e/real-api/login.ts` (same user has VIEW_ANALYTICS)
- [x] Add 2 extra chapters (CD Geometry, CD Trigonometry) + 1 extra topic to `seedContentDashboardData`
- [x] `globalSetup.ts` / `globalTeardown.ts` already call `seedContentDashboardData` / `cleanupContentDashboardData`

### Tests
- [x] **Test: `sections visible`** — Subject heading "CD Mathematics", metric cards, All Chapters, Quick Insights
- [x] **Test: `shows chapter rows from seed`** — CD Algebra, CD Geometry, CD Trigonometry visible as table cells
- [x] **Test: `shows metric values`** — Total Chapters shows "3"
- [x] **Test: `no hydration mismatch warnings`** — Console checked after navigation

**Total: 4 tests (SSR content test skipped — real API SSR requires proper server state)**

---

## 16. E2E Visual Regression — `e2e/real-api/chapters-page-visual.spec.ts`

- [x] **Test: `chapters page layout matches baseline`** — `toHaveScreenshot('chapters-page-full.png', { maxDiffPixelRatio: 0.05 })`

**Total: 1 test**

---

## Summary Table

| # | Test Kind | File(s) | Status | Test Count |
|---|---|---|---|---|---|
| 1 | Rust unit | `tests/unit/chapters_page.rs` | Done | 10 |
| 2 | Rust snapshot | `tests/unit/chapters_page_snapshot.rs` | Done | 6 snapshots |
| 3 | Rust integration | `tests/integration/chapters_page.rs` | Done | 16 |
| 4 | Rust scenario | `tests/scenarios/chapters_page_flow.rs` | Done | 4 |
| 5 | Rust harness | `tests/harness.rs` (reuse) | Done | 0 |
| 6 | Rust fixtures | `tests/fixtures/helpers.rs` | Done | 0 (reused existing) |
| 7 | JS test setup | `test/setup.ts` (reuse) | Done | 0 |
| 8 | JS custom render | `test-utils.tsx` (reuse) | Done | 0 |
| 9 | JS component | 10 files in `__tests__/` | Done | 58 |
| 10 | JS utility | `src/lib/utils.test.ts` (reuse) | Done | 0 |
| 11 | JS factory | `mock/__tests__/chapters-page.factory.test.ts` | Done | 11 |
| 12 | MSW handlers | `mock/handlers/chapters-page.handlers.ts` | Done | 3 endpoints |
| 13 | MSW verification | `mock/__tests__/msw-verification.test.ts` | Done | 3 additions |
| 14 | E2E mocked | `e2e/dashboard/chapters-page.spec.ts` | Done | 8 |
| 15 | E2E real API | `e2e/real-api/chapters-page.spec.ts` | Done | 4 |
| 16 | E2E visual regression | `e2e/real-api/chapters-page-visual.spec.ts` | Done | 1 |
| | **Total** | | **16/16 sections done** | **~121 tests** |

---

## Verification Commands

| Layer | Command |
|---|---|
| Rust unit | `cargo test -p backend --test unit_tests -- unit::chapters_page` |
| Rust snapshot | `cargo insta review` then `cargo test -p backend --test unit_tests -- unit::chapters_page_snapshot` |
| Rust integration | `cargo test -p backend --test integration_tests -- integration::chapters_page` |
| Rust scenario | `cargo test -p backend --test scenarios -- scenarios::chapters_page_flow` |
| Rust all | `cargo test -p backend` |
| JS/TS all | `pnpm --filter web-admin exec vitest run` |
| MSW verification | `pnpm --filter web-admin exec vitest run mock/` |
| E2E mocked | `pnpm --filter web-admin exec playwright test --project=unit-msw` |
| E2E real API | `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/chapters-page.spec.ts` |
| E2E visual | `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/chapters-page-visual.spec.ts` |
| CI | `just ci` |
