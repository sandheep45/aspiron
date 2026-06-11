# Implementation Plan: Create Practice Question & Create Topic Test — Full Test Coverage

## Legend
- `[ ]` — pending
- `[x]` — done
- `[~]` — skipped (with reason)

---

## Phase 0: New Fixtures & Helpers — `[ ]` pending

### `tests/fixtures/context.rs`
- [ ] Add `TestQuestion` struct (id, quiz_id, question text)
- [ ] Add `TestQuiz` with `questions: Vec<TestQuestion>` if missing

### `tests/fixtures/helpers.rs`
- [ ] Add `create_test_question(db, quiz_id, question, correct_answer, options) -> Uuid`
  - Inserts `assessment_question::ActiveModel` with provided quiz_id
  - Stores optional metadata in `options` JSONB
- [ ] Add `create_test_assessment_attempt(db, quiz_id, user_id, score, submitted_at) -> Uuid` if variant needed
  - Current signature exists but may need submitted_at variant

### Verify
- [ ] `cargo check --all-targets --all-features` passes

---

## Phase 1: MSW Infrastructure — `[ ]` pending

### `mock/handlers/practice-tests.handlers.ts`

Inline builder functions (no separate factory file):

- [ ] `buildQuestionItem(overrides?) -> QuestionItem`
- [ ] `buildQuestionsResponse(overrides?) -> QuestionsResponse`
- [ ] `buildCreateQuestionResponse(overrides?) -> CreateQuestionResponse`
- [ ] `buildTopicTestItem(overrides?) -> TopicTestItem`
- [ ] `buildCreateTestResponse(overrides?) -> CreateTestResponse`
- [ ] `buildPracticeSignal(overrides?) -> PracticeSignal`
- [ ] `buildTestAnalytics(overrides?) -> TestAnalytics | null`

Handlers (7 endpoints):

- [ ] `GET */api/v1/topics/:topicId/practice/overview` — returns mock overview
- [ ] `GET */api/v1/topics/:topicId/practice/questions` — returns paginated questions, supports `search`/`sort_by`/`page`/`limit`/`question_type`/`difficulty` query params
- [ ] `POST */api/v1/topics/:topicId/practice/questions` — returns `CreateQuestionResponse`
- [ ] `GET */api/v1/topics/:topicId/practice/tests` — returns array of TopicTestItem
- [ ] `POST */api/v1/topics/:topicId/practice/tests` — returns `CreateTestResponse`
- [ ] `GET */api/v1/topics/:topicId/practice/signals` — returns array of PracticeSignal
- [ ] `GET */api/v1/topics/:topicId/practice/analytics` — returns TestAnalytics or null (based on query param like `?empty=true`)

### `mock/handlers/index.ts`
- [ ] Import `practiceTestsHandlers` and spread into `handlers` array

### MSW verification — extend `mock/__tests__/msw-verification.test.ts`
- [ ] All 7 practice-tests endpoints return expected shapes
- [ ] Handler override + reset works

---

## Phase 2: Rust Backend Tests — `[ ]` pending

### 1. Rust Unit — `tests/unit/practice_tests.rs`
- [ ] Register `mod practice_tests;` in `tests/unit/mod.rs`

#### `derive_question_type` (6 tests)
- [ ] `derive_question_type_returns_mcq` — array of 4 short strings → `"MCQ"`
- [ ] `derive_question_type_returns_multiple_select` — array of 5 strings → `"Multiple Select"`
- [ ] `derive_question_type_returns_subjective` — array with a string >50 chars → `"Subjective"`
- [ ] `derive_question_type_returns_assertion_reason` — `["true","false"]` → `"Assertion Reason"`
- [ ] `derive_question_type_returns_numerical_for_non_array` — `serde_json::json!({})` → `"Numerical"`
- [ ] `derive_question_type_returns_numerical_for_null` — `serde_json::Value::Null` → `"Numerical"`

#### `derive_difficulty` (4 tests)
- [ ] `derive_difficulty_cycles_easy_medium_hard` — index 0→"Easy", 1→"Medium", 2→"Hard", 3→"Easy"
- [ ] `derive_difficulty_handles_mod_three_for_large_indices` — index 100→"Easy"

#### `derive_question_status` (2 tests)
- [ ] `derive_question_status_always_active` — any model → `"Active"`

#### Verify
- [ ] `cargo test -p backend --lib unit::practice_tests -- --nocapture`

### 2. Rust Snapshot — `tests/unit/practice_tests_snapshot.rs`
- [ ] Register `mod practice_tests_snapshot;` in `tests/unit/mod.rs`

- [ ] `create_question_request_mcq` — full MCQ request with choices
- [ ] `create_question_request_numerical` — with tolerance + unit
- [ ] `create_question_request_subjective` — with rubric + evaluation_criteria
- [ ] `create_question_request_assertion_reason` — with assertion + reason
- [ ] `create_test_request` — full test request with 3 question_ids
- [ ] `create_question_response` — strip id (UUID), snapshot identifier pattern
- [ ] `create_test_response` — strip id (UUID), snapshot title + questions_count

#### Verify
- [ ] `cargo test -p backend --lib unit::practice_tests_snapshot -- --nocapture`
- [ ] `cargo insta review && cargo insta accept`

### 3. Rust Integration — `tests/integration/practice_tests.rs`
- [ ] Register `mod practice_tests;` in `tests/integration/mod.rs`

#### Auth behavior (1 test)
- [ ] `create_question_returns_200_without_auth` — same pattern as topic_detail (content routes don't require auth currently)

#### POST /practice/questions (5 tests)
- [ ] `create_question_returns_201` — POST valid question → 201, body has `id` + `identifier` matching `Q-\d+`
- [ ] `create_question_creates_practice_quiz_implicitly` — First question for topic creates "Practice Questions" quiz
- [ ] `create_question_reuses_existing_quiz` — Second question uses same quiz_id as first
- [ ] `create_question_handles_empty_body` — POST `{}` → 422 validation error
- [ ] `create_question_stores_metadata_in_options` — POST with explanation/hints/tags → GET questions shows them in options

#### POST /practice/tests (4 tests)
- [ ] `create_test_returns_201` — POST valid test with 3 question_ids → 201, body has `id`, `title`, `questions_count`
- [ ] `create_test_updates_question_quiz_ids` — Creates questions, creates test → questions now point to new quiz
- [ ] `create_test_without_questions` — POST test with empty `question_ids` → creates empty quiz
- [ ] `create_test_invalid_question_ids` — POST with nonexistent UUIDs → graceful handling (still creates quiz)

#### GET /practice/overview (3 tests)
- [ ] `overview_returns_defaults` — Unknown topic → total_questions=0, total_tests=0, last_test_conducted="No tests conducted"
- [ ] `overview_returns_counts` — Seed questions + quizzes → total_questions > 0, total_tests > 0
- [ ] `overview_returns_relative_time` — Seed quiz with recent attempt → last_test_conducted is "X hours ago" or "X days ago"

#### GET /practice/questions (4 tests)
- [ ] `questions_returns_paginated` — Seed 15 questions → page 1 returns limit=10, total=15, total_pages=2
- [ ] `questions_returns_all_for_no_limit` — No limit param → uses default 10
- [ ] `questions_supports_search` — Seed "Algebra" and "Geometry" → search "Alg" returns 1
- [ ] `questions_supports_sorting` — Sort by difficulty desc → correct order

#### GET /practice/tests (2 tests)
- [ ] `tests_returns_array` — Seed 2 quizzes → returns array of 2 with questions_count, difficulty_mix
- [ ] `tests_returns_empty` — No quizzes → empty array

#### GET /practice/signals (3 tests)
- [ ] `signals_returns_positive_when_high_accuracy` — Seed high avg score → "high-accuracy" Positive signal present
- [ ] `signals_returns_warning_when_low_accuracy` — Seed low avg score → "low-accuracy" Negative signal present
- [ ] `signals_returns_info_signal_always` — Always includes "application-based" Info signal

#### GET /practice/analytics (3 tests)
- [ ] `analytics_returns_null_when_no_attempts` — No submitted attempts → null
- [ ] `analytics_returns_data_with_attempts` — Seed attempts → non-null with trend data
- [ ] `analytics_returns_difficulty_distribution` — Has difficulty_distribution with percentages summing to 100

#### Verify
- [ ] `cargo test -p backend --test integration_tests -- integration::practice_tests -- --nocapture`

### 4. Rust Scenario — `tests/scenarios/practice_tests_flow.rs`
- [ ] Register `mod practice_tests_flow;` in `tests/scenarios/mod.rs`

- [ ] **scenario_create_question_lifecycle**
  - [ ] Create user + subject + chapter + topic via ScenarioBuilder
  - [ ] POST a practice question
  - [ ] GET overview → total_questions = 1
  - [ ] GET questions → items has 1 entry
  - [ ] Login as the user → verify cookie auth works

- [ ] **scenario_create_test_with_selected_questions**
  - [ ] Create user + content hierarchy
  - [ ] POST 5 questions individually
  - [ ] POST test with 3 of those question_ids
  - [ ] GET tests → array with 1 test, questions_count = 3
  - [ ] GET signals → array non-empty

- [ ] **scenario_full_practice_workflow**
  - [ ] Create admin user + topic
  - [ ] Create 3 questions via fixture helpers
  - [ ] Create test with all 3 questions
  - [ ] Create assessment attempt (simulate student taking test)
  - [ ] GET overview → counts reflect all seed data
  - [ ] GET signals → accuracy-related signals present
  - [ ] GET analytics → non-null with trend data

#### Verify
- [ ] `cargo test -p backend --test scenarios -- scenarios::practice_tests_flow`

---

## Phase 3: Frontend Component Tests — `[ ]` pending

Each test file follows: `vi.hoisted()` → `vi.mock()` → `afterEach(vi.clearAllMocks())` → loading/error/empty/success patterns.

### Create Question feature

#### 5. `create-question-page.test.tsx`
- [ ] Renders page heading "Create Practice Question"
- [ ] Renders back button → calls `onBack` on click
- [ ] Renders question type/difficulty/status selects with default values
- [ ] Renders RichTextEditor for question statement
- [ ] Preview toggle shows/hides QuestionPreview
- [ ] ValidationPanel renders with quality checks (some fail initially)
- [ ] Submit button is disabled when all checks don't pass
- [ ] Submit button is disabled during mutation pending
- [ ] Successful mutation calls `toast.success` + `onBack`
- [ ] Failed mutation calls `toast.error`
- [ ] All question-type-specific answer config sections render correctly (MCQ, MS, Numerical, Assertion Reason, Subjective)

#### 6. `rich-text-editor.test.tsx`
- [ ] Renders Tiptap toolbar with formatting buttons
- [ ] Shows placeholder text when empty
- [ ] Calls `onChange` with HTML content on input
- [ ] Accepts `minHeight` prop

#### 7. `question-preview.test.tsx`
- [ ] Renders empty state when no question provided
- [ ] Renders MCQ preview with choices rendered as list
- [ ] Renders Assertion Reason preview with A/R labels
- [ ] Shows question type badge and difficulty badge
- [ ] Uses `dangerouslySetInnerHTML` for question content

#### 8. `validation-panel.test.tsx`
- [ ] Shows "Quality Checklist" heading
- [ ] Displays passed/total count
- [ ] Shows check with pass=true → green checkmark
- [ ] Shows check with pass=false → red X + message text
- [ ] Handles empty checks array

### Create Test feature

#### 9. `create-test-page.test.tsx`
- [ ] Renders page heading "Create Topic Test"
- [ ] Renders back button → calls `onBack` on click
- [ ] Test Settings section renders all form fields with default values
- [ ] Question Selection section shows available questions table
- [ ] Question selection toggles a question into the test builder
- [ ] Test Builder shows selected questions with DnD ordering
- [ ] Analytics Preview renders when questions are selected
- [ ] Publishing Checklist renders with checks
- [ ] Student Preview toggle shows/hides preview
- [ ] Submit button is disabled until all checklist checks pass
- [ ] Successful mutation calls `toast.success` + `onBack`
- [ ] Failed mutation calls `toast.error`
- [ ] Search/filter/difficulty dropdowns filter question list
- [ ] Pagination controls render when multiple pages
- [ ] Save Draft button shows toast

#### 10. `selected-questions-panel.test.tsx`
- [ ] Renders with drag handle, identifier badge, question text, difficulty badge
- [ ] Points input changes call `onPointsChange`
- [ ] Remove button calls `onRemove`
- [ ] Shows index number
- [ ] Drag state styling applied when `isDragging` is true

#### 11. `publishing-checklist.test.tsx`
- [ ] Shows "Publishing Checklist" heading
- [ ] Displays passed/total count
- [ ] Check with pass=true → green checkmark
- [ ] Check with pass=false → red X + message text
- [ ] Handles empty checks array
- [ ] Style matches ValidationPanel (identical structure)

#### 12. `test-analytics-preview.test.tsx`
- [ ] Renders 4 metric cards: Total Questions, Est. Time, Coverage Score, Predicted Difficulty
- [ ] Difficulty Breakdown bar chart renders
- [ ] Coverage Breakdown bar chart renders
- [ ] Question type badges show counts
- [ ] Predicted difficulty text color matches (Easy=emerald, Medium=amber, Hard=red)
- [ ] Coverage progress bar width matches score percentage

#### 13. `student-preview.test.tsx`
- [ ] Shows test header with duration and question count
- [ ] Renders question sequence with numbers and identifiers
- [ ] Shows empty state when no questions
- [ ] Truncates long question text to 100 chars
- [ ] Navigation mock shows numbered buttons with first highlighted
- [ ] Submit button is disabled
- [ ] Shows "X more" indicator when >8 questions

### PracticeTestsPage sub-components

#### 14. `practice-overview-card.test.tsx`
- [ ] **Loading**: skeleton renders (loading prop)
- [ ] **Success**: renders total_questions, average_accuracy, total_tests, last_test_conducted
- [ ] Handles missing optional fields gracefully

#### 15. `questions-table.test.tsx`
- [ ] **Loading**: skeleton rows
- [ ] **Empty**: "No questions" empty state
- [ ] **Success**: renders rows with identifier, question, type, difficulty, status
- [ ] **Error**: error message with retry button
- [ ] Difficulty badge renders correct color for each level
- [ ] Status badge renders correct variant for each status

#### 16. `difficulty-badge.test.tsx`
- [ ] Renders "Easy" with emerald styling
- [ ] Renders "Medium" with amber styling
- [ ] Renders "Hard" with red styling
- [ ] Renders unknown difficulty with default styling

#### 17. `question-status-badge.test.tsx`
- [ ] Renders "Active" with green variant
- [ ] Renders "Draft" with slate variant
- [ ] Renders "Archived" with red variant

#### 18. `topic-test-card.test.tsx`
- [ ] Renders test title, status, questions_count, difficulty_mix, average_score, attempts
- [ ] Shows progress bar for average_score
- [ ] Handles missing average_score gracefully (null → no bar or dash)

#### 19. `quality-signals-section.test.tsx`
- [ ] **Loading**: skeleton
- [ ] **Empty**: "No signals" empty state
- [ ] **Success**: renders signal cards with id, message, signal_type
- [ ] Positive signals render with green accent
- [ ] Warning signals render with amber accent
- [ ] Negative signals render with red accent
- [ ] Info signals render with blue accent

#### 20. `insight-card.test.tsx`
- [ ] Renders message text
- [ ] Positive type renders green icon/background
- [ ] Warning type renders amber icon/background
- [ ] Negative type renders red icon/background
- [ ] Info type renders blue icon/background

#### 21. `quick-actions-bar.test.tsx`
- [ ] Renders action buttons with icons and labels
- [ ] Action buttons have correct onClick handlers

#### 22. `loading-skeleton.test.tsx`
- [ ] Renders animated pulse elements for each section
- [ ] OverviewSkeleton renders 4 columns
- [ ] TableSkeleton renders header + rows

#### 23. `practice-tests-page.test.tsx` (integration)
- [ ] **Loading**: all 5 section skeletons visible
- [ ] **Error**: error state with retry button
- [ ] **Empty**: overview shows zeros, questions empty state, tests empty state, signals empty state
- [ ] **Success**: all 5 sections rendered with provided data

#### Verify
- [ ] `pnpm --filter web-admin exec vitest run src/features/practice-tests/`
- [ ] `pnpm --filter web-admin exec vitest run src/features/create-question/`
- [ ] `pnpm --filter web-admin exec vitest run src/features/create-test/`

---

## Phase 4: Utility & Factory Tests — `[ ]` pending

### 24. Schema validation — `src/features/create-question/schema.test.ts`
- [ ] **Valid payload**: all required fields → passes
- [ ] **Empty question_type**: `question_type: ''` → `'Question type is required'`
- [ ] **Empty difficulty**: `difficulty: ''` → `'Difficulty is required'`
- [ ] **Empty correct_answer**: `correct_answer: ''` → `'Correct answer is required'`
- [ ] **Estimated time**: `estimated_time: 0` fails (min 1), `estimated_time: 1` passes
- [ ] **Optional fields**: status, learning_objective, choices, tolerance, etc. can be undefined
- [ ] **Default values match**: enum from form-option (MCQ, Medium, Draft)

### 25. Schema validation — `src/features/create-test/schema.test.ts`
- [ ] **Valid payload**: all required fields → passes
- [ ] **Empty title**: `title: ''` → `'Test name is required'`
- [ ] **Duration bounds**: `duration_minutes: 0` fails, `duration_minutes: 1` passes
- [ ] **Passing score bounds**: `passing_score: -1` fails, `passing_score: 101` fails, `passing_score: 50` passes
- [ ] **Optional fields**: description, instructions, etc. can be undefined
- [ ] **Default values match**: form-option defaults

### 26. Factory tests — `mock/__tests__/practice-tests.factory.test.ts`
- [ ] `buildQuestionItem` creates with default values
- [ ] `buildQuestionsResponse` creates with items array
- [ ] `buildCreateQuestionResponse` creates with identifier matching Q- pattern
- [ ] `buildTopicTestItem` creates with default title, status, etc.
- [ ] `buildCreateTestResponse` creates with title and questions_count
- [ ] `buildPracticeSignal` creates with all signal types
- [ ] `buildTestAnalytics` creates with trend data arrays
- [ ] All support `overrides` merge correctly
- [ ] Counter-based ID generation increments across calls

#### Verify
- [ ] `pnpm --filter web-admin exec vitest run mock/`

---

## Phase 5: E2E Tests — `[ ]` pending

### 27. E2E Mocked — `e2e/practice-tests/create-question.spec.ts`
- [ ] ~~Skipped — SSR loader constraint (same as topic-detail: route loader calls `getTopicById`, `page.route()` can't intercept SSR calls)~~
- [ ] ~Test only the page component directly (without routing) via Vitest instead~

### 28. E2E Mocked — `e2e/practice-tests/create-test.spec.ts`
- [ ] ~~Skipped — same SSR loader constraint~~
- [ ] ~Test via Vitest component tests instead~

### 29. E2E Mocked — `e2e/practice-tests/practice-tests.spec.ts`
- [ ] ~~Skipped — same SSR loader constraint~~
- [ ] ~Test via Vitest component tests instead~

### 30. E2E Real API — `e2e/real-api/create-question.spec.ts`
- [ ] Create test file with `loginAsCDAdmin` auth helper (reuse from topic-detail, same CD seed topic `CD Quadratic Equations`)
- [ ] Navigate to `/content/topic/30000000-0000-0000-0000-000000000041/create-question`

#### Page structure
- [ ] Page heading "Create Practice Question" visible
- [ ] Back button navigates to practice-tests page
- [ ] Question Type select defaults to "MCQ"
- [ ] Difficulty select defaults to "Medium"
- [ ] Rich text editor visible

#### Form fill and submit
- [ ] Fill question statement via rich text editor
- [ ] Fill all 4 MCQ choices (A-D)
- [ ] Select correct answer
- [ ] Toggle preview to see student view
- [ ] Submit → success toast with identifier
- [ ] Redirect back to practice-tests page
- [ ] New question appears in questions table

#### Validation
- [ ] Submit with empty question → blocked by checks
- [ ] Submit with empty correct_answer → blocked

### 31. E2E Real API — `e2e/real-api/create-test.spec.ts`
- [ ] Navigate to `/content/topic/30000000-0000-0000-0000-000000000041/create-test`

#### Page structure
- [ ] Page heading "Create Topic Test" visible
- [ ] All 6 sections rendered: Settings, Question Selection, Test Builder, Analytics Preview, Publishing Checklist, Submit

#### Test creation flow
- [ ] Fill test name
- [ ] Select 3+ questions from the question table
- [ ] Verify Test Builder shows selected questions
- [ ] Verify Analytics Preview updates with metrics
- [ ] Verify Publishing Checklist shows all green
- [ ] Submit → success toast
- [ ] Redirect back to practice-tests page
- [ ] New test appears in tests list

#### Validation
- [ ] Submit without selecting questions → submit disabled (or toast error)
- [ ] Submit without test name → submit disabled

### 32. E2E Real API — `e2e/real-api/practice-tests.spec.ts`
- [ ] Navigate to `/content/topic/30000000-0000-0000-0000-000000000041/practice-tests`

#### Page structure
- [ ] Page heading "Practice & Tests" visible
- [ ] Practice Overview card visible with metrics
- [ ] Practice Questions table visible
- [ ] Topic Tests section visible
- [ ] Quality Signals visible
- [ ] Quick Actions bar visible
- [ ] Test Performance Analytics visible
- [ ] No hydration mismatch warnings

### 33. E2E Visual Regression — `e2e/real-api/practice-tests-visual.spec.ts`
- [ ] Full-page screenshot: `toHaveScreenshot('practice-tests-full.png', { maxDiffPixelRatio: 0.05 })`
- [ ] Create-question page screenshot: `toHaveScreenshot('create-question.png', { maxDiffPixelRatio: 0.05 })`
- [ ] Create-test page screenshot: `toHaveScreenshot('create-test.png', { maxDiffPixelRatio: 0.05 })`

#### Verify
- [ ] `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/practice-tests*.spec.ts`

---

## Summary Table

| # | Test Kind | File(s) | Phase | Test Count |
|---|---|---|---|---|
| — | Fixtures + helpers | `helpers.rs`, `context.rs` | 0 | 2 helpers + 2 structs |
| — | MSW handlers | `practice-tests.handlers.ts` | 1 | 7 handlers |
| 1 | Rust unit | `tests/unit/practice_tests.rs` | 2 | 12 |
| 2 | Rust snapshot | `tests/unit/practice_tests_snapshot.rs` | 2 | 7 |
| 3 | Rust integration | `tests/integration/practice_tests.rs` | 2 | 25 |
| 4 | Rust scenario | `tests/scenarios/practice_tests_flow.rs` | 2 | 3 |
| 5–13 | JS component (create-question) | 4 files in `features/create-question/` | 3 | ~25 |
| 14–23 | JS component (create-test) | 5 files in `features/create-test/` | 3 | ~30 |
| 24–25 | JS component (practice-tests-page) | 10 files in `features/practice-tests/` | 3 | ~35 |
| 26–27 | JS schema validation | 2 `schema.test.ts` files | 4 | ~12 |
| 28 | JS factory + MSW verification | `mock/__tests__/*.test.ts` | 4 | ~9 |
| 29–31 | E2E mocked | `e2e/practice-tests/*.spec.ts` | 5 | [~] 0 (SSR loader) |
| 32–34 | E2E real API | `e2e/real-api/practice-tests*.spec.ts` | 5 | ~20 |
| 35–37 | E2E visual regression | `e2e/real-api/*-visual.spec.ts` | 5 | 3 |
| | **Total** | | | **~180 tests** |

---

## Verification Commands

| Layer | Command |
|---|---|
| Rust snapshot | `cargo test -p backend --lib unit::practice_tests_snapshot -- --nocapture && cargo insta review` |
| Rust integration | `cargo test -p backend --test integration_tests -- integration::practice_tests -- --nocapture` |
| Rust scenario | `cargo test -p backend --test scenarios -- scenarios::practice_tests_flow` |
| Rust all | `cargo test -p backend` |
| JS/TS all | `pnpm --filter web-admin exec vitest run` |
| JS create-question | `pnpm --filter web-admin exec vitest run src/features/create-question/` |
| JS create-test | `pnpm --filter web-admin exec vitest run src/features/create-test/` |
| JS practice-tests | `pnpm --filter web-admin exec vitest run src/features/practice-tests/` |
| MSW + factory | `pnpm --filter web-admin exec vitest run mock/` |
| E2E real API | `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/practice-tests*.spec.ts` |
| E2E visual | `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/practice-tests-visual.spec.ts` |
| CI | `just ci` |
