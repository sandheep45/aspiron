# Implementation Plan: Notes Manager — Full Test Coverage

## Legend
- `[ ]` — pending
- `[x]` — done
- `[~]` — skipped (with reason)

---

## Phase 0: New Fixtures & Harness Methods — `[ ]` pending

### `tests/fixtures/context.rs`
- [ ] Add `TestNote` struct
- [ ] Add `TestReference` struct

### `tests/fixtures/helpers.rs`
- [ ] Add `create_test_teacher_note(db, topic_id, content, status) -> TestNote`
- [ ] Add `create_test_ai_note(db, topic_id, title, content, status) -> TestNote`
- [ ] Add `create_test_reference(db, topic_id, title, source, ref_type, url, visible) -> TestReference`

### `tests/harness.rs`
- [ ] Add `put_json(&self, path, body)` method
- [ ] Add `delete_request(&self, path)` method

### Verify
- [ ] `cargo check --all-targets --all-features` passes

---

## Phase 1: MSW Infrastructure — `[ ]` pending

### `mock/factories/notes-manager.factory.ts`
- [ ] `buildNotesOverview(overrides?) -> NotesOverview`
  - [ ] Default values: teacher_notes_status, ai_notes_status, external_references_count, student_engagement
  - [ ] Overrides merge correctly
- [ ] `buildTeacherNote(overrides?) -> TeacherNote`
  - [ ] Default values: id, content, status, updated_at
  - [ ] Content is valid HTML for Tiptap
- [ ] `buildAiNote(overrides?) -> AiNote`
  - [ ] Default values: id, title, content, status, generated_at
- [ ] `buildReference(overrides?) -> Reference`
  - [ ] Default values: id, title, source, reference_type, url, visible
- [ ] `buildAiNoteList(count, overrides?)`
- [ ] `buildReferenceList(count, overrides?)`
- [ ] Counter-based ID generation with `uid()` and `resetIdCounter()`

### `mock/handlers/notes-manager.handlers.ts`
- [ ] `GET */api/v1/topics/:topicId/notes/overview` — returns `NotesOverview`
- [ ] `GET */api/v1/topics/:topicId/notes` — returns `TeacherNote`
- [ ] `PUT */api/v1/topics/:topicId/notes` — updates and returns `TeacherNote`
- [ ] `POST */api/v1/topics/:topicId/notes/publish` — changes status to published
- [ ] `POST */api/v1/topics/:topicId/notes/unpublish` — changes status to draft
- [ ] `GET */api/v1/topics/:topicId/ai-notes` — returns `AiNote[]`
- [ ] `POST */api/v1/topics/:topicId/ai-notes/:noteId/approve` — changes status to approved
- [ ] `GET */api/v1/topics/:topicId/references` — returns `Reference[]`
- [ ] `POST */api/v1/topics/:topicId/references` — creates and returns `Reference`
- [ ] `DELETE */api/v1/topics/:topicId/references/:referenceId` — returns 204 or 200
- [ ] `POST */api/v1/topics/:topicId/references/:referenceId/toggle` — flips `visible` and returns `Reference`
- [ ] All return 404 for `topicId === 'unknown'`

### `mock/handlers/index.ts`
- [ ] Import `notesManagerHandlers` and spread into `handlers` array

---

## Phase 2: Rust Backend Tests — `[ ]` pending

### 1. Rust Snapshot — `tests/unit/notes_manager_snapshot.rs`
- [ ] Register `mod notes_manager_snapshot;` in `tests/unit/mod.rs`
- [ ] `notes_overview_empty` — `NotesOverviewResponse` all zeros
- [ ] `notes_overview_populated` — teacher published, ai approved, 5 references, 78% engagement
- [ ] `teacher_note_draft` — `TeacherNoteResponse` with status draft, has content
- [ ] `teacher_note_published` — published status, has content
- [ ] `ai_note_pending` — `AiNoteResponse` with pending_review
- [ ] `ai_note_approved` — approved status
- [ ] `reference_visible` — `ReferenceResponse` with visible=true, all fields
- [ ] `reference_hidden` — visible=false

#### Verify
- [ ] `cargo test -p backend --lib unit::notes_manager_snapshot -- --nocapture`
- [ ] `cargo insta review && cargo insta accept`

### 2. Rust Integration — `tests/integration/notes_manager.rs`
- [ ] Register `mod notes_manager;` in `tests/integration/mod.rs`

#### Overview endpoint (3 tests)
- [ ] `overview_returns_counts_when_notes_exist`
  - [ ] Create teacher note + AI note + 2 references
  - [ ] GET → assert teacher_notes_status, ai_notes_status, external_references_count = 2
- [ ] `overview_returns_zeros_when_no_notes`
  - [ ] Create topic with no notes
  - [ ] GET → all fields zero/null
- [ ] `overview_excludes_soft_deleted_items`
  - [ ] Create reference then soft-delete it
  - [ ] GET → external_references_count = 0

#### Teacher notes (5 tests)
- [ ] `teacher_notes_returns_empty_when_missing`
  - [ ] GET for topic without teacher note → status 200, content empty, status draft
- [ ] `teacher_notes_returns_content_when_exists`
  - [ ] Create teacher note via fixture
  - [ ] GET returns same content + status
- [ ] `update_teacher_note_creates_new`
  - [ ] PUT on topic without existing note → creates, returns with status draft
- [ ] `update_teacher_note_updates_existing`
  - [ ] Create teacher note, PUT with new content → returns updated content
- [ ] `publish_and_unpublish_roundtrip`
  - [ ] Create draft → publish → status published → unpublish → status draft

#### AI notes (3 tests)
- [ ] `ai_notes_returns_list_when_exist`
  - [ ] Create 2 AI notes → GET returns array of 2
- [ ] `ai_notes_returns_empty_when_none`
  - [ ] GET without AI notes → empty array
- [ ] `approve_ai_note_changes_status`
  - [ ] Create AI note with pending_review → approve → status approved

#### References CRUD (6 tests)
- [ ] `references_returns_list`
  - [ ] Create 3 references → GET returns array of 3
- [ ] `references_returns_empty_when_none`
  - [ ] GET without references → empty array
- [ ] `create_reference_adds_external_reference`
  - [ ] POST valid reference → returns created reference with ID
  - [ ] Verify overview count increments
- [ ] `delete_reference_soft_deletes`
  - [ ] Create reference → DELETE → GET returns empty array
  - [ ] Verify overview count decrements
- [ ] `toggle_visibility_flips_flag`
  - [ ] Create reference with visible=true → toggle → visible=false → toggle again → visible=true
- [ ] `delete_nonexistent_reference_returns_404`
  - [ ] DELETE random UUID → 404

#### Verify
- [ ] `cargo test -p backend --test integration_tests -- integration::notes_manager -- --nocapture`

### 3. Rust Scenario — `tests/scenarios/notes_manager_flow.rs` (optional, lower priority)
- [ ] Register `mod notes_manager_flow;` in `tests/scenarios/mod.rs`
- [ ] **Teacher creates notes and references workflow**
  - [ ] Create admin user with ScenarioBuilder
  - [ ] Create content hierarchy (subject → chapter → topic)
  - [ ] Add teacher note as draft
  - [ ] Publish teacher notes
  - [ ] Add 2 AI notes (pending_review)
  - [ ] Approve one AI note
  - [ ] Add 3 references
  - [ ] Toggle one reference visibility
  - [ ] Delete one reference
  - [ ] GET overview and verify counts

#### Verify
- [ ] `cargo test -p backend --test scenarios -- scenarios::notes_manager_flow`

---

## Phase 3: Frontend Component Tests — `[ ]` pending

Each test file follows: `vi.hoisted()` → `vi.mock()` → `afterEach(vi.clearAllMocks())` → loading/error/empty/success patterns.

### 4. `status-badge.test.tsx`
- [ ] Renders "published" with emerald dot
- [ ] Renders "draft" with slate dot
- [ ] Renders "pending_review" with amber dot
- [ ] Renders "approved" with emerald dot
- [ ] Renders "archived" with red dot
- [ ] Renders "none" with slate dot
- [ ] Falls back to slate for unknown status

### 5. `loading-skeleton.test.tsx`
- [ ] `OverviewCardSkeleton` renders 4 animated pulse columns
- [ ] `EditorSkeleton` renders toolbar + 5 content lines
- [ ] `TableSkeleton` renders header + default 3 rows
- [ ] `TableSkeleton` accepts custom row count

### 6. `notes-overview-card.test.tsx`
- [ ] **Loading**: 4 animated pulse blocks, no metric text visible
- [ ] **Success**: renders 4 metrics with correct labels and values
- [ ] Handles teacher_notes_status="published" → icon background matches

### 7. `quick-actions-bar.test.tsx`
- [ ] Renders all 6 action buttons with icons + labels
- [ ] Disabled buttons have `disabled` attribute and muted styling
- [ ] Enabled buttons call `onAction(id)` on click

### 8. `references-table.test.tsx`
- [ ] **Loading**: skeleton rows rendered
- [ ] **Empty**: EmptyState with "Add Reference" button visible
- [ ] **Success**: renders rows with icon, title, "Open link", source, type badge, visibility Switch, delete button
- [ ] Type badge renders correct icon + color for PDF/Document/URL/Video/Research Paper
- [ ] Switch toggle calls `onToggleVisibility(referenceId)`
- [ ] Delete button calls `onDelete(referenceId)`

### 9. `reference-dialog.test.tsx`

#### Form rendering
- [ ] **URL mode**: renders Title, Source, Type dropdown (`<Select>`), URL input fields, Submit + Cancel buttons
- [ ] **Upload mode**: renders file picker button with dashed border, hides URL input, shows filename chip after upload
- [ ] **Default values**: title empty, source empty, referenceType="URL", url empty
- [ ] **Default tab**: URL tab is selected on open

#### Form validation (Zod schema via TanStack Form)
- [ ] **Empty title**: clears title field, submits → `'Title is required'` error shown
- [ ] **Invalid URL**: types `not-a-url` → `'Must be a valid URL'` error shown
- [ ] **Empty URL**: clears url field → `'URL is required'` error shown
- [ ] **Valid form**: fills all fields → no validation errors, submit succeeds
- [ ] **Errors clear on fix**: invalid URL → type valid URL → error disappears
- [ ] **Touched state**: errors only show after field is touched (interacted with)

#### File upload flow
- [ ] **Upload success**: pick file → calls `uploadService.uploadFile(filename, type, file)` → auto-populates url field with S3 URL
- [ ] **Auto-title**: when title is empty, upload sets title from filename (without extension)
- [ ] **Preserve title**: when title already typed, upload does NOT overwrite it
- [ ] **Filename chip**: after upload, shows uploaded filename in emerald chip with `extractFileName()`
- [ ] **Upload error**: upload rejects → shows red error banner with message

#### Submit behavior
- [ ] **Submit valid**: calls `onSubmit` with `{ title, source, referenceType, url }`
- [ ] **Submit resets form**: after successful submit, form fields reset to defaults
- [ ] **Cancel**: `onOpenChange(false)` is called via DialogClose, form resets to defaults

#### Tab switching
- [ ] **Switch to URL tab**: URL input visible, Upload button hidden
- [ ] **Switch to Upload tab**: file picker visible, URL input replaced by dashed button

### 10. `ai-notes-review.test.tsx`
- [ ] **Loading**: skeleton placeholder visible
- [ ] **Empty**: "No AI generated notes" message with Sparkles icon
- [ ] **Success**: renders note cards with title, StatusBadge, generated date, content preview
- [ ] **Approve**: calls `onApprove(noteId)` with correct ID
- [ ] **Edit**: calls `onEdit(noteId)`
- [ ] **Reject**: calls `onReject(noteId)`

### 11. `teacher-notes-editor.test.tsx`
- [ ] **Loading**: centered spinner, no toolbar
- [ ] **Success**: Tiptap editor renders with toolbar (formatting buttons visible)
- [ ] **Toolbar buttons**: click Bold → wraps selection in `<strong>`
- [ ] **Save**: calls `onSave(editor.getHTML())`
- [ ] **Publish**: button enabled when status is draft, calls `onPublish`
- [ ] **Unpublish**: button enabled when status is published, calls `onUnpublish`
- [ ] **Preview**: calls `onPreview()`

### 12. `notes-manager-page.test.tsx`
- [ ] **Loading**: all 5 section skeletons visible
- [ ] **Empty**: overview shows zeros, editor shows placeholder, AI notes shows empty state, references shows empty state
- [ ] **Success**: all 5 sections rendered with provided data
- [ ] **Save mutation success**: calls `toast.success`
- [ ] **Save mutation failure**: calls `toast.error`
- [ ] **All 7 mutation handlers fire toast on success/error**

#### Verify
- [ ] `pnpm --filter web-admin exec vitest run src/features/notes-manager/`

---

## Phase 4: Utility & Factory Tests — `[ ]` pending

### 13. Schema validation — `schema.test.ts`
Tests the Zod validation schema directly (pure function tests, no DOM needed).

- [ ] **Valid payload**: all fields correct → `{ title: 'My Ref', source: 'Web', referenceType: 'URL', url: 'https://example.com' }` passes
- [ ] **Empty title**: `title: ''` → `'Title is required'`
- [ ] **Invalid URL**: `url: 'not-a-url'` → `'Must be a valid URL'`
- [ ] **Empty URL**: `url: ''` → `'URL is required'`
- [ ] **Missing referenceType**: `referenceType: ''` → `'Type is required'`
- [ ] **Source optional**: `source: ''` passes (optional field)
- [ ] **Source missing**: omit source → passes
- [ ] **Boundary**: `title: 'a'` (min length 1) passes
- [ ] **Partial parse**: parse partial data and verify behavior

### 14. Utility — `extractFileName`
- [ ] Extract `extractFileName` from `reference-dialog.tsx` to `@/lib/utils.ts`
  - [ ] Or test inline by importing from the component file
- [ ] Normal URL: `extractFileName('https://example.com/file.pdf')` → `'file.pdf'`
- [ ] UUID-prefixed S3 URL: `'uuid_filename.ext'` → `'filename.ext'`
- [ ] Non-UUID prefix: keeps last segment as-is
- [ ] Invalid URL: returns raw input string

### 14. Factory test — `mock/__tests__/notes-manager.factory.test.ts`
- [ ] `buildNotesOverview` creates with default values
- [ ] `buildTeacherNote` creates with default values
- [ ] `buildAiNote` creates with default values
- [ ] `buildReference` creates with default values
- [ ] All four support `overrides` merge correctly
- [ ] `buildAiNoteList(3)` creates array of 3
- [ ] `buildReferenceList(3)` creates array of 3
- [ ] Counter increments across multiple `build*()` calls
- [ ] `resetIdCounter()` resets counter

### 15. MSW verification — extend `mock/__tests__/msw-verification.test.ts`
- [ ] `GET notes/overview endpoint returns expected shape`
- [ ] `GET teacher notes endpoint returns expected shape`
- [ ] `PUT teacher notes endpoint returns updated shape`
- [ ] `POST publish endpoint changes status`
- [ ] `POST unpublish endpoint changes status`
- [ ] `GET ai-notes endpoint returns array`
- [ ] `POST approve endpoint changes status`
- [ ] `GET references endpoint returns array`
- [ ] `POST create reference endpoint returns created`
- [ ] `DELETE reference endpoint returns 200`
- [ ] `POST toggle visibility endpoint flips flag`
- [ ] All endpoints return 404 for unknown topicId
- [ ] Handler override + reset works

#### Verify
- [ ] `pnpm --filter web-admin exec vitest run mock/`

---

## Phase 5: E2E Tests — `[ ]` pending

### 16. E2E Mocked — `e2e/dashboard/notes-manager.spec.ts`
- [ ] ~~Skipped — SSR loader constraint (same as topic-detail: `$id/notes.tsx` has a route loader calling `getTopicById`, `page.route()` can't intercept server-side SSR calls)~~
- [ ] ~Alternative: test only the NotesManagerPage component directly (without routing) if needed~

### 17. E2E Real API — `e2e/real-api/notes-manager.spec.ts`
- [x] Create test file with `loginAsCDAdmin` auth helper (reuse from topic-detail)
- [x] Navigate to `/content/topic/$id/notes` for CD seed topic

#### Page structure tests
- [ ] **Page renders Notes Manager heading**
- [ ] **Shows Notes Overview card with metrics** — teacher/AI status, references count, student engagement
- [ ] **Shows Teacher Notes Editor section** — Tiptap editor with toolbar
- [ ] **Shows AI Generated Notes section** — empty state with "No AI notes" or cards
- [ ] **Shows External References section** — empty table with "Add Reference" button
- [ ] **Shows Quick Actions bar** — 6 action buttons
- [ ] **No hydration mismatch warnings**

#### ReferenceDialog: open / close / cancel
- [ ] **Dialog opens from "Add Reference" button** — click → dialog visible with both tabs
- [ ] **Cancel closes dialog** — open → Cancel → dialog closes
- [ ] **Re-open shows clean form** — type in field → Cancel → re-open → form reset

#### ReferenceDialog: form validation
- [ ] **Validation: empty submission** — submit empty form → "Title is required" + "URL is required" errors
- [ ] **Validation: invalid URL** — type `not-a-url` → "Must be a valid URL" error
- [ ] **Validation: clear errors** — fix invalid URL → error disappears

#### ReferenceDialog: tab switching
- [ ] **Switch to Upload tab** — file picker shown, URL input hidden
- [ ] **Switch to URL tab** — URL input shown again

#### ReferenceDialog: submit URL reference
- [ ] **Submit valid form** — fill title + source + URL → Submit → dialog closes
- [ ] **Reference appears in table** — after creation, row visible with title + "Open link"
- [ ] **Overview count increments** — "External References" shows `1` after creation

#### Reference table interactions
- [ ] **Toggle visibility** — click Switch → visibility state flips
- [ ] **Delete reference** — click Delete → row removed from table

### 18. E2E Visual Regression — `e2e/real-api/notes-manager-visual.spec.ts`
- [ ] Full-page screenshot: `toHaveScreenshot('notes-manager-full.png', { maxDiffPixelRatio: 0.05 })`

#### Verify
- [ ] `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/notes-manager*.spec.ts`

---

## Summary Table

| # | Test Kind | File(s) | Phase | Test Count |
|---|---|---|---|---|
| — | Fixtures + harness | `helpers.rs`, `context.rs`, `harness.rs` | 0 | 5 helpers + 2 methods |
| — | MSW factories | `notes-manager.factory.ts` | 1 | 6 builders |
| — | MSW handlers | `notes-manager.handlers.ts` | 1 | 11 handlers |
| 1 | Rust snapshot | `tests/unit/notes_manager_snapshot.rs` | 2 | 8 |
| 2 | Rust integration | `tests/integration/notes_manager.rs` | 2 | 20 |
| 3 | Rust scenario | `tests/scenarios/notes_manager_flow.rs` | 2 | 1 |
| 4–12 | JS component | 9 files in `features/notes-manager/` | 3 | ~80 |
| 13 | JS schema validation | `schema.test.ts` | 4 | 9 |
| 14 | JS utility | `lib/utils.test.ts` (extend) | 4 | 4 |
| 15 | JS factory | `mock/__tests__/notes-manager.factory.test.ts` | 4 | 9 |
| 16 | MSW verification | `msw-verification.test.ts` (extend) | 4 | 13 |
| 17 | E2E mocked | `e2e/dashboard/notes-manager.spec.ts` | 5 | [~] 0 (SSR loader) |
| 18 | E2E real API | `e2e/real-api/notes-manager.spec.ts` | 5 | ~20 |
| 19 | E2E visual | `e2e/real-api/notes-manager-visual.spec.ts` | 5 | 1 |
| | **Total** | | | **~155 tests** |

---

## Verification Commands

| Layer | Command |
|---|---|
| Rust snapshot | `cargo test -p backend --lib unit::notes_manager_snapshot -- --nocapture && cargo insta review` |
| Rust integration | `cargo test -p backend --test integration_tests -- integration::notes_manager -- --nocapture` |
| Rust scenario | `cargo test -p backend --test scenarios -- scenarios::notes_manager_flow` |
| Rust all | `cargo test -p backend` |
| JS/TS all | `pnpm --filter web-admin exec vitest run` |
| JS component | `pnpm --filter web-admin exec vitest run src/features/notes-manager/` |
| Factory + MSW | `pnpm --filter web-admin exec vitest run mock/` |
| E2E real API | `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/notes-manager*.spec.ts` |
| E2E visual | `pnpm --filter web-admin exec playwright test --project=real-api e2e/real-api/notes-manager-visual.spec.ts` |
| CI | `just ci` |
