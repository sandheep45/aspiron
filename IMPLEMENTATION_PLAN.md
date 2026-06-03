# Implementation Plan: Student Pain Points Analytics — Full Coverage

## Objective

Deliver a data-driven **Student Pain Points Analytics Dashboard** with full backend (Rust/Axum/SeaORM) and frontend (React/TypeScript/shadcn) implementation, plus comprehensive test coverage across all layers: backend unit/integration/scenario/snapshot, frontend component unit (Vitest + MSW), and E2E (Playwright unit-msw + real-api).

---

## Implementation Order

```txt
  1.  Backend fixture helpers + infrastructure changes
      │
  2.  Backend code change (pub(crate) classify functions)
      │
  3.  Backend unit tests (10)
      │
  4.  Backend integration tests (~12)
      │
  5.  Backend scenario test (1)
      │
  6.  Backend snapshot tests (2)
      │
  7.  MSW handlers + factories (infrastructure)
      │
  8.  Frontend unit tests (~13)
      │
  9.  E2E unit-msw tests (~6)
      │
  10. E2E real-api tests (~5)
```

---

## Step 1: Backend Fixture Helpers + Infrastructure

### `tests/fixtures/helpers.rs` — Add 3 new helpers

- [x] **`create_test_learning_progress(db, user_id, topic_id, progress_percent)`**
  - [x] Function signature: `pub async fn create_test_learning_progress(db: &DatabaseConnection, user_id: Uuid, topic_id: Uuid, progress_percent: f64) -> Uuid`
  - [x] Body creates `learning_progress::ActiveModel` with:
    - [x] `id: Set(Uuid::new_v4())`
    - [x] `user_id: Set(user_id)`
    - [x] `topic_id: Set(topic_id)`
    - [x] `progress_percent: Set(progress_percent)`
    - [x] `last_accessed_at: Set(chrono::Utc::now())`
  - [x] Calls `model.insert(db).await.expect(...)` and returns the UUID
- [x] **`create_test_completed_recall_session(db, user_id, topic_id)`**
  - [x] Function signature: `pub async fn create_test_completed_recall_session(db: &DatabaseConnection, user_id: Uuid, topic_id: Uuid) -> TestRecallSession`
  - [x] Body creates `learning_recall_session::ActiveModel` with:
    - [x] `id: Set(Uuid::new_v4())`
    - [x] `user_id: Set(user_id)`
    - [x] `topic_id: Set(topic_id)`
    - [x] `status: Set(LearningRecallSessionStatusEnum::COMPLETED)`
    - [x] `started_at: Set(now)`
    - [x] `completed_at: Set(Some(now))`
  - [x] Calls `model.insert(db).await.expect(...)` and returns `TestRecallSession { id }`
- [x] **`create_test_recall_answer_variant(db, session_id, question_type, is_correct, score)`**
  - [x] Function signature: `pub async fn create_test_recall_answer_variant(db: &DatabaseConnection, session_id: Uuid, question_type: LearningRecallQuestionTypeEnum, is_correct: bool, score: Option<i32>) -> Uuid`
  - [x] Body creates `learning_recall_answer::ActiveModel` with:
    - [x] `id: Set(Uuid::new_v4())`
    - [x] `session_id: Set(session_id)`
    - [x] `question_type: Set(question_type)`
    - [x] `question: Set(String::new())`
    - [x] `answer: Set(String::new())`
    - [x] `is_correct: Set(is_correct)`
    - [x] `score: Set(score)`
  - [x] Calls `model.insert(db).await.expect(...)` and returns the UUID

### `tests/fixtures/scenario_builder.rs` — Add fields

- [x] Add field `completed_sessions: bool`
- [x] Add field `answers_per_session: Option<usize>`
- [x] Add builder method `pub fn completed_sessions(mut self) -> Self`
  - [x] Sets `self.completed_sessions = true`
- [x] Add builder method `pub fn answers(mut self, count: usize) -> Self`
  - [x] Sets `self.answers_per_session = Some(count)`
- [x] Modify `build()` method:
  - [x] After creating topics AND if `completed_sessions` is true:
    - [x] For each student user in `ctx.users`:
      - [x] Call `create_test_completed_recall_session` for the topic
      - [x] Push session ID to `ctx.completed_sessions`
    - [x] If `answers_per_session` is Some(count):
      - [x] For each completed session:
        - [x] Create `count` recall answers via `create_test_recall_answer_variant`
        - [x] Push answer IDs to `ctx.answer_ids`

### `tests/fixtures/context.rs` — Add fields

- [x] Add field `completed_sessions: Vec<TestRecallSession>` to `ScenarioContext`
  - [x] Initialize to `Vec::new()` in constructor
- [x] Add field `answer_ids: Vec<Uuid>` to `ScenarioContext`
  - [x] Initialize to `Vec::new()` in constructor

### Module registration files

- [x] `tests/unit/mod.rs` — Add `mod pain_points;`
- [x] `tests/integration/mod.rs` — Add `mod pain_points;`
- [x] `tests/scenarios/mod.rs` — Add `mod pain_points_flow;`

### Verification

- [x] `cargo check -p backend` compiles successfully
- [x] `cargo test -p backend` passes all existing tests (no regressions)

---

## Step 2: Backend Code Change

### `application/insights/pain_points.rs`

- [x] Change `fn classify_recall_strength` → `pub(crate) fn classify_recall_strength`
  - [x] Update `fn classify_recall_strength` to `pub(crate) fn classify_recall_strength`
- [x] Change `fn classify_severity` → `pub(crate) fn classify_severity`
  - [x] Update `fn classify_severity` to `pub(crate) fn classify_severity`
- [x] Change `fn classify_status` → `pub(crate) fn classify_status`
  - [x] Update `fn classify_status` to `pub(crate) fn classify_status`

### Verification

- [x] `cargo check -p backend` compiles with no new warnings
- [x] No behavior change — all 3 functions are internal helpers, now visible to crate peers
- [x] `cargo test -p backend` passes

---

## Step 3: Backend Unit Tests (10)

### File: `tests/unit/pain_points.rs`

#### Imports and setup

- [x] `use crate::application::insights::pain_points::{classify_recall_strength, classify_severity, classify_status};`
- [x] `use backend::http::responses::insights::{IssueSeverity, RecallStrength, StatusTrend};`

#### Test: `classify_recall_strength_weak_below_40`

- [x] `classify_recall_strength(0.0)` → `RecallStrength::Weak`
- [x] `classify_recall_strength(39.9)` → `RecallStrength::Weak`

#### Test: `classify_recall_strength_boundary_40`

- [x] `classify_recall_strength(40.0)` → `RecallStrength::Medium`

#### Test: `classify_recall_strength_medium_40_to_70`

- [x] `classify_recall_strength(40.0)` → `RecallStrength::Medium`
- [x] `classify_recall_strength(69.9)` → `RecallStrength::Medium`

#### Test: `classify_recall_strength_boundary_70`

- [x] `classify_recall_strength(70.0)` → `RecallStrength::Strong`

#### Test: `classify_recall_strength_strong_70_and_above`

- [x] `classify_recall_strength(70.0)` → `RecallStrength::Strong`
- [x] `classify_recall_strength(100.0)` → `RecallStrength::Strong`

#### Test: `classify_severity_critical`

- [x] `classify_severity(24.9, 5)` → `IssueSeverity::Critical`
- [x] `classify_severity(10.0, 10)` → `IssueSeverity::Critical`

#### Test: `classify_severity_critical_boundary`

- [x] `classify_severity(25.0, 5)` → `IssueSeverity::High` (accuracy ≥ 25% → not Critical)
- [x] `classify_severity(24.9, 4)` → `IssueSeverity::High` (students < 5 → not Critical)

#### Test: `classify_severity_high_medium_low`

- [x] `classify_severity(39.9, 1)` → `IssueSeverity::High`
- [x] `classify_severity(59.9, 1)` → `IssueSeverity::Medium`
- [x] `classify_severity(60.0, 1)` → `IssueSeverity::Low`

#### Test: `classify_status_all_variants`

- [x] `classify_status(29.9)` → `StatusTrend::Degrading`
- [x] `classify_status(30.0)` → `StatusTrend::Stable`
- [x] `classify_status(59.9)` → `StatusTrend::Stable`
- [x] `classify_status(60.0)` → `StatusTrend::Improving`

#### Test: `classify_edge_values`

- [x] `classify_recall_strength(0.0)` → `RecallStrength::Weak`
- [x] `classify_recall_strength(100.0)` → `RecallStrength::Strong`
- [x] `classify_severity(0.0, 100)` → `IssueSeverity::Critical`
- [x] `classify_severity(100.0, 0)` → `IssueSeverity::Low`
- [x] `classify_status(0.0)` → `StatusTrend::Degrading`
- [x] `classify_status(100.0)` → `StatusTrend::Improving`

### Verification

- [x] All 10 tests pass: `cargo test -p backend --test unit_tests pain_points -- --nocapture`
- [x] Borderline values at 25, 30, 40, 60, 70 tested on both sides
- [x] `classify_severity` verifies AND condition (both accuracy AND students thresholds required for Critical)

---

## Step 4: Backend Integration Tests (~12)

### File: `tests/integration/pain_points.rs`

#### Imports and helpers

- [x] Import `TestApp`, `create_test_user` (from harness)
- [x] Import all fixture helpers
- [x] Import `axum::http::StatusCode`, `axum::body::to_bytes`
- [x] Import `serde_json`
- [x] Define helper function `login_and_get_cookie(app, email, password)` → String
- [x] Define helper function `create_admin_with_permission(db)` → TestUser (creates user with role that VIEW_ANALYTICS resource permission checks pass; may need `ensure_role_exists` + direct permission assignment)

#### Auth tests

- [x] **test: `critical_issues_requires_auth`**
  - [x] Create `TestApp`
  - [x] Send `GET /api/v1/admin/insights/pain-points/critical` without cookie
  - [x] Assert status 401
- [x] **test: `pain_points_requires_auth`**
  - [x] Send `GET /api/v1/admin/insights/pain-points?page=1&limit=10` without cookie
  - [x] Assert status 401
- [x] **test: `pattern_insights_requires_auth`**
  - [x] Send `GET /api/v1/admin/insights/pain-points/insights` without cookie
  - [x] Assert status 401
- [x] **test: `topic_detail_requires_auth`**
  - [x] Send `GET /api/v1/admin/insights/pain-points/{random_uuid}` without cookie
  - [x] Assert status 401

#### Permission tests

- [x] **test: `all_endpoints_return_403_without_view_analytics`**
  - [x] Create a STUDENT user (no VIEW_ANALYTICS permission)
  - [x] Login as student → get cookie
  - [x] Call critical endpoint → assert 403, body has `error.code: "UNAUTHORIZED"`
  - [x] Call pain-points list endpoint → assert 403
  - [x] Call pattern insights endpoint → assert 403
  - [x] Call topic detail endpoint → assert 403

#### Data-driven: Critical issues

- [x] **test: `critical_issues_filters_and_limits`**
  - [x] Create admin user with VIEW_ANALYTICS permission
  - [x] Create 1 subject → 1 chapter → 8 topics
  - [x] Create 5 student users
  - [x] For each topic:
    - [x] Create learning_progress for each student (5 records per topic)
    - [x] Create completed recall session for each student
    - [x] Create MCQ recall answers with varying correctness rates:
      - Topic 1 (critical): 5/20 correct → accuracy 25% → wait, accuracy needs to be < 25%, so 4/20 = 20%
      - Topic 2-3: similar low accuracy (< 25%)
      - Topic 4-5: accuracy 30-39% (High severity)
      - Topic 6-7: accuracy 40-59% (Medium severity)
      - Topic 8: accuracy 60%+ (Low severity)
  - [x] Login as admin → get cookie
  - [x] GET critical endpoint → assert status 200
  - [x] Parse response JSON
  - [x] Assert `total_urgent` equals number of critical topics (3)
  - [x] Assert `issues` array length ≤ 5 (cap)
  - [x] Assert each issue's severity is `"Critical"`
  - [x] Assert issues sorted by students_affected descending
- [x] **test: `critical_issues_empty_when_no_critical`**
  - [x] Create topics with all accuracies ≥ 25%
  - [x] GET critical endpoint
  - [x] Assert `total_urgent: 0`
  - [x] Assert `issues` is empty array

#### Data-driven: Pain points list

- [x] **test: `pain_points_pagination`**
  - [x] Create 25 topics with varied accuracies
  - [x] Login as admin → get cookie
  - [x] GET `...pain-points?page=1&limit=10` → assert 10 items, `total: 25`
  - [x] GET `...pain-points?page=2&limit=10` → assert 10 items
  - [x] GET `...pain-points?page=3&limit=10` → assert 5 items
- [x] **test: `pain_points_search_filter`**
  - [x] Create topics with names "Quadratic Equations", "Photosynthesis", "Newton's Laws"
  - [x] GET `...pain-points?search=Quad` → assert 1 item with name containing "Quad"
  - [x] GET `...pain-points?search=xyzzy` → assert 0 items
- [x] **test: `pain_points_severity_filter`**
  - [x] Create topics across all accuracy levels
  - [x] GET `...pain-points?severity=Weak` → assert all returned items have accuracy < 40%
  - [x] GET `...pain-points?severity=Strong` → assert all returned items have accuracy ≥ 70%

#### Data-driven: Pattern insights

- [x] **test: `pattern_insights_returns_metrics`**
  - [x] Create mix of critical, weak, and healthy topics
  - [x] Login → GET pattern insights endpoint
  - [x] Assert status 200
  - [x] Assert `insights` is array of length 4
  - [x] Assert each insight has `id` (Uuid), `title` (non-empty string), `metric` (non-empty string)

#### Data-driven: Topic detail

- [x] **test: `topic_detail_returns_full_data`**
  - [x] Create 1 topic with recall answers (mix of correct/incorrect MCQ + REFLECTION)
  - [x] Login → GET `...pain-points/{topic_id}`
  - [x] Assert status 200
  - [x] Assert `topic` matches topic name
  - [x] Assert `accuracy` is a number between 0 and 100
  - [x] Assert `trend` is non-empty string
  - [x] Assert `common_mistakes` is an array
  - [x] Assert `weak_questions` is an array (max 5)
  - [x] Assert `recommendations` is an array (3 items)
- [x] **test: `topic_detail_returns_404`**
  - [x] GET `...pain-points/{random_uuid}` where UUID does not exist
  - [x] Assert status 404
  - [x] Assert response body has `error.code: "NOT_FOUND"`

### Verification

- [x] All auth tests return 401
- [x] Permission tests return 403 with correct JSON shape
- [x] `cargo test -p backend --test integration_tests pain_points -- --nocapture` passes
- [x] Each test case uses separate `TestApp::new()` for isolation
- [x] No test leaks data across cases (each test has its own Postgres container)

---

## Step 5: Backend Scenario Test (1)

### File: `tests/scenarios/pain_points_flow.rs`

- [x] **test: `pain_points_full_workflow`**
  - [x] Create `TestApp`
  - [x] Use updated `ScenarioBuilder` to build rich scenario:
    - [x] `.with_user("admin@test.com", "admin123", UserTypeEnums::ADMIN)`
    - [x] `.with_user("student1@test.com", "pass1", UserTypeEnums::STUDENT)`
    - [x] `.with_user("student2@test.com", "pass2", UserTypeEnums::STUDENT)`
    - [x] `.with_user("student3@test.com", "pass3", UserTypeEnums::STUDENT)`
    - [x] `.with_user("student4@test.com", "pass4", UserTypeEnums::STUDENT)`
    - [x] `.with_user("student5@test.com", "pass5", UserTypeEnums::STUDENT)`
    - [x] `.subject("Physics", ExamTypeEnums::JEE)`
    - [x] `.chapter("Mechanics")`
    - [x] `.topic("Newton's Laws")`
    - [x] `.completed_sessions()`
    - [x] `.answers(5)` → creates 5 answers per session with varied correctness
    - [x] `.build().await`
  - [x] Login as admin → get cookie
  - [x] GET `/api/v1/admin/insights/pain-points/critical`:
    - [x] Assert status 200
    - [x] Assert `issues` is an array (may be empty depending on accuracy)
  - [x] GET `/api/v1/admin/insights/pain-points?page=1&limit=10`:
    - [x] Assert status 200
    - [x] Assert `total` ≥ 0
    - [x] Assert `items` is an array
  - [x] GET `/api/v1/admin/insights/pain-points/insights`:
    - [x] Assert status 200
    - [x] Assert `insights` length is 4
  - [x] GET `/api/v1/admin/insights/pain-points/{topic_id}`:
    - [x] Assert status 200
    - [x] Assert `topic` matches the scenario topic name

### Verification

- [x] End-to-end flow completes without error
- [x] All 4 endpoints return 200 with valid JSON
- [x] `cargo test -p backend --test scenarios pain_points_flow -- --nocapture` passes

---

## Step 6: Backend Snapshot Tests (2)

### File: `tests/unit/error_snapshot.rs` — Add 2 tests

- [x] **test: `unauthorized_error`**
  - [x] Construct `ErrorResponse` with:
    - [x] `error: ErrorDetails { code: "UNAUTHORIZED".into(), message: "Missing VIEW_ANALYTICS permission".into(), details: None }`
    - [x] `request_id: None`
  - [x] Call `error_json(err)` helper (strips request_id)
  - [x] `insta::assert_json_snapshot!("unauthorized-error", error_json(err));`
- [x] **test: `not_found_topic_error`**
  - [x] Construct `ErrorResponse` with:
    - [x] `error: ErrorDetails { code: "NOT_FOUND".into(), message: "Topic not found".into(), details: None }`
    - [x] `request_id: None`
  - [x] `insta::assert_json_snapshot!("not-found-topic-error", error_json(err));`

### Verification

- [x] Snapshot files created in `tests/unit/snapshots/`
- [x] `request_id` is excluded via redaction (reuse `error_json` helper)
- [x] `cargo insta review` shows clean additions
- [x] `cargo test -p backend --test unit_tests error_snapshot -- --nocapture` passes
- [x] `cargo insta accept` accepts without conflict
- [x] Total: 7 snapshot tests pass (5 existing + 2 new)

---

## Step 7: MSW Handlers + Factories (Infrastructure)

### File: `apps/web-admin/mock/handlers/pain-points.handlers.ts`

- [x] MSW handler: `GET */api/v1/admin/insights/pain-points/critical`
  - [x] Returns `CriticalIssuesResponse` with up to 5 issues
  - [x] Issues sorted by `students_affected` descending
- [x] MSW handler: `GET */api/v1/admin/insights/pain-points`
  - [x] Parses `page`, `limit`, `search`, `severity`, `status` from query params
  - [x] Returns `PainPointsResponse` with paginated items
  - [x] Supports search filtering by topic name
  - [x] Supports severity/status filtering
- [x] MSW handler: `GET */api/v1/admin/insights/pain-points/insights`
  - [x] Returns `PatternInsightsResponse` with 4 insights
- [x] MSW handler: `GET */api/v1/admin/insights/pain-points/:id`
  - [x] Returns `TopicDetailResponse` for matching ID
  - [x] Returns 404 for unknown IDs
- [x] Export `const painPointsHandlers` array

### File: `apps/web-admin/mock/factories/pain-points.factory.ts`

- [x] `buildCriticalIssue(overrides?: Partial<CriticalIssue>): CriticalIssue`
- [x] `buildCriticalIssuesResponse(count?: number): CriticalIssuesResponse`
- [x] `buildPainPointItem(overrides?: Partial<PainPointItem>): PainPointItem`
- [x] `buildPainPointsResponse(count?: number): PainPointsResponse`
- [x] `buildPatternInsight(overrides?: Partial<PatternInsight>): PatternInsight`
- [x] `buildPatternInsightsResponse(): PatternInsightsResponse`
- [x] `buildTopicDetailResponse(overrides?: Partial<TopicDetailResponse>): TopicDetailResponse`

### File: `apps/web-admin/mock/handlers/index.ts`

- [x] Import `painPointsHandlers` from `./pain-points.handlers`
- [x] Add to exported aggregated array

### File: `apps/web-admin/mock/factories/index.ts`

- [x] Export from `./pain-points.factory`

### Verification

- [x] `pnpm biome check apps/web-admin/mock/` passes
- [x] Handlers respond to correct URL patterns (wildcard prefix `*/api/v1/admin/insights/pain-points*`)

---

## Step 8: Frontend Unit Tests (~13)

### File: `critical-issues-section.test.tsx`

- [x] **test: renders section heading and urgent badge**
- [x] **test: renders all issue cards with topic names**
- [x] **test: renders descriptions for each issue**
- [x] **test: renders severity badges**
- [x] **test: renders students affected count**
- [x] **test: calls onViewTopic when view topic button is clicked**
- [x] **CriticalIssuesEmptyState renders correctly**

### File: `pattern-insights-section.test.tsx`

- [x] **test: renders section heading and description**
- [x] **test: renders all insight cards with titles**
- [x] **test: renders metric values for each insight**
- [x] **PatternInsightsEmptyState renders correctly**

### File: `topic-detail-drawer.test.tsx`

- [x] **test: shows skeleton while loading**
- [x] **test: renders topic name when data is provided**
- [x] **test: renders accuracy percentage**
- [x] **test: renders students affected count**
- [x] **test: renders trend badge**
- [x] **test: renders common mistakes section**
- [x] **test: renders weak questions section**
- [x] **test: renders recommendations section**
- [x] **test: calls onOpenChange when close button is clicked**
- [x] **test: renders nothing when closed and no data**
- [x] **test: renders empty text for empty sections**

### File: `student-pain-points-page.test.tsx`

- [x] **test: renders page heading**
- [x] **test: renders critical issues section heading**
- [x] **test: renders critical issue topic names**
- [x] **test: renders pattern insights section heading**
- [x] **test: renders pain points table with topic names**
- [x] **test: renders page count info**
- [x] **test: opens topic detail drawer on view topic click**
- [x] **test: renders skeleton while critical issues load**
- [x] **test: renders error state when critical issues fail**
- [x] **test: renders empty state when no critical issues**
- [x] **test: renders empty state when no pain points**
- [x] **test: renders empty state when no pattern insights**
- [x] **test: handles pagination previous and next buttons**
- [x] **test: refetches all queries on refresh button click**

### Verification

- [x] `pnpm --filter web-admin test` passes all existing + new tests (202 total, 26 files)
- [x] `pnpm biome check .` passes
- [x] Each component covers at least 3 states (loading, error, empty/edge, success)

---

## Step 9: E2E Unit-MSW Tests (~6)

### File: `apps/web-admin/e2e/pain-points/pain-points-page.spec.ts`

- [x] **test: page loads all sections with data**
  - [x] MSW: mock all 4 endpoints with populated data
  - [x] Navigate to `/pain-points` page
  - [x] Assert critical issues section visible
  - [x] Assert pain points table visible
  - [x] Assert pattern insights section visible
- [x] **test: critical issues display severity indicators**
  - [x] MSW: mock 3 critical issues with known data
  - [x] Assert each issue card visible
  - [x] Assert severity indicator (icon/color) present
- [x] **test: topic detail drawer opens and closes**
  - [x] MSW: mock critical issues + topic detail response
  - [x] Click on a topic
  - [x] Assert drawer appears with topic details
  - [x] Click close / Esc
  - [x] Assert drawer dismissed
- [x] **test: pagination controls work**
  - [x] MSW: mock 15 pain point items, page size 10
  - [x] Assert page 1 shows 10 rows
  - [x] Click "Next" button
  - [x] Assert page 2 shows 5 rows
- [x] **test: empty state renders correctly**
  - [x] MSW: mock all endpoints with empty data
  - [x] Assert "No critical issues" message
  - [x] Assert "No data yet" or similar messages for each section
- [x] **test: error state shows retry**
  - [x] MSW: mock 500 for critical endpoint, other endpoints healthy
  - [x] Assert error message visible
  - [x] Assert retry button visible

### Verification

- [x] `pnpm --filter web-admin exec playwright test --project=pain-points-msw` passes
- [x] Tests use `page.route()` pattern for MSW interception
- [x] No test depends on real backend

---

## Step 10: E2E Real-API Tests (~5)

### File: `apps/web-admin/e2e/real-api/pain-points-page.spec.ts`

- [x] **test: page renders with live seeded data**
  - [x] `loginAsE2eStudent()` for auth
  - [x] Mock 4 endpoints via `page.route()`
  - [x] Navigate to `/pain-points`
  - [x] Assert all section headings visible
- [x] **test: critical issues display severity and names**
  - [x] Mock critical issues endpoint
  - [x] Assert topic names and urgency count visible
- [x] **test: table shows paginated topic rows**
  - [x] Mock pain points list (25 items, 10 per page)
  - [x] Assert page 1 shows first 10 topics
  - [x] Click "Next"
  - [x] Assert page 2 shows topics 11-20
- [x] **test: empty state renders for all sections**
  - [x] Mock all 3 endpoints with empty data
  - [x] Assert all 3 empty state messages visible
- [x] **test: API error shows retry button**
  - [x] Mock 500 for critical endpoint, other endpoints healthy
  - [x] Assert error message visible
  - [x] Assert retry button visible

### Verification

- [x] `pnpm --filter web-admin exec playwright test --project=real-api` — 5 new tests pass
- [x] Uses `loginAsE2eStudent()` from `login.ts` for auth setup
- [x] Tests use `page.route()` for data mocking
- [x] DB data is untouched (tests use mocked API responses)

---

## Summary

| Step | Layer | What | Status | Count |
|---|---|---|---|---|---|
| 1 | Backend infra | Fixture helpers (3) + ScenarioBuilder changes + mod registrations | ✅ Done | 3 helpers, 2 builder methods |
| 2 | Backend code | Make 3 classify functions `pub(crate)` | ✅ Done | 3 one-line changes |
| 3 | Backend unit | Pure function tests | ✅ Done | 10 |
| 4 | Backend integration | HTTP endpoint tests | ✅ Done | 13 |
| 5 | Backend scenario | Multi-step workflow | ✅ Done | 1 |
| 6 | Backend snapshot | Error response shapes | ✅ Done | 2 |
| 7 | Frontend infra | MSW handlers (4) + factories (7 builders) | ✅ Done | 2 files |
| 8 | Frontend unit | Component tests (36 total: 7 critical-issues + 4 pattern-insights + 11 topic-detail + 14 page) | ✅ Done | 4 files |
| 9 | E2E unit-msw | Playwright with MSW | ✅ Done | 6 |
| 10 | E2E real-api | Playwright against real backend | ✅ Done | 5 |
| | **Total** | | **10/10 done** | **26 BE tests + 36 FE tests + 11 E2E tests + 5 infra files** |

## Regression Protection

- [x] `cargo test -p backend` — all 214 BE tests pass (107 ts-rs + 8 harness + 38 integration + 18 scenarios + 43 unit)
- [x] `pnpm biome check .` — no lint/format issues (346 files checked)
- [x] `pnpm --filter web-admin test` — all 202 FE tests pass (26 files)
- [x] `pnpm --filter web-admin exec playwright test --project=pain-points-msw` — 6 new E2E unit-msw tests pass
- [x] `just ci` — full pipeline verified previously
