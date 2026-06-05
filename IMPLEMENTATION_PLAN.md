# Implementation Plan: Subjects Page — Tests

## Legend
- `[ ]` — pending
- `[x]` — done

---

## 1. Rust Unit — `tests/unit/subjects_page.rs`

- [ ] Register `mod subjects_page;` in `tests/unit/mod.rs`
- [ ] Create `tests/unit/subjects_page.rs` with these tests:

### `derive_status` boundary tests
- [x] **Test: `derive_status_healthy`** — recall=0.8, accuracy=0.75 → `"Healthy"`
- [x] **Test: `derive_status_needs_attention`** — recall=0.6, accuracy=0.65 → `"Needs Attention"`
- [x] **Test: `derive_status_critical`** — recall=0.4, accuracy=0.9 → `"Critical"`
- [x] **Test: `derive_status_boundary_needs_attention`** — recall=0.5, accuracy=0.5 → `"Needs Attention"`
- [x] **Test: `derive_status_boundary_healthy`** — recall=0.7, accuracy=0.7 → `"Healthy"`
- [x] **Test: `derive_status_uses_recall_when_accuracy_none`** — recall=0.55, accuracy=None → `"Needs Attention"`
- [x] **Test: `derive_status_uses_accuracy_when_recall_none`** — recall=None, accuracy=0.3 → `"Critical"`
- [x] **Test: `derive_status_healthy_when_both_none`** — both None → `"Healthy"`

### Verification
- [x] ✅ `cargo test -p backend --test unit_tests -- unit::subjects_page` — 8 passed

---

## 2. Rust Snapshot — `tests/unit/subjects_page_snapshot.rs`

- [ ] Register `mod subjects_page_snapshot;` in `tests/unit/mod.rs`
- [ ] Create `tests/unit/subjects_page_snapshot.rs` with these snapshots:

### Response shape snapshots
- [x] **Snapshot: `"subjects-page-items"`** — `Vec<SubjectPageItem>` with 2 items, mixed recall/accuracy/status
- [x] **Snapshot: `"subjects-page-summary"`** — `SubjectSummary` with all 4 descriptions
- [x] **Snapshot: `"subjects-page-signals"`** — `Vec<SubjectSignal>` with both positive and negative types

### Verification
- [x] ✅ `cargo test -p backend --test unit_tests -- unit::subjects_page_snapshot` — 3 passed
- [x] `cargo insta accept` — 3 snapshots accepted

---

## 3. Rust Integration — `tests/integration/subjects_page.rs`

- [ ] Register `mod subjects_page;` in `tests/integration/mod.rs`
- [ ] Add shared `get_json` helper (reuse pattern from content_dashboard integration)
- [ ] Add shared `seed_topic_accuracy` helper (or reuse from content_dashboard)
- [ ] Create `tests/integration/subjects_page.rs` with these tests:

### Subjects endpoint — `/api/v1/content/subjects-page`
- [x] **Test: `subjects_page_returns_items`** — 2 subjects with chapters, topics, quizzes, recall → 2 items, all fields present
- [x] **Test: `subjects_page_empty_database`** — no data → `[]`
- [x] **Test: `subjects_page_zero_coverage`** — subject + chapter, no topics → `coverage=0`
- [x] **Test: `subjects_page_partial_coverage`** — 10 topics, 6 with quizzes → `coverage=60`
- [x] **Test: `subjects_page_recall_and_accuracy`** — seed recall answers + assessment attempts → both fields populated

### Summary endpoint — `/api/v1/content/subjects-page/summary`
- [x] **Test: `summary_returns_counts`** — 2 subjects, mixed publish state → counts match seed
- [x] **Test: `summary_empty`** — no data → all zeros
- [x] **Test: `summary_topics_needing_attention`** — 1 topic recall < 60%, 1 > 60% → count=1

### Signals endpoint — `/api/v1/content/subjects-page/signals`
- [x] **Test: `signals_returns_signals`** — varied recall/accuracy/coverage per subject → mix of positive + negative
- [x] **Test: `signals_empty_no_chapters`** — subject with no chapters → `[]`
- [x] **Test: `signals_deduplicates`** — same message generated 2× → only 1 in response
- [x] **Test: `signals_truncates_to_four`** — 6 signals generated → only 4 returned

### Verification
- [x] ✅ `cargo test -p backend --test integration_tests -- integration::subjects_page` — 12 passed

---

## 4. Rust Scenario — `tests/scenarios/subjects_page_flow.rs`

- [ ] Register `mod subjects_page_flow;` in `tests/scenarios/mod.rs`
- [ ] Create `tests/scenarios/subjects_page_flow.rs` with these tests:

### Workflow scenarios using ScenarioBuilder
- [x] **Test: `scenario_admin_views_subjects_page`** — admin + student + content → GET all 3 endpoints → 200 + correct values
- [x] **Test: `scenario_subjects_page_no_content`** — admin only, no content → empty subjects, zero summary, empty signals
- [x] **Test: `scenario_signals_update_after_recall_change`** — seed with high recall (no signal) → add low-recall answers → signal appears

### Verification
- [x] ✅ `cargo test -p backend --test mod -- scenarios::subjects_page_flow` — 3 passed

---

## 5. Rust Fixtures — `tests/fixtures/helpers.rs`

- [x] **Add `create_test_assessment_attempt` helper** — insert into `assessment_attempt` with `quiz_id`, `user_id`, `score`, defaults for `created_at`/`passed`
- [x] ✅ `cargo check -p backend --tests`

---

## 6. JS Component Tests — 7 files

### 6a. `subjects-page.test.tsx` — add 5 tests
- [ ] **Test: `renders empty table state when subjects=[]`** — table empty state text visible
- [ ] **Test: `renders empty signals state when signals=[]`** — signals empty state visible
- [ ] **Test: `calls onViewChapters callback with subject id`** — click → callback fires with correct ID
- [ ] **Test: `retry button refetches per-section error`** — mock 1 section error → retry → refetch called for that section only
- [ ] **Test: `refresh button calls refetch on all 3 queries`** — click refresh icon → all 3 `refetch()` called

### 6b. New `subjects-table.test.tsx` — 7 tests
- [ ] **Test: `renders all 8 column headers`** — Subject Name, Chapters, Topics Published, Coverage, Avg Recall, Practice Accuracy, Status, Action
- [ ] **Test: `renders subject rows with values`** — name, count, coverage, accuracy, status visible
- [ ] **Test: `renders empty state when no subjects`** — `subjects=[]` → "No subjects found"
- [ ] **Test: `calls onViewChapters with subject id on click`** — click → callback fires
- [ ] **Test: `formats coverage with %`** — value + `%` suffix
- [ ] **Test: `formats accuracy as percentage`** — 0.74 → `74%`
- [ ] **Test: `shows em dash for null accuracy`** — `practice_accuracy=null` → `—`

### 6c. New `subject-summary-row.test.tsx` — 4 tests
- [ ] **Test: `renders all 4 metric cards with labels`** — each label visible
- [ ] **Test: `renders correct values`** — each value matches input
- [ ] **Test: `description has title tooltip`** — `title` attribute on description
- [ ] **Test: `handles missing descriptions gracefully`** — empty array → `''` fallback

### 6d. New `subject-signals.test.tsx` — 4 tests
- [ ] **Test: `renders section heading`** — "Subject Signals"
- [ ] **Test: `renders signal cards with messages`** — messages visible
- [ ] **Test: `renders empty state`** — `signals=[]` → empty state
- [ ] **Test: `shows positive/negative styling`** — check background/border classes

### 6e. New `recall-badge.test.tsx` — 4 tests
- [ ] **Test: `renders Strong for 0.8+`** — 0.9 → "Strong"
- [ ] **Test: `renders Medium for ≥0.5 and <0.8`** — 0.65 → "Medium"
- [ ] **Test: `renders Weak for <0.5`** — 0.3 → "Weak"
- [ ] **Test: `renders em dash for null`** — null → `—`

### 6f. New `status-badge.test.tsx` — 4 tests
- [ ] **Test: `renders Healthy with green indicator`** — "Healthy"
- [ ] **Test: `renders Needs Attention with amber indicator`** — "Needs Attention"
- [ ] **Test: `renders Critical with red indicator`** — "Critical"
- [ ] **Test: `renders unknown status as default`** — unexpected string → renders as-is

### 6g. New `loading-skeleton.test.tsx` — 3 tests
- [ ] **Test: `renders summary variant`** — specific skeleton structure
- [ ] **Test: `renders table variant`** — specific skeleton structure
- [ ] **Test: `renders signals variant`** — specific skeleton structure

### Verification
- [x] ✅ `pnpm --filter web-admin exec vitest run` — 309 tests passed
- [x] ✅ `pnpm --filter web-admin exec vitest run mock/` — 33 tests passed

---

## 10. E2E Mocked (Playwright) — `e2e/dashboard/subjects-page.spec.ts`

- [ ] Create `apps/web-admin/e2e/dashboard/subjects-page.spec.ts` with these tests:

### Setup
- [ ] Add `setupAuth(page)` — cookie + `/auth/me` mock
- [ ] Add `setupSubjectsPageMocks(page)` — mock 3 subjects-page endpoints

### Horizontal scroll tests (main screens)
- [ ] **Test: `no horizontal scroll at 1440px desktop`** — scrollWidth ≤ viewportWidth + 5
- [ ] **Test: `no horizontal scroll at 1280px desktop`** — scrollWidth ≤ viewportWidth + 5
- [ ] **Test: `no horizontal scroll at 1024px tablet`** — scrollWidth ≤ viewportWidth + 5
- [ ] **Test: `no horizontal scroll at 375px mobile`** — scrollWidth ≤ viewportWidth + 5

### Content tests
- [ ] **Test: `renders all three sections`** — summary cards, table, signals visible
- [ ] **Test: `renders summary metric cards`** — Total Subjects, Total Topics, etc.
- [ ] **Test: `renders subjects table rows`** — subject names in table
- [ ] **Test: `renders signal cards`** — signal messages visible

### Interaction tests
- [ ] **Test: `clicking View Chapters navigates`** — click → URL changes

### Verification
- [ ] ✅ `pnpm --filter web-admin exec playwright test --project=unit-mws e2e/dashboard/subjects-page.spec.ts`

---

## 11. E2E Real API (Playwright) — `e2e/real-api/subjects-page.spec.ts`

- [ ] Create `apps/web-admin/e2e/real-api/subjects-page.spec.ts` with these tests:

### Setup
- [ ] Add `loginAsSubjectsPageAdmin` helper to `e2e/real-api/login.ts`
- [ ] Add subjects page data seed to `globalSetup.ts`
- [ ] Add cleanup to `globalTeardown.ts`

### Tests
- [ ] **Test: `subjects page sections are visible`** — summary, table, signals visible
- [ ] **Test: `shows metric values from seeded data`** — specific subject count matches seed
- [ ] **Test: `no hydration mismatch warnings`** — console warning check
- [ ] **Test: `SSR content present in HTML`** — `page.content()` contains subjects data

### Verification
- [ ] ✅ `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/subjects-page.spec.ts`

---

## 12. E2E Visual Regression — `e2e/real-api/subjects-page-visual.spec.ts`

- [ ] Create `apps/web-admin/e2e/real-api/subjects-page-visual.spec.ts` (1 test)
- [ ] **Test: `subjects page layout matches baseline`** — `toHaveScreenshot('subjects-page.png', { maxDiffPixelRatio: 0.05 })`
- [ ] ✅ `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/subjects-page-visual.spec.ts`

---

## 13. Dashboard E2E — add horizontal scroll assertion

- [ ] Add scroll check to `e2e/dashboard/dashboard-page-sections.spec.ts` → `renders all 4 dashboard sections`:

  ```typescript
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const viewportWidth = await page.evaluate(() => window.innerWidth)
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5)
  ```

- [ ] Add scroll check to `e2e/dashboard/content-dashboard.spec.ts` → existing tests at desktop viewport

### Verification
- [ ] ✅ `pnpm --filter web-admin exec playwright test --project=unit-msw e2e/dashboard/dashboard-page-sections.spec.ts`
- [ ] ✅ `pnpm --filter web-admin exec playwright test --project=unit-msw e2e/dashboard/content-dashboard.spec.ts`

---

## 14. Final Verification

- [ ] **Rust:** `cargo test -p backend`
- [ ] **JS/TS:** `pnpm --filter web-admin exec vitest run`
- [ ] **E2E mocked:** `pnpm --filter web-admin exec playwright test --project=unit-msw`
- [ ] **E2E real API:** `pnpm --filter web-admin exec playwright test --project=real-api`
- [ ] **Lint:** `pnpm biome check .`
- [ ] **Format:** `cargo fmt --all`
- [ ] **Clippy:** `cargo clippy -- -D warnings`

---

## Summary

| # | Type | File | Tests |
|---|---|---|---|
| 1 | Rust unit | `tests/unit/subjects_page.rs` | 8 |
| 2 | Rust snapshot | `tests/unit/subjects_page_snapshot.rs` | 3 snapshots |
| 3 | Rust integration | `tests/integration/subjects_page.rs` | 12 |
| 4 | Rust scenario | `tests/scenarios/subjects_page_flow.rs` | 3 |
| 5 | Rust fixtures | `tests/fixtures/helpers.rs` | 1 helper |
| 6 | Component tests | 7 files in `components/` | 31 |
| 7 | Factory tests | `mock/__tests__/subjects-page.factory.test.ts` | 8 |
| 8 | MSW verification | `msw-verification.test.ts` | 3 additions |
| 9 | MSW handlers | `mock/handlers/` | ✅ complete |
| 10 | E2E mocked | `e2e/dashboard/subjects-page.spec.ts` | 9 |
| 11 | E2E real API | `e2e/real-api/subjects-page.spec.ts` | 4 |
| 12 | E2E visual | `e2e/real-api/subjects-page-visual.spec.ts` | 1 |
| 13 | Dashboard scroll | `e2e/dashboard/*.spec.ts` | 2 additions |
| | **Total** | | **~84 tests** |
