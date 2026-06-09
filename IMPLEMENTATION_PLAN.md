# Implementation Plan: Topics Page — Full Test Coverage

## Legend
- `[ ]` — pending
- `[x]` — done
- `[ ] ~~strikethrough~~` — skipped (with reason)

---

## 1. Rust Unit — `tests/unit/topics_page.rs`

Pure function tests, no DB.

### `derive_topic_status` boundary tests (thresholds: <0.5 critical, <0.7 needs_attention, >=0.7 healthy)
- [x] **healthy: both >= 0.7** — recall=0.85, accuracy=0.90 → `"healthy"`
- [x] **needs_attention: mid recall** — recall=0.65, accuracy=0.90 → `"needs_attention"`
- [x] **needs_attention: mid accuracy** — recall=0.85, accuracy=0.65 → `"needs_attention"`
- [x] **needs_attention: min bound** — recall=0.50, accuracy=0.50 → `"needs_attention"`
- [x] **needs_attention: max bound** — recall=0.69, accuracy=0.69 → `"needs_attention"`
- [x] **critical: low recall** — recall=0.30, accuracy=0.90 → `"critical"`
- [x] **critical: low accuracy** — recall=0.85, accuracy=0.20 → `"critical"`
- [x] **critical: max bound** — recall=0.49, accuracy=0.49 → `"critical"`
- [x] **healthy: min bound** — recall=0.70, accuracy=0.70 → `"healthy"`
- [x] **healthy: no recall metric** — None, accuracy=0.90 → `"healthy"` (unwrap_or 1.0)
- [x] **healthy: no accuracy metric** — recall=0.85, None → `"healthy"`
- [x] **healthy: neither metric** — None, None → `"healthy"`

### `derive_content_status` tests
- [x] **published: both video + quiz** → `"published"`
- [x] **draft: quiz only** → `"draft"`
- [x] **review_pending: video only** → `"review_pending"`
- [x] **archived: neither** → `"archived"`

### `categorize_topic_insights` tests
- [x] **weak recall warning** — 2/3 topics with recall < 0.5 → warning insight present
- [x] **low accuracy negative** — topic with accuracy < 0.5 → negative insight present
- [x] **no video warning** — topic without video → video-missing insight present
- [x] **no quiz info** — topic without quiz → quiz-missing insight present
- [x] **all equipped positive** — all topics have video + quiz → positive insight present
- [x] **empty returns info** — no topics → "No topic data available" info insight
- [x] **deduplicates** — same-title insights collapsed to 1
- [x] **max six** — many issues → at most 6 insights

**Total: 23 tests — [x] All done**

---

## 2. Rust Snapshot — `tests/unit/topics_page_snapshot.rs`

Response shape snapshots via `insta`.

- [x] **Snapshot: `"topic-summary-response"`** — `TopicSummaryResponse` with all 4 metrics populated
- [x] **Snapshot: `"topic-summary-empty"`** — `TopicSummaryResponse` with all zeros
- [x] **Snapshot: `"topic-item-response"`** — `TopicItemResponse` with full fields (published, video=true, recall=strong, accuracy=90, healthy)
- [x] **Snapshot: `"topic-item-draft"`** — `TopicItemResponse` with draft content, no video, weak recall, low accuracy, critical status
- [x] **Snapshot: `"topic-insight-positive"`** — InsightItemResponse with type=positive
- [x] **Snapshot: `"topic-insight-warning"`** — InsightItemResponse with type=warning
- [x] **Snapshot: `"topic-insight-negative"`** — InsightItemResponse with type=negative
- [x] **Snapshot: `"topic-insight-info"`** — InsightItemResponse with type=info

**Total: 8 snapshots — [x] Done**

---

## 3. Rust Integration — `tests/integration/topics_page.rs`

Full HTTP roundtrip via `TestApp` + testcontainers Postgres.

### Summary endpoint — `GET .../chapters/{id}/topics-page/summary`
- [x] **summary_returns_chapter_name_and_metrics** — Chapter with 2 topics (1 with quiz, 1 with video+quiz, weak recall) → name matches, counts correct
- [x] **summary_returns_404_for_unknown_chapter** — Random UUID → 404
- [x] **summary_with_no_topics** — Chapter with 0 topics → total=0, all metrics=0

### Topics endpoint — `GET .../chapters/{id}/topics-page/topics`
- [x] **topics_returns_all_without_params** — 2 topics → 2 items
- [x] **topics_search_filters_by_name** — `?search=Gauss` returns only matching
- [x] **topics_search_case_insensitive** — `?search=coulomb` matches "Coulomb's Law"
- [x] **topics_content_status_filter** — `?content_status_filter=published` returns only published (has video+quiz)
- [x] **topics_video_filter** — `?video_filter=true` returns only topics with video
- [x] **topics_recall_filter** — `?recall_filter=weak` returns only weak recall topics
- [x] **topics_sort_by_accuracy_asc** — `?sort_by=accuracy&sort_order=asc` lowest first
- [x] **topics_sort_by_recall_desc** — `?sort_by=recall&sort_order=desc` highest first
- [x] **topics_pagination** — `?page=1&limit=2` returns 2 items
- [x] **topics_empty_for_unknown_chapter** — Unknown chapter → `[]`
- [x] **topics_search_and_sort_together** — Search + sort combined

### Insights endpoint — `GET .../chapters/{id}/topics-page/insights`
- [x] **insights_returns_signal_data** — Topics with weak recall → warning signal present
- [x] **insights_positive_when_all_healthy** — All topics equipped + good recall → positive signal
- [x] **insights_info_when_no_topics** — No topics → info signal ("No topic data available")
- [x] **insights_no_more_than_six** — Many varied topics → at most 6 insights

**Total: 18 tests — [x] All done**

---

## 4. Rust Scenario — `tests/scenarios/topics_page_flow.rs`

Multi-step user journeys via `ScenarioBuilder`.

- [x] **topics_page_flow_full_view** — Admin + student + 3 topics (healthy, needs-attention, draft) → GET all 3 endpoints → correct shapes, search + sort filters work
- [x] **topics_page_flow_no_content** — Admin + empty chapter → zero summary, empty topics, insights present

**Total: 2 tests — [x] All done**

---

## 5. Rust Harness — reuse existing `TestApp`

- [x] Reuse `TestApp` methods (`get`, `get_json` helpers) — no new harness code

**Total: 0 new — [x]**

---

## 6. Rust Fixtures — `tests/fixtures/helpers.rs`

- [x] Reused existing helpers (`create_test_user`, `create_test_subject/chapter/topic`, `create_test_quiz`, `create_test_recall_answer_variant`, `create_test_assessment_attempt`)
- [ ] ~~Add `create_test_video` helper to global helpers~~ — defined locally in integration test file

**Total: 0 new helpers (video helper local to integration test) — [x]**

---

## 7. JS Test Setup — `test/setup.ts` + `vitest.config.ts`

- [x] Reuse existing setup — MSW server, ResizeObserver mock, QueryClientProvider all configured

**Total: 0 new — [x]**

---

## 8. JS Custom Render — `test-utils.tsx`

- [x] Reuse existing `render()` wrapper — all component tests use it

**Total: 0 new — [x]**

---

## 9. JS Component Tests — 10 files

**All 56 tests passing — [x] Done**

| File | Tests |
|---|---|
| `topics-page.test.tsx` | 7 |
| `topics-table.test.tsx` | 20 |
| `topic-summary-card.test.tsx` | 3 |
| `loading-skeleton.test.tsx` | 3 |
| `empty-state.test.tsx` | 2 |
| `insight-card.test.tsx` | 6 |
| `pattern-insights-section.test.tsx` | 2 |
| `content-status-badge.test.tsx` | 5 |
| `recall-badge.test.tsx` | 4 |
| `status-badge.test.tsx` | 4 |
| **Total** | **56** |

---

## 10. JS Utility Tests — `src/lib/utils.test.ts`

- [x] No new utility functions introduced — reuse existing tests

**Total: 0 new — [x]**

---

## 11. JS Factory Tests — `mock/__tests__/topics-page.factory.test.ts`

- [x] **buildTopicSummary creates default** — All 4 fields populated with defaults
- [x] **buildTopicSummary overrides** — Custom chapter name reflected
- [x] **buildTopicItem creates default** — All fields, ID=topic-1, recall=medium, accuracy=65, status=needs_attention
- [x] **buildTopicItem overrides** — Custom name/content_status reflected
- [x] **buildTopicItem unique IDs per call** — Each call generates different ID
- [x] **buildTopicItemList creates N items** — Correct count
- [x] **buildTopicItemList unique IDs** — All IDs unique
- [x] **buildTopicItemList with overrides** — Override applied to all items
- [x] **buildInsightItem default** — All fields, type=info
- [x] **buildInsightItem overrides** — Custom type reflected
- [x] **buildInsightItemList creates N insights** — Correct count
- [x] **buildInsightItemList cycling types** — Types cycle positive/warning/negative/info

**Total: 12 tests — [x] All done**

---

## 12. MSW Handlers — `mock/handlers/topics-page.handlers.ts`

- [x] **Summary handler** — `GET */api/v1/chapters/:chapterId/topics-page/summary` → `buildTopicSummary()`
- [x] **Topics handler** — `GET */api/v1/chapters/:chapterId/topics-page/topics` → parses query params, filters mock data in-memory (search, content_status, recall, video, sort_by, sort_order, page, limit)
- [x] **Insights handler** — `GET */api/v1/chapters/:chapterId/topics-page/insights` → `buildInsightItemList(3)`
- [x] **Registered** in `mock/handlers/index.ts`

**Total: 1 handler file, 3 endpoints — [x] All done**

---

## 13. MSW Verification — `mock/__tests__/msw-verification.test.ts`

- [x] **topics-page summary intercepted** — Returns 200 with `chapter_name`, `total_topics`, `published_topics`
- [x] **topics-page topics intercepted** — Returns array with `id`, `name`, `content_status`, `video_available`, `status`
- [x] **topics-page insights intercepted** — Returns array with `id`, `type`, `title`, `description`

**Total: 3 additions — [x] All done**

---

## 14. E2E Mocked (Playwright) — `e2e/dashboard/topics-page.spec.ts`

### Setup
- [x] Auth: cookie + `auth/me` mock via `setupAuth(page)` (reuse pattern from chapters-page)
- [x] MSW: 3 topics-page endpoint mocks via `setupTopicsPageMocks(page)` → `page.route()` for summary, topics, insights

### Tests
- [x] **renders chapter name heading** — "Electrostatics" heading visible
- [x] **renders summary metric cards** — Total Topics, Published, Draft, Weak Recall values visible
- [x] **renders topics table with rows** — Topic names visible in table
- [x] **renders insights section** — Insight cards visible
- [x] **search filters topic list** — Type in search → topics filtered
- [x] **no horizontal scroll at 1440px desktop**
- [x] **renders back to chapters button**

**Total: 7 tests — [x] Done**

---

## 15. E2E Real API (Playwright) — `e2e/real-api/topics-page.spec.ts`

### Setup
- [x] Reuse `seedContentDashboardData` (chapter `30000000-0000-0000-0000-000000000030` "CD Algebra" has 3 topics)
- [x] Reuse `loginAsCDAdmin` auth helper

### Tests
- [x] **sections visible** — Chapter heading "CD Algebra", metric cards, topics table, quick pattern insights
- [x] **shows topic rows from seed** — "CD Quadratic Equations", "CD Linear Algebra" visible as table cells
- [x] **shows metric values** — Total Topics = 3 visible
- [x] **no hydration mismatch warnings** — Console checked after navigation

**Total: 4 tests — [x] Done**

---

## 16. E2E Visual Regression — `e2e/real-api/topics-page-visual.spec.ts`

- [x] **topics page layout matches baseline** — `toHaveScreenshot('topics-page-full.png', { maxDiffPixelRatio: 0.05 })`

**Total: 1 test — [x] Done**

---

## Summary Table

| # | Test Kind | File(s) | Status | Test Count |
|---|---|---|---|---|
| 1 | Rust unit | `tests/unit/topics_page.rs` | Done | 23 |
| 2 | Rust snapshot | `tests/unit/topics_page_snapshot.rs` | Done | 8 |
| 3 | Rust integration | `tests/integration/topics_page.rs` | Done | 18 |
| 4 | Rust scenario | `tests/scenarios/topics_page_flow.rs` | Done | 2 |
| 5 | Rust harness | `tests/harness.rs` (reuse) | Done | 0 |
| 6 | Rust fixtures | `tests/fixtures/helpers.rs` | Done | 0 |
| 7 | JS test setup | `test/setup.ts` (reuse) | Done | 0 |
| 8 | JS custom render | `test-utils.tsx` (reuse) | Done | 0 |
| 9 | JS component | 10 files in `__tests__/` | Done | 56 |
| 10 | JS utility | `src/lib/utils.test.ts` (reuse) | Done | 0 |
| 11 | JS factory | `mock/__tests__/topics-page.factory.test.ts` | Done | 12 |
| 12 | MSW handlers | `mock/handlers/topics-page.handlers.ts` | Done | 3 endpoints |
| 13 | MSW verification | `mock/__tests__/msw-verification.test.ts` | Done | 3 additions |
| 14 | E2E mocked | `e2e/dashboard/topics-page.spec.ts` | Done | 7 |
| 15 | E2E real API | `e2e/real-api/topics-page.spec.ts` | Done | 4 |
| 16 | E2E visual regression | `e2e/real-api/topics-page-visual.spec.ts` | Done | 1 |
| | **Total** | | **16 done / 0 pending** | **~134 tests** |

---

## Verification Commands

| Layer | Command |
|---|---|
| Rust unit | `cargo test -p backend --test unit_tests -- unit::topics_page` |
| Rust snapshot | `cargo insta review` then `cargo test -p backend --test unit_tests -- unit::topics_page_snapshot` |
| Rust integration | `cargo test -p backend --test integration_tests -- integration::topics_page` |
| Rust scenario | `cargo test -p backend --test mod -- scenarios::topics_page_flow` |
| Rust all | `cargo test -p backend` |
| JS/TS all | `pnpm --filter web-admin exec vitest run` |
| JS component | `pnpm --filter web-admin exec vitest run src/features/topics-page/` |
| MSW verification | `pnpm --filter web-admin exec vitest run mock/__tests__/msw-verification.test.ts` |
| E2E mocked | `pnpm --filter web-admin exec playwright test --project=unit-msw e2e/dashboard/topics-page.spec.ts` |
| E2E real API | `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/topics-page.spec.ts` |
| E2E visual | `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/topics-page-visual.spec.ts` |
| CI | `just ci` |
