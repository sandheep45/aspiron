# Aspiron

Student-first learning and productivity platform for competitive exam preparation (State PGT, JEE, NEET).

## Overview

Aspiron is built around the belief that **systems beat motivation**. The platform provides structured learning paths, AI-assisted recall, and community support to help students achieve their exam goals.

### Core Philosophy

- **Student-First Design**: Every feature is designed for the student's actual experience, not administrative convenience
- **Systems Over Motivation**: Build habits and structures that work regardless of daily motivation
- **Context Persistence**: The platform remembers where the student is in their preparation journey
- **Recall-Focused Learning**: Spaced repetition and memory-aware features to maximize retention

## Tech Stack

### Backend (Rust)

| Component | Technology |
|-----------|------------|
| **Framework** | Axum 0.8 |
| **ORM** | SeaORM 1.1 |
| **Database** | PostgreSQL 16+ |
| **Migrations** | SeaORM Migrations |
| **Authentication** | JWT (access + refresh tokens, cookie & bearer) |
| **Password Hashing** | bcrypt |
| **Seeding** | Custom CLI with progress tracking |
| **Async Runtime** | tokio |
| **Logging** | tracing + telemetry |
| **API Documentation** | utoipa (OpenAPI 3.0 + Swagger UI) |
| **Type Generation** | ts-rs (Rust DTOs → TypeScript) |
| **Search** | Meilisearch |

### Frontend — Web Admin (React + TypeScript)

| Component | Technology |
|-----------|------------|
| **Framework** | React 19 with React Start (SSR) |
| **Routing** | TanStack Router (file-based, auto-generated route tree) |
| **Server State** | TanStack Query (with SSR integration) |
| **Forms** | TanStack React Form + Zod (runtime validation) |
| **Styling** | Tailwind CSS v4 (`@import 'tailwindcss'`, `oklch()` colors, `@theme inline`) |
| **UI Components** | shadcn/ui (`base-mira` style), Base UI, Radix UI |
| **Icons** | lucide-react |
| **Auth** | Auth.js with credentials provider + JWT cookies |
| **Theme** | Dark/Light mode via next-themes |
| **React Compiler** | Enabled via babel-plugin-react-compiler |
| **Build Tool** | Vite 7 (rolldown-vite) |
| **SSR** | TanStack React Start (`@tanstack/react-start`) |

### Frontend — Documentation Site (SvelteKit)

| Component | Technology |
|-----------|------------|
| **Framework** | SvelteKit 5 |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Skeleton UI |
| **Markdown** | mdsvex with Shiki syntax highlighting |
| **Search** | Meilisearch + Fuse.js |
| **Content** | 26 documentation pages |

### Mobile (React Native + Expo)

| Component | Technology |
|-----------|------------|
| **Framework** | Expo 54+ |
| **Navigation** | Expo Router 6+ |
| **Styling** | NativeWind (Tailwind for React Native) |
| **Platform** | iOS, Android, Web |
| **Development** | Expo Go + Development Build |

### Packages

| Package | Purpose |
|---------|---------|
| `@aspiron/config` | Shared env config (type-safe via `@t3-oss/env-core` + Zod) |
| `@aspiron/api-client` | Axios-based HTTP API client |
| `@aspiron/tanstack-client` | TanStack Query hooks wrapping API client |
| `@aspiron/test-utils` | Internal test factories and utilities |

## Project Structure

```
aspiron/
├── Cargo.toml                      # Rust workspace (apps/backend, apps/migrations)
├── package.json                    # pnpm workspace root
├── pnpm-workspace.yaml             # pnpm monorepo config
├── Justfile                        # Task runner (just)
├── biome.json                      # Biome lint/format config
├── docker-compose.yml              # PostgreSQL, Meilisearch, pgAdmin, LocalStack
├── .env.example                    # Environment template
├── AGENTS.md                       # Agent instructions
├── IMPLEMENTATION_PLAN.md          # Detailed implementation plan
├── IMROVEMENTS_PLAN.md             # Improvement tracking
│
├── apps/
│   ├── backend/                    # Rust API server (Axum)
│   │   ├── src/
│   │   │   ├── main.rs
│   │   │   ├── lib.rs
│   │   │   ├── setup/              # App config, error handling, telemetry, OpenAPI, CLI
│   │   │   ├── http/               # Web layer
│   │   │   │   ├── handlers/       # Axum handlers (auth, content, assessment, learning, ...)
│   │   │   │   ├── routes/         # Route registration (api_v1_router)
│   │   │   │   ├── payloads/       # Request DTOs
│   │   │   │   ├── responses/      # Response DTOs
│   │   │   │   └── middleware/     # Axum middleware (client-type validation)
│   │   │   ├── application/        # Use cases / business orchestration (9 domains)
│   │   │   ├── domain/             # Domain models and logic (9 domains)
│   │   │   ├── infra/              # Infrastructure
│   │   │   │   ├── auth/           # JWT service, password hashing, user auth
│   │   │   │   └── db/repositories/ # SeaORM repositories (9 domains)
│   │   │   ├── entries/            # SeaORM entities + database enums
│   │   │   ├── middleware/         # Auth middleware (AuthUser extractor)
│   │   │   ├── seeds/              # Database seeding CLI
│   │   │   └── constants/          # App-wide constants
│   │   ├── tests/
│   │   │   ├── harness.rs          # TestApp with testcontainers Postgres
│   │   │   ├── fixtures/           # Test helpers + scenario builder
│   │   │   ├── unit/               # 33 unit tests (permissions, JWT, snapshots)
│   │   │   ├── integration/        # 17 integration tests (auth, routes)
│   │   │   └── scenarios/          # 9 scenario tests (onboarding, quizzes, content)
│   │   └── Cargo.toml
│   │
│   ├── migrations/                 # SeaORM database migrations
│   │   └── src/entities/migration/ # 16 migration files (enums → user profiles)
│   │
│   ├── web-admin/                  # React admin dashboard (TanStack Router)
│   │   ├── src/
│   │   │   ├── routes/             # File-based routes (auth, dashboard, content, ...)
│   │   │   ├── features/           # Feature modules (auth, dashboard)
│   │   │   ├── components/ui/      # shadcn/ui components (45+ components)
│   │   │   ├── components/forms/   # Form field components (TanStack React Form)
│   │   │   ├── lib/                # Utilities (cn(), auth helpers)
│   │   │   ├── hooks/              # Shared hooks
│   │   │   └── styles.css          # Tailwind v4 + shadcn/ui theme
│   │   ├── e2e/                    # Playwright E2E tests
│   │   └── Cargo.toml
│   │
│   ├── documentation/              # SvelteKit documentation site
│   │   └── src/lib/docs/           # 26 Markdown doc pages
│   │
│   └── mobile-student/             # React Native Expo mobile app
│       └── app/                    # Expo Router app directory
│
└── packages/
    ├── config/                     # @aspiron/config — shared env config
    ├── api-client/                 # @aspiron/api-client — Axios API client
    ├── tanstack-client/            # @aspiron/tanstack-client — TanStack Query hooks
    └── test-utils/                 # @aspiron/test-utils — test factories
```

## Features

### Learning Modules

- **Video Learning**: Playback controls, bookmarks, timestamps, transcripts
- **Live Classes**: Scheduled sessions, chat, AI-generated summaries
- **Teacher Notes**: PDF viewer, offline access, structured organization
- **Student Notes**: Personal annotations synced to video timestamps
- **Notes Sharing**: Privacy controls (private/peer/shared/public)

### Assessment

- **Practice Quizzes**: MCQs, numericals, detailed solutions
- **Tests & Mock Exams**: Chapter, section, and full mock exams
- **AI Proctoring**: Soft proctoring with focus scores (no cameras)

### AI Features

- **Context-Aware AI Chat**: Global assistant aware of exam/subject context
- **AI Recall Check**: Memory-aware revision system (key feature)
- **Revision Mode**: Focus on wrong questions, formula review
- **Test Analysis**: Post-test summaries, improvement plans

### Community

- **Peer Forum**: Structured doubt resolution threads
- **Community Bot**: Virtual tutor, emotional support
- **Smart Notifications**: Ethical nudges, recall reminders

### Safety

- **Exam Integrity**: AI disable toggle, copy/paste blocking during tests

## Documentation

The project includes comprehensive documentation at `/docs` via the SvelteKit documentation app:

### Introduction

- [Introduction](/docs/intro) — Platform overview, problem statement, core philosophy
- [MVP Scope](/docs/mvp-scope) — What's included/excluded, 1-year roadmap
- [Student Journey](/docs/student-journey) — Day 1 onboarding, daily flows, revision
- [Design Philosophy](/docs/design-philosophy) — Student-first principles
- [Roadmap](/docs/roadmap) — 5-phase plan (Now → Month 12)

### Core Concepts

- [Core Concepts](/docs/core-concepts) — Architecture overview
- [Context Layer](/docs/context-layer) — Exam/subject/target year persistence
- [Learning Structure](/docs/learning-structure) — Subject → Chapter → Topic hierarchy
- [Notes System](/docs/notes-system) — Teacher/student notes architecture
- [Progress Tracking](/docs/progress-tracking) — Student and teacher views

### Learning

- [Video Learning](/docs/video-learning)
- [Live Classes](/docs/live-classes)
- [Teacher Notes](/docs/teacher-notes)
- [Student Notes](/docs/student-notes)
- [Notes Sharing](/docs/notes-sharing)

### Assessment

- [Practice Quizzes](/docs/practice-quizzes)
- [Tests & Mock Exams](/docs/tests-mock-exams)
- [AI Proctoring](/docs/ai-proctoring)

### AI Features

- [Context AI Chat](/docs/context-ai-chat)
- [AI Recall Check](/docs/ai-recall-check)
- [Revision Mode](/docs/revision-mode)
- [Test Analysis](/docs/test-analysis)

### Community

- [Peer Forum](/docs/peer-forum)
- [Community Bot](/docs/community-bot)
- [Notifications](/docs/notifications)

### Safety

- [Exam Integrity](/docs/exam-integrity)

## Development

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Rust** | 1.75+ | Backend runtime |
| **Node.js** | 20+ | Frontend toolchain |
| **pnpm** | 9+ (use 10.28) | Package manager |
| **Just** | — | Task runner |
| **Docker & Docker Compose** | — | PostgreSQL, Meilisearch, pgAdmin, LocalStack |

#### Installation

```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Node.js (using fnm)
curl -fsSL https://fnm.vercel.app/install | bash
fnm install 20 && fnm use 20

# pnpm
npm install -g pnpm@latest

# Just (Ubuntu/Debian)
sudo apt install just

# Start Docker services
docker compose up -d
```

### Setup

```bash
# One-command setup (generates SSL certs, installs deps, migrates + seeds DB)
just setup

# Or manually:
pnpm install
cp .env.example .env
just build-packages    # Builds config → api-client → tanstack-client
just migrate            # Run database migrations
just seed               # Seed development data

# Start development servers
just dev                # Runs backend + documentation + mobile in parallel
just dev-js web-admin   # Admin dashboard only (port 3000)
just run-rust backend   # Rust backend only (port 8082)
```

### Key Commands

```bash
# Build everything
just build

# Run all tests
just test

# Type generation (Rust DTOs → TypeScript)
just generate-types

# OpenAPI spec
just generate-openapi    # Generate
just validate-openapi    # Validate against schema

# Contract coverage (routes vs tests vs OpenAPI)
just contract-coverage

# Database
just migrate             # Apply migrations
just fresh-db            # Reset + migrate + seed
just seed                # Seed all data

# Pre-commit CI (format → lint → build-all → check → validate-openapi)
just ci

# Tiered CI lanes
just ci-fast             # < 3 min (format, lint, unit tests, typecheck)
just ci-medium           # < 10 min (integration + scenario tests)
just ci-slow             # Full suite (all tests + e2e)

# Package builds (in dependency order)
just build-packages      # config → api-client → tanstack-client
```

### Running Tests

```bash
# All tests
just test

# Backend
cargo test -p backend --lib unit::          # Unit tests
cargo test -p backend --test integration    # Integration tests
cargo test -p backend --test scenarios      # Scenario tests

# Frontend
pnpm --filter web-admin exec vitest run

# E2E (requires dev server running)
pnpm --filter web-admin exec playwright test

# Frontend + backend in parallel
just test
```

## Testing Infrastructure

### Rust Tests (`apps/backend/`)

| Kind | Framework | What |
|------|-----------|------|
| **Unit** | `#[test]` / `#[tokio::test]` | Pure logic: JWT encoding/decoding, permission name parsing, scoring calculations |
| **Snapshot** | `insta` (`assert_json_snapshot!`) | Validates full OpenAPI spec and error response shapes against committed snapshots |
| **Integration** | `TestApp` harness + testcontainers | Full HTTP requests through Axum router against ephemeral Postgres: auth middleware, route responses, client-type enforcement |
| **Scenario** | `ScenarioBuilder` fluent builder | Multi-step user journeys: student onboarding, teacher content upload, quiz lifecycle |
| **Type generation** | `ts-rs` derive | Side-effect of `cargo test` — generates `.ts` bindings from Rust DTOs |
| **Contract** | Shell script | Validates OpenAPI spec is up-to-date, checks `ROUTE_REGISTRY` for coverage gaps |

**Harness:** `TestApp` — spins a real Postgres via testcontainers, runs SeaORM migrations, builds full Axum router per test. Auto-rollback via transactions.

### JS/TS Vitest Tests

| Kind | Framework | What |
|------|-----------|------|
| **Component (render)** | `@testing-library/react` + `vitest` | UI components with mocked TanStack hooks. Tests loading/error/empty/success states per component. Mocks `@aspiron/tanstack-client` hooks and `@tanstack/react-router` |
| **Component (interaction)** | `userEvent` + `vitest` | Click retry, navigate via Link, fill forms (limited) |
| **Keyboard shortcut** | `userEvent.keyboard` + `vitest` | `g+d` → dashboard, `Ctrl+K` opens palette, `?` toggles cheat sheet |
| **Utility** | `vitest` | `cn()` class merging, `formatRelativeTime()`, `formatPercentage()` |
| **Factory/DTO** | `vitest` | Test-utils factories: `buildQuizResponse`, `buildSubjectDto`, etc. — verifies defaults + overrides |
| **MSW verification** | `vitest` + MSW | Confirms MSW intercepts all API endpoints and handlers reset correctly between tests |

**Mocking layers:**
- **Hook-level:** `vi.mock('@aspiron/tanstack-client')` — return controlled `{ data, isLoading, isError }` states
- **API-level:** MSW (Mock Service Worker) — 12 handler files covering all API domains, auto-started in setup

### Playwright E2E Tests

| Kind | Project | What |
|------|---------|------|
| **MSW-mocked E2E** | `unit-msw` | Dashboard sections, runtime states (skeleton/error/retry), mobile layout — no backend needed |
| **Real API E2E** | `real-api` | Full stack against real backend + Postgres. Seeds deterministic test data. Tests login, dashboard widgets, content navigation, visual regression (screenshot diff < 5%) |
| **Visual regression** | `real-api` | Screenshot comparison of full dashboard |

**Infrastructure:** Playwright `globalSetup` seeds Postgres via raw SQL, `globalTeardown` cleans up. `loginAsE2eStudent()` helper handles real auth flow.

### Test Data Generation

| Layer | Tools |
|-------|-------|
| **Rust fixtures** | `helpers.rs` (8 functions), `ScenarioBuilder` fluent builder, direct SeaORM inserts |
| **JS factories** | `@aspiron/test-utils` package — `build<Type>Dto(overrides?)` with auto-incrementing IDs, covers content/quiz/student/community/live/notes/notification domains |
| **MSW handlers** | 12 handler files returning factory-generated mock responses |
| **E2E seed** | Raw SQL inserts with deterministic UUIDs (1 user, 3 topics, 3 live sessions, 2 quizzes, etc.) |

### Testing Tools (all installed)

| Tool | Status |
|------|--------|
| `cargo test` | Active |
| `insta` (snapshots) | Active — 6 snapshots |
| `testcontainers` | Active — Postgres per test |
| `vitest` | Active — 18 files, ~137 tests |
| `@testing-library/react` | Active |
| `@testing-library/user-event` | Active |
| `msw` | Active — 12 handler files |
| `@playwright/test` | Active — 14 spec files |
| `wiremock` | Installed, unused |
| `rstest` | Installed, unused |
| `bcryptjs` + `pg` | Active — E2E seed |

### Generating TypeScript Types from Rust

```bash
just generate-types
```

This runs `cargo test` (which triggers ts-rs codegen), copies output from `apps/backend/bindings/` to `packages/api-client/src/generated-types/`, converts relative imports to absolute (`@/generated-types/`), generates a barrel `index.ts`, and formats.

## Database Architecture

### Docker Services

| Service | Port | Purpose |
|---------|------|---------|
| **PostgreSQL** | `5432` | Primary database |
| **Meilisearch** | `7700` | Full-text search engine |
| **pgAdmin** | `8080` | Database admin UI |
| **LocalStack** | `4566` | AWS service emulation (S3, SQS, etc.) |

### Entity System

Entities are organized into 7 logical domains:

- **Auth**: Users, sessions, profiles
- **Content**: Subject → Chapter → Topic → Video hierarchy
- **Learning**: Progress tracking, notes, recall sessions
- **Assessment**: Quizzes, questions, attempts
- **Community**: Threads, posts, bot interactions
- **Live**: Sessions and recordings
- **Notifications**: Events and delivery logs

### Migration Files (16 total)

```
m20260120_00000_create_enums.rs
m20260120_00001_create_auth_tables.rs
m20260120_00002_create_content_tables.rs
m20260120_00003_create_learning_tables.rs
m20260120_00004_create_assessment_tables.rs
m20260120_00005_create_community_tables.rs
m20260120_00006_create_live_tables.rs
m20260120_00007_create_notification_tables.rs
m20260120_00008_create_rbac_enums.rs
m20260120_00009_create_roles_table.rs
m20260120_00010_create_permissions_table.rs
m20260120_00011_create_role_permissions_table.rs
m20260120_00012_create_user_roles_table.rs
m20260120_00013_create_audit_logs_table.rs
m20260120_00014_create_resource_permissions_table.rs
m20260120_00015_create_user_sessions_table.rs
m20260120_00016_create_user_profiles_table.rs
```

## Backend Architecture

### Clean Architecture (Domain-Driven)

Each backend domain follows a layered pattern:

```
http/handlers/    →  application/   →  infra/db/repositories/
(Axum handlers)     (use cases)        (data access)
```

- **HTTP Layer** (`http/`): Axum route registration, request parsing, response serialization
- **Application Layer** (`application/`): Business logic orchestration, no HTTP or DB dependencies
- **Domain Layer** (`domain/`): Pure domain models and logic (no framework dependencies)
- **Infrastructure Layer** (`infra/`): JWT service, password hashing, SeaORM repositories

Route registration follows a merge pattern:

```rust
pub fn api_v1_router() -> Router<AppState> {
    Router::new()
        .merge(health::router())
        .merge(auth::router())
        .merge(users::router())
        .merge(content::router())
        .merge(assessment::router())
        .merge(community::router())
        .merge(learning::router())
        .merge(live_session::router())
        .merge(notification::router())
        .merge(insights::router())
}
```

All 42+ routes are manually tracked via `ROUTE_REGISTRY`.

### OpenAPI Documentation

The backend uses [utoipa](https://github.com/juhaku/utoipa) to generate OpenAPI 3.0 specifications.

| Endpoint | Description |
|----------|-------------|
| `/api-docs/openapi.json` | OpenAPI 3.0 specification |
| `/swagger/index.html` | Swagger UI |

### Authentication

JWT-based with two token types:
- **Access token** (default 24h): Stored in `jwt` HTTP-only cookie (web) or response body (mobile)
- **Refresh token** (default 7d): Stored in `jwt_refresh` HTTP-only cookie

Mobile clients are detected via `x-client-type: mobile` header and receive tokens in the response body.

### Environment Variables

```bash
# Server
APP_HOST=0.0.0.0
APP_PORT=8082
APP_ENV=development

# Auth
AUTH_SECRET=your-secret-key-here-min-32-chars-long
AUTH_URL=http://localhost:3000/api/auth

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=mint_ts
DATABASE_POOL_SIZE=10

# JWT
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_ACCESS_TOKEN_EXPIRY_SECONDS=86400
JWT_REFRESH_TOKEN_EXPIRY_SECONDS=604800
JWT_COOKIE_NAME=jwt

# CORS
CORS_ORIGINS=http://localhost:3000,http://local.aspiron.test:8082,...

# Backend URL (used by frontend)
PUBLIC_BACKEND_URL=https://local.aspiron.test:8443
PUBLIC_ACTIVE_API_VERSION=/api/v1

# Meilisearch
MEILI_MASTER_KEY=your-secret-master-key-minimum-16-characters
MEILI_HOST=http://localhost:7700
MEILI_INDEX_ENABLED=false

# Logging
LOG_LEVEL=info,sea_orm::query=debug,sqlx::query=debug
LOG_FORMAT=pretty

# Seeding
SEED_PASSWORD_STRATEGY=fixed
```

## CI

Pre-commit checks run automatically via **husky** + **lint-staged** (`just ci`):

```
format (cargo fmt + biome lint --write --unsafe)
→ lint (cargo clippy -D warnings + biome lint)
→ build (cargo build + pnpm build)
→ check (cargo check + biome check)
→ validate-openapi
```

Three-tier CI lanes for different cadences:

| Lane | Command | Target | What runs |
|------|---------|--------|-----------|
| Fast | `just ci-fast` | < 3 min | fmt check, clippy, unit tests, biome check, vitest, type generation diff |
| Medium | `just ci-medium` | < 10 min | Integration tests, scenario tests |
| Slow | `just ci-slow` | Nightly | Full vitest, Playwright E2E, all cargo tests |

Contract coverage metrics to track route vs test vs OpenAPI alignment:
```bash
just contract-coverage
```

## Code Style

### Backend (Rust)
- **Linting**: Clippy with strict denies (`unwrap_used`, `expect_used`, `panic`, `todo`, `dbg_macro`, `print_stdout`, `print_stderr`)
- **Formatting**: rustfmt

### Frontend (web-admin)
- **Linting + Formatting**: Biome (single quotes, trailing commas, 80 char width)
- **TypeScript**: Strict mode enabled
- **Import rule**: All local imports must use `@/` absolute paths (no relative imports in hand-authored code)

### Frontend (documentation)
- **Linting**: Svelte-Check
- **Formatting**: Prettier

### Mobile (mobile-student)
- **Formatting**: Prettier with Tailwind plugin

## Implementation Status

### Phase A: Test Infrastructure — ✅ Complete
- [x] Backend test harness with testcontainers Postgres
- [x] Integration test framework (tower `ServiceExt::oneshot`)
- [x] Scenario builder (fluent API for multi-step workflows)
- [x] Frontend vitest setup (jsdom, 10 test files)
- [x] MSW handler infrastructure
- [x] OpenAPI contract enforcement + snapshot testing (insta)

### Phase B: Scenario & Unit Tests — ✅ Complete
- [x] Permission parsing (17 unit tests)
- [x] JWT round-trip (10 unit tests)
- [x] Error response shape snapshots (5 insta snapshots)
- [x] OpenAPI spec snapshot (1582 lines)
- [x] Integration tests: auth, routes, pagination (17 tests)
- [x] Scenario tests: onboarding, quiz lifecycle, content upload (9 tests)
- [ ] 4 scenario tests blocked on real handler implementations (daily revision, recall session, note sharing, permission evolution)

### Phase C: Backend Clean Architecture — ✅ Complete
- [x] All 9 domains migrated: auth, assessment, content, learning, community, notification, insights, live_session, users
- [x] Old `services/` directory fully removed
- [x] Layered pattern: `http/handlers/` → `application/` → `domain/` → `infra/db/repositories/`
- [x] DRY/SOLID cleanup: Permission FromStr derive, PaginationPayload dedup, encode_token consolidation
- [x] Clippy-clean with strict denies

### Phase D: Frontend Architecture — ✅ Complete
- [x] Feature-based reorg (auth, dashboard)
- [x] Zod adapter layer for runtime validation
- [x] MSW handlers for 40+ endpoints
- [x] TanStack React Form integration
- [x] Component tests (10 files, 60 tests)
- [x] Sidebar split (727 lines → 6 focused files)
- [x] Field extraction, action-required registry, barrel exports

### Phase E: CI Architecture — ✅ Partial
- [x] `just ci` with husky + lint-staged (pre-commit)
- [x] Tiered CI lanes: `ci-fast`, `ci-medium`, `ci-slow`
- [x] Playwright E2E installed + 3 critical tests
- [x] Contract coverage metrics script
- [ ] 10-15 Playwright E2E flows — deferred (waiting on real dashboard/content pages)
- [ ] GitHub Actions workflow — deferred

### Phases 1-3: Frontend Dashboard & Core Routes — ⏳ Not Started
- Dashboard modules (Pain Points, Upcoming Classes, System Health, Notifications)
- Content, Quiz, Live Class, Community, Analytics, Settings pages
- Search, filtering, mobile, accessibility, keyboard shortcuts

### AI Features — ⏳ Not Started
- Context-aware chat service
- Recall check algorithm
- Test analysis generation
- Community bot

## License

MIT
