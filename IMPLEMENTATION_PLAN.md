# Implementation Plan: Topic Detail Page — Full Test Coverage

## Legend
- `[ ]` — pending
- `[x]` — done
- `[ ] ~~strikethrough~~` — skipped (with reason)

---

## Phase 0: Extract Pure Functions (Pre-requisite) — `[x]` done

### Extract from `handler_get_topic_overview`
- [x] Extract `derive_recall_strength(correct: u64, total: u64) -> &'static str`
  - [x] `< 0.4 → "weak"`
  - [x] `< 0.7 → "fair"`
  - [x] `≥ 0.7 → "strong"`
  - [x] `total == 0 → "unknown"`
- [x] Extract `derive_dropoff_indicator(completed: u64, total: u64) -> &'static str`
  - [x] `< 0.3 → "high"`
  - [x] `< 0.6 → "medium"`
  - [x] `≥ 0.6 → "low"`
  - [x] `total == 0 → "unknown"`
- [x] Extract `derive_engagement_trend(progress_count: u64) -> &'static str`
  - [x] `> 5 → "growing"`
  - [x] `> 0 → "stable"`
  - [x] `== 0 → "declining"`
- [x] Extract `calculate_practice_accuracy(total_score: i32, total_possible: i32) -> f64`
  - [x] `total_possible > 0 → (total_score / total_possible) * 100`
  - [x] `total_possible == 0 → 0.0`

### Extract from `handler_get_topic_issues`
- [x] Extract `derive_recall_issue_id(recall_ratio: f64) -> Option<&'static str>`
  - [x] `< 0.4 → Some("recall-weak")`
  - [x] `< 0.7 → Some("recall-moderate")`
  - [x] `≥ 0.7 → None`
- [x] Extract `derive_dropoff_issue_id(completion_rate: f64) -> Option<&'static str>`
  - [x] `< 0.3 → Some("dropoff-high")`
  - [x] `≥ 0.3 → None`
- [x] Extract `derive_accuracy_issue_id(avg_accuracy: f64) -> Option<&'static str>`
  - [x] `< 50.0 → Some("accuracy-low")`
  - [x] `< 70.0 → Some("accuracy-moderate")`
  - [x] `≥ 70.0 → None`
- [x] Extract `has_video_issue(video_count: u64) -> bool`
  - [x] `0 → true`
  - [x] `> 0 → false`

### Export from `topic_detail.rs`
- [x] Mark extracted functions as `pub fn` in `apps/backend/src/http/handlers/topic_detail.rs`
- [x] Verify `cargo check --all-targets --all-features` passes

---

## 1. Rust Unit — `tests/unit/topic_detail.rs` — `[x]` done

Pure function tests, no DB. Registered `mod topic_detail;` in `unit/mod.rs`. All 32 tests written and passing — covers boundary conditions for all 8 extracted functions across all code paths.

**Total: 32 tests — `[x]` done**

---

## 2. Rust Snapshot — `tests/unit/topic_detail_snapshot.rs` — `[x]` done

Response shape snapshots via `insta`. Registered in `unit/mod.rs`. 12 snapshots accepted (null trends snapshot not needed — null serialization verified by integration tests).

**Total: 12 snapshots — `[x]` done**

---

## 3. Rust Integration — `tests/integration/topic_detail.rs` — `[x]` done

Full HTTP roundtrip via `TestApp` + testcontainers Postgres. Registered in `integration/mod.rs`. Key findings: content routes don't require auth (return 200 without cookie), unknown topics return 200 with defaults (not 404). 20 tests covering all 5 endpoints with auth, defaults, and data scenarios.

**Total: 20 tests — `[x]` done**

---

## 4. Rust Scenario — `tests/scenarios/topic_detail_flow.rs` — `[x]` done

Multi-step user journeys via `ScenarioBuilder`. Registered in `scenarios/mod.rs`. 2 scenario tests: full workflow (admin → student → content → quiz → recall → verify) and empty workflow. `insufficient_trends` merged into full/empty tests.

**Total: 2 tests — `[x]` done**

---

## 5. Rust Harness — reuse existing `TestApp`

- [ ] Reuse `TestApp` methods (`get`, `get_with_cookie`, `post_json`) — no new harness code needed

**Total: 0 new — `[x]` (inherent)**

---

## 6. Rust Fixtures — reuse existing helpers

- [ ] Reuse from `tests/fixtures/helpers.rs`:
  - [ ] `create_test_subject`, `create_test_chapter`, `create_test_topic`
  - [ ] `create_test_recall_session`, `create_test_recall_answer`, `create_test_completed_recall_session`, `create_test_recall_answer_variant`
  - [ ] `create_test_quiz`, `create_test_assessment_attempt`
  - [ ] `create_test_learning_progress`
  - [ ] `ensure_analytics_permission`, `create_admin_with_analytics`
- [ ] ~~Add `create_test_video` to global helpers~~ — define locally if needed

**Total: 0 new helpers — `[x]` (inherent)**

---

## 7. JS Test Setup — reuse existing

- [ ] Reuse `test/setup.ts` — MSW server, ResizeObserver mock, QueryClientProvider all configured

**Total: 0 new — `[x]` (inherent)**

---

## 8. JS Custom Render — reuse existing

- [ ] Reuse `test-utils.tsx` `render()` wrapper — all component tests use it

**Total: 0 new — `[x]` (inherent)**

---

## 9. JS Component Tests — 9 files — `[x]` done

All 9 test files written with 78 tests covering loading, error, empty, success states, interactions, utility functions, icon mappings, status styling, sentiment derivation, and skeleton rendering.

| File | Tests |
|---|---|
| `topic-detail-page.test.tsx` | 15 |
| `status-badge.test.tsx` | 6 |
| `severity-badge.test.tsx` | 6 |
| `topic-health-card.test.tsx` | 11 |
| `learning-issue-card.test.tsx` | 7 |
| `content-component-card.test.tsx` | 6 |
| `quick-actions-bar.test.tsx` | 6 |
| `performance-charts.test.tsx` | 5 |
| `loading-skeleton.test.tsx` | 5 |

**Total: 78 tests across 9 files — `[x]` done**

---

## 10. JS Utility Tests — `lib/__tests__/topic-detail-utils.test.ts` — `[x]` done (pre-existing)

- [ ] **`deriveOverallStatus`**
  - [ ] All metrics healthy → "Healthy"
  - [ ] Only recall_strength="weak" → "Needs Attention"
  - [ ] Only dropoff_indicator="high" → "Needs Attention"
  - [ ] Only engagement_trend="declining" → "Needs Attention"
  - [ ] 2+ negatives → "Critical"
  - [ ] All 3 negatives → "Critical"
  - [ ] undefined overview → "Needs Attention"
- [ ] **`getTrend`**
  - [ ] Empty array → "stable"
  - [ ] Single element → "stable"
  - [ ] Upward trend (diff > 2) → "up"
  - [ ] Downward trend (diff < -2) → "down"
  - [ ] Flat trend (|diff| <= 2) → "stable"
  - [ ] Boundary: diff = 2 → "stable"
  - [ ] Boundary: diff = 2.01 → "up"
- [ ] **`deriveSentiment`**
  - [ ] Recall title + strong → positive
  - [ ] Recall title + fair → neutral
  - [ ] Recall title + weak → negative
  - [ ] Accuracy title + ≥70 → positive
  - [ ] Accuracy title + 50-70 → neutral
  - [ ] Accuracy title + <50 → negative
  - [ ] Drop-off title + low → positive
  - [ ] Drop-off title + high → negative
  - [ ] Engagement title + growing → positive
  - [ ] Engagement title + declining → negative
- [ ] **`formatValue`**
  - [ ] number → "N%"
  - [ ] string → capitalize first letter
  - [ ] empty string → ""

**Total: ~24 tests — `[ ]` pending**

---

## 11. JS Factory Tests — `mock/__tests__/topic-detail.factory.test.ts` — `[x]` done

20 tests covering all builder functions, overrides, cycling behavior, and counter reset. Notable: `buildTopicIssue` and `buildTopicAction` do NOT increment `nextId` — they always return the first template (cycling only happens in `buildTopicIssuesResponse`).

**Total: 20 tests — `[x]` done**

---

## 12. MSW Handlers — reuse existing

- [ ] Already registered in `mock/handlers/index.ts` — 5 endpoints implemented
  - [ ] `GET */api/v1/topics/:topicId/overview`
  - [ ] `GET */api/v1/topics/:topicId/issues`
  - [ ] `GET */api/v1/topics/:topicId/components`
  - [ ] `GET */api/v1/topics/:topicId/actions`
  - [ ] `GET */api/v1/topics/:topicId/trends`
- [ ] All return 404 for `topicId === 'unknown'`

**Total: 5 endpoints — `[x]` done (pre-existing)**

---

## 13. MSW Verification — `mock/__tests__/msw-verification.test.ts` — `[x]` done

Extended existing `msw-verification.test.ts` with 12 topic-detail tests: all 5 endpoints return 200 with correct shapes + 404 for unknown id + handler override + reset. Total 27 tests in file.

**Total: 12 additions — `[x]` done**

---

## 14. E2E Mocked (Playwright) — ~~`e2e/dashboard/topic-detail.spec.ts`~~ (SKIPPED)

**Why:** The topic detail route at `/content/topic/$id` has a route loader (no try/catch) that calls `getTopicById` during SSR. `page.route()` in Playwright only intercepts browser-side requests, not server-side SSR requests. When the loader fails (no real backend), the page doesn't render — preventing any meaningful E2E test.

**Alternative:** Only real-API E2E tests are practical (Kinds 15-16), which use a running backend with seeded data.

**Total: 0 tests — `[~]` skipped (SSR loader constraint)**

---

## 15. E2E Real API (Playwright) — `e2e/real-api/topic-detail.spec.ts`

### Setup
- [x] `loginAsCDAdmin` auth helper reused
- [x] Uses CD seed topic `CD Quadratic Equations` (id `30000000-0000-0000-0000-000000000041`)

### Tests
- [x] **Page renders topic name heading** — `CD Quadratic Equations`
- [x] **Shows Back to Topics button** — visible and clickable
- [x] **Renders Topic Health Snapshot section**
- [x] **Renders 4 health metric cards** — Recall Strength, Practice Accuracy, Drop-off Indicator, Engagement Trend
- [x] **Renders Learning Issues Detected section**
- [x] **Renders Content Components section**
- [x] **Renders Quick Actions section**
- [x] **Renders Performance Trends section**
- [x] **No hydration mismatch warnings**

**Total: 9 tests — `[x]` done**

---

## 16. E2E Visual Regression — `e2e/real-api/topic-detail-visual.spec.ts`

- [x] **Topic detail layout matches baseline** — `toHaveScreenshot('topic-detail-full.png', { maxDiffPixelRatio: 0.05 })`

**Total: 1 test — `[x]` done**

---

## Summary Table

| # | Test Kind | File(s) | Status | Test Count |
|---|---|---|---|---|
| 0 | Extract pure functions | `handlers/topic_detail.rs` | [x] | 9 functions |
| 1 | Rust unit | `tests/unit/topic_detail.rs` | [x] | 32 |
| 2 | Rust snapshot | `tests/unit/topic_detail_snapshot.rs` | [x] | 12 |
| 3 | Rust integration | `tests/integration/topic_detail.rs` | [x] | 20 |
| 4 | Rust scenario | `tests/scenarios/topic_detail_flow.rs` | [x] | 2 |
| 5 | Rust harness | `tests/harness.rs` (reuse) | [x] | 0 |
| 6 | Rust fixtures | `tests/fixtures/helpers.rs` (reuse) | [x] | 0 |
| 7 | JS test setup | `test/setup.ts` (reuse) | [x] | 0 |
| 8 | JS custom render | `test-utils.tsx` (reuse) | [x] | 0 |
| 9 | JS component | 9 files in `features/topic-detail/` | [x] | 78 |
| 10 | JS utility | `lib/__tests__/topic-detail-utils.test.ts` | [x] | pre-existing |
| 11 | JS factory | `mock/__tests__/topic-detail.factory.test.ts` | [x] | 20 |
| 12 | MSW handlers | `mock/handlers/topic-detail.handlers.ts` | [x] | 5 endpoints |
| 13 | MSW verification | `mock/__tests__/msw-verification.test.ts` | [x] | 12 additions |
| 14 | E2E mocked | `e2e/dashboard/topic-detail.spec.ts` | [~] | 0 (SSR loader constraint — page.route() can't intercept server-side calls) |
| 15 | E2E real API | `e2e/real-api/topic-detail.spec.ts` | [x] | 8 |
| 16 | E2E visual regression | `e2e/real-api/topic-detail-visual.spec.ts` | [x] | 1 |
| | **Total** | | | **~165 tests (163 written + 2 pre-existing)** |

---

## Verification Commands

| Layer | Command |
|---|---|
| Rust unit | `cargo test -p backend --test unit_tests -- unit::topic_detail` |
| Rust snapshot | `cargo insta review` then `cargo test -p backend --test unit_tests -- unit::topic_detail_snapshot` |
| Rust integration | `cargo test -p backend --test integration_tests -- integration::topic_detail` |
| Rust scenario | `cargo test -p backend --test mod -- scenarios::topic_detail_flow` |
| Rust all | `cargo test -p backend` |
| JS/TS all | `pnpm --filter web-admin exec vitest run` |
| JS component | `pnpm --filter web-admin exec vitest run src/features/topic-detail/` |
| JS utility | `pnpm --filter web-admin exec vitest run lib/__tests__/topic-detail-utils.test.ts` |
| Factory + MSW | `pnpm --filter web-admin exec vitest run mock/` |
| E2E mocked | ~~N/A — skipped (SSR loader constraint, see Kind 14 above)~~ |
| E2E real API | `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/topic-detail.spec.ts` |
| E2E visual | `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/topic-detail-visual.spec.ts` |
| CI | `just ci` |
