# Aspiron — Agent Guide

## Agent behavior

- **Never commit code without asking first.** Stage changes and wait for explicit approval.

## Context sources

- `README*` files contain project overview, architecture, and setup docs — read first when onboarding.
- This file (`AGENTS.md`) is loaded as system context at every session start — keep it updated with high-signal repo facts.
- `.opencode/instructions/` contains detailed conventions per concern (frontend, backend, API client, forms, testing).
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

## Test infrastructure

- Test harness: `apps/backend/tests/harness.rs` — `TestApp` with testcontainers Postgres + SeaORM migrator + `tower::ServiceExt::oneshot`
- Scenario builder: `apps/backend/tests/fixtures/scenario_builder.rs` — fluent API for multi-user, content hierarchy, quiz, recall session
- 8 helper functions in `tests/fixtures/helpers.rs` — `create_test_user`, `create_test_subject/chapter/topic/quiz/questions/recall_session/recall_answer`
- `ensure_role_exists()` in helpers auto-creates Student/Teacher/Admin roles if missing
- `extract_jwt_cookie()` and `extract_cookies()` in harness for cookie-based auth tests
- Snapshot testing via `insta` (v1.47+): 6 snapshots in `tests/unit/snapshots/` — OpenAPI spec (1582 lines) + 5 error response shapes (VALIDATION, AUTH, ACCESS_TOKEN_EXPIRED, NOT_FOUND, INTERNAL). Run `cargo insta review` or `cargo insta accept` after intentional API changes.
- `request_id` field stripped from error snapshots via redaction (non-deterministic UUID)
- All 190 tests pass (107 ts-rs bindings + 8 harness + 25 integration + 17 scenarios/mod + 33 unit), clippy clean

### Phase B.3 unit tests completed

| File | Tests | Coverage |
|---|---|---|
| `tests/unit/permissions.rs` | 17 | Permission name parsing (all resources, actions, ownership), error handling |
| `tests/unit/jwt.rs` | 10 | Token round-trip, expiry, invalid tokens, wrong secret, expired tokens |
| `tests/unit/openapi_snapshot.rs` | 1 | OpenAPI spec snapshot (1582 lines) — catches unintended API contract changes |
| `tests/unit/error_snapshot.rs` | 5 | Error response shape snapshots (VALIDATION, AUTH, ACCESS_TOKEN_EXPIRED, NOT_FOUND, INTERNAL) |

### Blocked unit tests (waiting on real implementations)

| Planned file | Depends on |
|---|---|
| `tests/unit/scoring.rs` | Assessment scoring/grading logic (currently all stubs) |
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
