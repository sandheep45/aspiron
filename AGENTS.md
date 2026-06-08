# Aspiron — Agent Guide

## Agent behavior

- **Never commit code without asking first.** Stage changes and wait for explicit approval.

## Context sources

- `README*` files contain project overview, architecture, and setup docs — read first when onboarding.
- This file (`AGENTS.md`) is loaded as system context at every session start — keep it updated with high-signal repo facts.
- `.opencode/instructions/` — read the relevant file when your task touches that concern:

  | When working with… | Read this file |
  |---|---|
  | Rust backend, handlers, routes, DTOs, DB, SeaORM, Axum | `BACKEND.md` |
  | React components, pages, imports (`@/`), styling, shadcn | `FRONTEND.md` |
  | API client services, TanStack Query hooks, query keys | `API_CLIENT.md` |
  | React forms, TanStack Form, validation, field components | `FORMS.md` |
  | Writing or running tests, test patterns, assertions | `TESTING.md` |
- All imports in `apps/web-admin/src/` must use `@/` absolute paths — no relative imports in hand-authored code. Generated files (`routeTree.gen.ts`) and barrel files (`index.ts` re-exporting sibling modules) are exempt.

## Workspace

- **pnpm** monorepo (`pnpm@10.28.0`), hoisted node linker (`nodeLinker: hoisted`)
- JS workspace: `apps/*` (web-admin, mobile-student, documentation) and `packages/*` (config, api-client, tanstack-client)
- Rust workspace: `apps/backend` (Axum API server), `apps/migrations` (SeaORM migrations)
- **Biome** for JS linting/formatting (no ESLint/Prettier). Config at `biome.json`.
- **Just** (`just`) is the task runner — runs before every commit via `husky` + `lint-staged` (`just ci`)

## Commands

### JS
| Command | What |
|---|---|
| `pnpm dev` | Run all JS apps in parallel (via root `dev:all` script) |
| `pnpm build` | Build all JS packages + apps (via root `build:all`) |
| `pnpm test --workspaces` | Run JS tests across workspace |
| `pnpm biome check .` | Lint + format check (no mutations) |
| `pnpm biome lint --write --unsafe .` | Auto-fix + format |

### Rust
| Command | What |
|---|---|
| `cargo build` | Build all Rust crates |
| `cargo test -p backend` | Run backend tests |
| `just seed` | Seed database (requires `seed` feature) |
| `just migrate <args>` | Run migrations (`just migrate -- reset` to reset, `just migrate` to apply) |
| `just fresh-db` | Reset + migrate + seed in one shot |

### Just recipes
| Recipe | What |
|---|---|
| `just ci` | format → lint → build-all → check (runs on commit) |
| `just format` | `cargo fmt` + `biome lint --write --unsafe` |
| `just lint` | `cargo clippy -D warnings` + `biome lint` |
| `just check` | `cargo check` + `biome check` |
| `just build` | Parallel Rust + JS builds |
| `just test` | Parallel Rust + JS tests |
| `just setup` | Create `.env`, SSL certs, install deps, setup DB |
| `just build-packages` | Build JS packages in correct order: config → api-client → tanstack-client |
| `just generate-types` | Generate TS types from Rust DTOs via `ts-rs` |

## Commit conventions

- Conventional commits enforced by `commitlint` (husky `commit-msg` hook)
- Pre-commit hook runs `just ci` via `lint-staged` — this includes `format → lint → build-all → check`
- Pre-commit build includes ALL Rust + JS packages; can be slow. `--no-verify` to bypass (only if hook failure is pre-existing).

## Content Dashboard

Added June 2026:

- **Backend endpoints:** `GET /api/v1/content/dashboard/summary`, `/attention`, `/subjects`, `/signals`
  - Routes in `apps/backend/src/http/routes/content.rs`
  - Handlers in `apps/backend/src/http/handlers/content_dashboard.rs` (queries existing tables directly via AppState db)
  - Response DTOs in `apps/backend/src/http/responses/content_dashboard.rs`
- **API client:** `contentDashboardService` in `packages/api-client/src/services/admin/content-dashboard.service.ts`
- **TanStack hooks:** `useContentSummaryQuery`, `useAttentionItemsQuery`, `useSubjectProgressQuery`, `useContentSignalsQuery` in `packages/tanstack-client/src/hooks/admin/content-dashboard.ts`
- **MSW mocks:** Factory + handlers in `apps/web-admin/mock/factories/content-dashboard.factory.ts` and `apps/web-admin/mock/handlers/content-dashboard.handlers.ts`
- **Frontend:** `ContentDashboardPage` at `apps/web-admin/src/features/content-dashboard/components/` with 10 sub-components (MetricCard, ContentAttentionTable, IssueBadge, SubjectProgressCard, ProgressBar, QualitySignalsSection, SignalCard, LoadingSkeleton, EmptyState)
- **Frontend:** `useDebounceValue` hook added at `apps/web-admin/src/hooks/use-debounce-value.ts` — standalone zero-dependency implementation based on usehooks-ts API (`[T, (value: T) => void]`)
- **API-driven sorting:** The "Content Needing Attention" table (`ContentAttentionTable`) was refactored from client-side `useMemo` sorting/filtering/pagination to API-driven. Sort state (`sortBy`, `sortOrder`), search (debounced 300ms), issue filter, and pagination (`page`/`limit`) are managed in `ContentDashboardPage` and passed as `AttentionQueryParams args` to `useAttentionItemsQuery()`. Backend handler `handler_get_content_dashboard_attention` accepts `Query(AttentionQueryParams)` and applies search/filter/sort/pagination server-side.
- **`AttentionQueryParams`** is a `#[derive(TS)]` DTO in `apps/backend/src/http/payloads/content.rs` — generated to `@/generated-types` via `ts-rs`.

## Test infrastructure

- Test harness: `apps/backend/tests/harness.rs` — `TestApp` with testcontainers Postgres + SeaORM migrator + `tower::ServiceExt::oneshot`
- Scenario builder: `apps/backend/tests/fixtures/scenario_builder.rs` — fluent API for multi-user, content hierarchy, quiz, recall session
- 11 helper functions in `tests/fixtures/helpers.rs` — `create_test_user`, `create_test_subject/chapter/topic/quiz/questions/recall_session/recall_answer`, plus `create_test_learning_progress`, `create_test_completed_recall_session`, `create_test_recall_answer_variant`, `ensure_analytics_permission`
- `ensure_role_exists()` in helpers auto-creates Student/Teacher/Admin roles if missing
- `extract_jwt_cookie()` and `extract_cookies()` in harness for cookie-based auth tests
- Snapshot testing via `insta` (v1.47+): 7 snapshots in `tests/unit/snapshots/` — OpenAPI spec (1582 lines) + 7 error response shapes (VALIDATION, AUTH, ACCESS_TOKEN_EXPIRED, NOT_FOUND, INTERNAL, UNAUTHORIZED, NOT_FOUND_TOPIC). Run `cargo insta review` or `cargo insta accept` after intentional API changes.
- `request_id` field stripped from error snapshots via redaction (non-deterministic UUID)
- All 330+ backend tests pass (106 unit + 8 harness + 84 integration + 27 scenario + 105 ts-rs bindings + 0 doc), clippy clean
- All 381 frontend tests pass (57 test files), biome clean

### Phase B.3 unit tests completed

| File | Tests | Coverage |
|---|---|---|
| `tests/unit/permissions.rs` | 17 | Permission name parsing (all resources, actions, ownership), error handling |
| `tests/unit/jwt.rs` | 10 | Token round-trip, expiry, invalid tokens, wrong secret, expired tokens |
| `tests/unit/openapi_snapshot.rs` | 1 | OpenAPI spec snapshot (1582 lines) — catches unintended API contract changes |
| `tests/unit/error_snapshot.rs` | 7 | Error response shape snapshots (VALIDATION, AUTH, ACCESS_TOKEN_EXPIRED, NOT_FOUND, INTERNAL, UNAUTHORIZED, NOT_FOUND_TOPIC) |
| `tests/unit/chapters_page.rs` | 10 | `derive_chapter_status` boundary tests, null handling, min-of-two logic |
| `tests/unit/chapters_page_snapshot.rs` | 6 | Summary, item, item-null, positive/warning/negative/info insight snapshots |

### Blocked unit tests (waiting on real implementations)

| Planned file | Depends on |
|---|---|
| `tests/unit/recall_algorithm.rs` | Spaced repetition calculations (currently stubs) |
| `tests/unit/progression.rs` | Topic completion → unlock logic (currently stubs) |
| `tests/unit/notification_rules.rs` | Notification trigger rules (currently stubs) |

### Pending scenario tests (blocked on real handlers)

| Scenario | Handler status | Depends on |
|---|---|---|
| `daily_revision_workflow` | All learning handlers are stubs | Assessment + Learning real endpoints |
| `recall_session_completion` | Learning recall handlers are stubs | Learning recall endpoints |
| `note_sharing_workflow` | Community + notes handlers are stubs | Community + Learning notes endpoints |
| `permission_evolution` | RBAC router is empty | RBAC endpoints |

### Clean architecture migration: complete

All domains migrated from legacy `services/` → `domain/` + `application/` + `infra/` + `http/` pattern:

| Domain | Status | Notes |
|---|---|---|
| auth | Done | Old files deleted |
| assessment | Done | Old files deleted |
| content | Done | Old files deleted |
| learning | Done | Old files deleted |
| community | Done | Old files deleted |
| notification | Done | Old files deleted |
| insights | Done | Old files deleted |
| RBAC | Deleted | Empty stubs removed, no new modules |
| live_session | Done | Old files deleted |
| users | Done | Old files deleted |

`services/` directory fully removed from `lib.rs`. Legacy `entries/dtos/response/` still has `assessment`, `auth`, `common`, `content`, `learning` — still referenced by application layer and HTTP handlers. `entries/dtos/payload/` has `assessment`, `auth`, `content`, `insights`, `learning`.

## MSW Mock Infrastructure

- Factories: `apps/web-admin/mock/factories/` — builder functions per domain with `build*` pattern (e.g., `buildCriticalIssue`, `buildCriticalIssuesResponse`)
- Handlers: `apps/web-admin/mock/handlers/` — MSW `http.get/post` handlers, registered in `handlers/index.ts`
- Pain points handlers: `pain-points.handlers.ts` — 4 endpoints (critical issues, paginated list, pattern insights, topic detail)
- Pain points factory: `pain-points.factory.ts` — counter-based ID generation via `uid()`, `resetIdCounter()`, builder functions for all 5 response types (CriticalIssuesResponse, PainPointsResponse, PatternInsightsResponse, TopicDetailResponse, plus individual entities)
- Query parameters supported: `page`, `limit`, `search`, `severity`, `status` for pain points list
- 404: topic detail returns 404 for `id === 'unknown'`

## Generated code (do not edit)

- `apps/web-admin/src/routeTree.gen.ts` — auto-generated by TanStack Router
- `packages/api-client/src/generated-types/` — auto-generated by `ts-rs` via `just generate-types`
- `apps/backend/src/seeds/generated_passwords.json` — gitignored, checked by Biome (ignore formatting warnings)
- `apps/backend/bindings/` — auto-generated by `ts-rs`, excluded from Biome via `"!**/bindings/**"` in `biome.json`

## Skills (project-level)

All installed in `.opencode/skills/` (manually copied from `.agents/skills/` — `npx skills add` puts them in `.agents/skills/` regardless of `-a opencode` flag):

| Skill | Source |
|---|---|
| `shadcn` | shadcn/ui |
| `frontend-design` | anthropics/skills |
| `tanstack-query` | secondsky/claude-skills |
| `tanstack-router` | secondsky/claude-skills |
| `tailwind-v4-shadcn` | secondsky/claude-skills |
