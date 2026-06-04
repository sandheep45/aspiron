# Implementation Plan: Content Analytics Dashboard

## Objective

Deliver a premium dark-mode **Content Analytics Dashboard** with full backend (Rust/Axum/SeaORM), frontend (React/TypeScript/Tailwind/shadcn), API client, TanStack Query hooks, and MSW mock infrastructure.

---

## Implementation Order

```
  1. Backend DTOs (response types + TS derive)         ✅
  2. Backend handlers + route registration              ✅
  3. TypeScript types (just generate-types)              ✅
  4. API client service                                  ✅
  5. TanStack query keys + hooks                        ✅
  6. Build packages (just build-packages)                ✅
  7. MSW mock factory + handlers                        ✅
  8. Frontend components (11 files)                     ✅
  9. Route integration                                   ✅
  10. Build & verify                                    ✅
```

---

## Step 1: Rust Backend DTOs

### File: `apps/backend/src/http/responses/content_dashboard.rs` (CREATE)

#### Response types

- [x] **`ContentDashboardSummaryResponse`**
  - [x] Fields: `subjects_covered: i64`, `topics_published: i64`, `topics_in_draft: i64`, `topics_flagged: i64`
  - [x] Derives: `Debug, Clone, Serialize, Deserialize, TS, ToSchema`
  - [x] `#[ts(export, rename = "ContentDashboardSummary")]`

- [x] **`ContentDashboardAttentionItem`**
  - [x] Fields: `id: Uuid`, `topic: String`, `issue: String`, `reason: String`, `students_affected: i64`
  - [x] Derives same as above

- [x] **`ContentDashboardAttentionResponse`**
  - [x] Fields: `total: i64`, `items: Vec<ContentDashboardAttentionItem>`

- [x] **`ContentDashboardSubjectProgress`**
  - [x] Fields: `id: String` (Uuid as string), `name: String`, `completion: f64`, `total_topics: i64`, `published_topics: i64`, `draft_topics: i64`
  - [x] `#[serde(rename_all = "snake_case")]`

- [x] **`ContentDashboardSignalItem`**
  - [x] Fields: `topic: String`, `score: Option<f64>`, `drop: Option<f64>`

- [x] **`ContentDashboardSignalsResponse`**
  - [x] Fields: `highest_recall: Vec<ContentDashboardSignalItem>`, `fastest_decay: Vec<ContentDashboardSignalItem>`

### File: `apps/backend/src/http/responses/mod.rs` (MODIFY)

- [x] Add `pub mod content_dashboard;`

---

## Step 2: Backend Handlers + Routes

### File: `apps/backend/src/http/handlers/content_dashboard.rs` (CREATE)

- [x] **Handler: `handler_get_content_dashboard_summary`**
  - [x] Query: Count subjects → `subjects_covered`
  - [x] Query: Count topics with quizzes → `topics_published`
  - [x] Query: Count topics without quizzes → `topics_in_draft`
  - [x] Query: Count topics with poor recall → `topics_flagged`
  - [x] Return `Json<ContentDashboardSummaryResponse>`

- [x] **Handler: `handler_get_content_dashboard_attention`**
  - [x] Query topics with recall decline from `learning_recall_session` + `learning_recall_answer`
  - [x] Return `Json<ContentDashboardAttentionResponse>`

- [x] **Handler: `handler_get_content_dashboard_subjects`**
  - [x] For each subject, count total/published/draft topics via chapter join
  - [x] Completion = `published_topics / total_topics * 100`
  - [x] Return `Json<Vec<ContentDashboardSubjectProgress>>`

- [x] **Handler: `handler_get_content_dashboard_signals`**
  - [x] Query highest recall topics from `learning_recall_answer` aggregation
  - [x] Query fastest decay topics
  - [x] Return `Json<ContentDashboardSignalsResponse>`

### File: `apps/backend/src/http/handlers/mod.rs` (MODIFY)

- [x] Add `pub mod content_dashboard;`

### File: `apps/backend/src/http/routes/content.rs` (MODIFY)

- [x] Import new handler functions
- [x] Add 4 routes:
  ```rust
  .route("/content/dashboard/summary", get(handler_get_content_dashboard_summary))
  .route("/content/dashboard/attention", get(handler_get_content_dashboard_attention))
  .route("/content/dashboard/subjects", get(handler_get_content_dashboard_subjects))
  .route("/content/dashboard/signals", get(handler_get_content_dashboard_signals))
  ```

---

## Step 3: Generate TypeScript Types

- [x] Run `cargo test -p backend` (ts-rs generates `.ts` files)
- [x] Run `just generate-types` (copies to api-client, fixes imports, generates barrel)

---

## Step 4: API Client Service

### File: `packages/api-client/src/services/admin/content-dashboard.service.ts` (CREATE)

- [x] `contentDashboardService.getSummary({ options })` → `GET /content/dashboard/summary`
- [x] `contentDashboardService.getAttention({ options })` → `GET /content/dashboard/attention`
- [x] `contentDashboardService.getSubjects({ options })` → `GET /content/dashboard/subjects`
- [x] `contentDashboardService.getSignals({ options })` → `GET /content/dashboard/signals`

### File: `packages/api-client/src/index.ts` (MODIFY)

- [x] Add `export * from '@/services/admin/content-dashboard.service'`

---

## Step 5: TanStack Query Hooks

### File: `packages/tanstack-client/src/types/query-keys.ts` (MODIFY)

- [x] Add content dashboard query keys:
  ```typescript
  contentDashboard: {
    summary: () => ['contentDashboard', 'summary'] as const,
    attention: () => ['contentDashboard', 'attention'] as const,
    subjects: () => ['contentDashboard', 'subjects'] as const,
    signals: () => ['contentDashboard', 'signals'] as const,
  }
  ```

### File: `packages/tanstack-client/src/hooks/admin/content-dashboard.ts` (CREATE)

- [x] `useContentSummaryQuery(options?)`
- [x] `useAttentionItemsQuery(options?)`
- [x] `useSubjectProgressQuery(options?)`
- [x] `useContentSignalsQuery(options?)`

### File: `packages/tanstack-client/src/hooks/admin/index.ts` (MODIFY)

- [x] Add `export * from '@/hooks/admin/content-dashboard'`

---

## Step 6: Build Packages

- [x] Run `just build-packages` (config → api-client → tanstack-client)

---

## Step 7: MSW Mocks

### File: `apps/web-admin/mock/factories/content-dashboard.factory.ts` (CREATE)

- [x] `buildContentDashboardSummary(overrides?)`
- [x] `buildContentDashboardAttentionItem(overrides?)`
- [x] `buildContentDashboardAttentionResponse(count?)`
- [x] `buildContentDashboardSubjectProgress(overrides?)`
- [x] `buildContentDashboardSignalItem(overrides?)`
- [x] `buildContentDashboardSignalsResponse()`

### File: `apps/web-admin/mock/handlers/content-dashboard.handlers.ts` (CREATE)

- [x] Handler: `GET */api/v1/content/dashboard/summary`
- [x] Handler: `GET */api/v1/content/dashboard/attention`
- [x] Handler: `GET */api/v1/content/dashboard/subjects`
- [x] Handler: `GET */api/v1/content/dashboard/signals`

### File: `apps/web-admin/mock/factories/index.ts` (MODIFY)

- [x] Add export from content-dashboard factory

### File: `apps/web-admin/mock/handlers/index.ts` (MODIFY)

- [x] Import and spread `contentDashboardHandlers`

---

## Step 8: Frontend Components

### File: `apps/web-admin/src/features/content-dashboard/components/metric-card.tsx` (CREATE)

- [x] Props: `icon: LucideIcon, title: string, value: number, supportingText: string`
- [x] Glassmorphism card with white/6% border, 16px radius
- [x] Hover: subtle glow + lift (`hover:-translate-y-0.5 hover:shadow-lg`)
- [x] Loading skeleton variant via `Skeleton`
- [x] Empty state support

### File: `apps/web-admin/src/features/content-dashboard/components/issue-badge.tsx` (CREATE)

- [x] Props: `issue: string`
- [x] Color mapping: "Low Recall" → red, "Poor Accuracy" → orange, "High Drop-off" → amber, "Weak Fundamentals" → yellow

### File: `apps/web-admin/src/features/content-dashboard/components/progress-bar.tsx` (CREATE)

- [x] Props: `value: number`
- [x] Purple gradient: `from-purple-600 to-purple-400`
- [x] Animated width transition

### File: `apps/web-admin/src/features/content-dashboard/components/subject-progress-card.tsx` (CREATE)

- [x] Props: `subject: SubjectProgress` (from generated types)
- [x] Renders name, completion %, ProgressBar, stats row

### File: `apps/web-admin/src/features/content-dashboard/components/content-attention-table.tsx` (CREATE)

- [x] Props: `items: AttentionItem[], total: number, onViewTopic: (id: string) => void`
- [x] Search input with debounce
- [x] Sort controls (topic, issue, students)
- [x] Filter by issue type
- [x] Pagination (page-based)
- [x] Sticky table header
- [x] Row hover effect
- [x] IssueBadge per row
- [x] Empty state
- [x] Skeleton loading

### File: `apps/web-admin/src/features/content-dashboard/components/signal-card.tsx` (CREATE)

- [x] Props: `title: string, icon: LucideIcon, items: SignalItem[], valueKey: 'score' | 'drop'`
- [x] Ranked list rendering
- [x] Loading skeleton
- [x] Empty state

### File: `apps/web-admin/src/features/content-dashboard/components/quality-signals-section.tsx` (CREATE)

- [x] Props: `highestRecall: SignalItem[], fastestDecay: SignalItem[], isLoading: boolean`
- [x] 2-column grid (desktop), stack (mobile)
- [x] Renders two SignalCard instances

### File: `apps/web-admin/src/features/content-dashboard/components/loading-skeleton.tsx` (CREATE)

- [x] `MetricCardSkeleton` (for Section 1)
- [x] `AttentionTableSkeleton` (for Section 2)
- [x] `SubjectProgressSkeleton` (for Section 3)
- [x] `SignalsSectionSkeleton` (for Section 4)

### File: `apps/web-admin/src/features/content-dashboard/components/empty-state.tsx` (CREATE)

- [x] Props: `icon: LucideIcon, title: string, description: string`
- [x] Centered layout with icon in rounded container

### File: `apps/web-admin/src/features/content-dashboard/components/content-dashboard-page.tsx` (CREATE)

- [x] Query all 4 hooks: `useContentSummaryQuery`, `useAttentionItemsQuery`, `useSubjectProgressQuery`, `useContentSignalsQuery`
- [x] Manage Section 2 state: search, sort, filter, pagination
- [x] `onViewTopic` callback (console.warn for now)
- [x] Render all 4 sections with loading/error/empty/data states
- [x] Page header with title + subtitle

---

## Step 9: Route Integration

### File: `apps/web-admin/src/routes/_private-routes/content/_content-layout/index.tsx` (MODIFY)

- [x] Import `ContentDashboardPage`
- [x] Replace placeholder div with `<ContentDashboardPage />`

---

## Step 10: Build & Verify

- [x] `pnpm biome check .` — no lint/format issues
- [x] `cargo check --all-targets --all-features` — Rust compiles
- [x] `just ci` — full pipeline

---

## Component Tree

```
ContentDashboardPage
├── MetricCard (×4)              ← Section 1: Content Health Snapshot
├── ContentAttentionTable         ← Section 2: Content Needing Attention
│   └── IssueBadge (per row)
├── SubjectProgressCard (×N)     ← Section 3: Subject Entry Points
│   └── ProgressBar
└── QualitySignalsSection         ← Section 4: Content Quality Signals
    ├── SignalCard (Highest Recall)
    └── SignalCard (Fastest Decay)
```

## API Endpoints

| Method | Path | Response Type |
|---|---|---|
| GET | `/api/v1/content/dashboard/summary` | `ContentDashboardSummary` |
| GET | `/api/v1/content/dashboard/attention` | `ContentDashboardAttentionResponse` |
| GET | `/api/v1/content/dashboard/subjects` | `ContentDashboardSubjectProgress[]` |
| GET | `/api/v1/content/dashboard/signals` | `ContentDashboardSignalsResponse` |

## Summary

| Step | Layer | What | Status | Files |
|---|---|---|---|---|
| 1 | Backend DTOs | Response types + TS derive | ✅ Done | `http/responses/content_dashboard.rs` |
| 2 | Backend handlers | 4 HTTP handlers | ✅ Done | `http/handlers/content_dashboard.rs` |
| 3 | Backend routes | 4 routes in content router | ✅ Done | `http/routes/content.rs` |
| 4 | TS types | Generated from `just generate-types` | ✅ Done | 6 types in `generated-types/` |
| 5 | API client | Service with 4 methods | ✅ Done | `services/admin/content-dashboard.service.ts` |
| 6 | TanStack hooks | 4 hooks + query keys | ✅ Done | `hooks/admin/content-dashboard.ts` |
| 7 | Build packages | config → api-client → tanstack-client | ✅ Done | — |
| 8 | MSW mocks | Factory + 4 handlers | ✅ Done | `mock/factories/`, `mock/handlers/` |
| 9 | Frontend components | 10 components | ✅ Done | `features/content-dashboard/components/` |
| 10 | Route integration | Content index route updated | ✅ Done | `routes/.../content/_content-layout/index.tsx` |
| 11 | Verification | Biome + cargo + tests | ✅ Done | All 362 files checked, 202 tests pass |

## Regression Protection

- [x] `pnpm biome check .` — 362 files, no issues
- [x] `cargo check -p backend` — clean compilation
- [x] `pnpm --filter web-admin build` — production build succeeds
- [x] `pnpm --filter web-admin test` — all 202 tests pass (26 files)
- [x] `just build-packages` — api-client + tanstack-client build

## Color Tokens

| Element | Color |
|---|---|
| Card border | `rgba(255,255,255,0.06)` |
| Card radius | `16px` (rounded-2xl) |
| Accent (purple) | `indigo-400` / `purple-500` |
| Danger (red) | `red-400` / `red-500/20` |
| Warning (orange) | `orange-400` |
| Success (green) | `emerald-400` |
| Background | Dark navy (inherited) |
