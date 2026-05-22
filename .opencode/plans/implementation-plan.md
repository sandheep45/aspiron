# Aspiron — Implementation Plan

> **Source of truth** for the full testing system and architecture evolution.
> All phases, file structures, patterns, and dependencies are documented here.

---

## Current State Summary

| Area | Status |
|---|---|
| Backend tests | **Zero** (dev deps installed but unused) |
| Frontend tests | **Zero** (vitest + testing-library installed, no config) |
| API client | Exists, 78 generated types, 3 services |
| TanStack hooks | Exists, 3 domains covered |
| OpenAPI | utoipa configured, paths manually maintained |
| Backend structure | `entries/routes/services/middleware/setup` — functional but mixed concerns |
| Frontend structure | Partial feature modules (auth, dashboard), mostly placeholder routes |
| Monorepo | pnpm workspace, 3 packages (`config`, `api-client`, `tanstack-client`) |

---

## Critical Design Decisions

These principles govern every phase:

### 1. Domain ≠ Persistence

SeaORM entities are DB-shaped. Domain models are business-shaped. They must be separate with explicit mapping between them.

### 2. DTOs ≠ Domain

DTOs evolve with the API. Domain evolves with business rules. They must not be coupled.

### 3. Ports First

Application layer defines traits (ports). Infra layer implements them (adapters). This enables testing, mocking, and infra replacement.

### 4. Test Infra Before Refactor

Build the safety net first. Then refactor underneath it. Never refactor without tests protecting the behavior.

### 5. No Generic Repository Abstractions

Explicit, per-domain repositories with named query methods. No `FilterBuilder`, no generic CRUD wrappers.

### 6. Split Domain Modules Early

Each domain gets its own file per concern. No monolithic `models.rs`.

### 7. SeaORM Migrator Directly in Tests

Tests use `Migrator::up(&db, None).await` — never shell out to `just migrate`. Pure Rust, self-contained, deterministic, CI-friendly.

### 8. Tower ServiceExt for Test Client

Use `tower::ServiceExt::oneshot` with `axum::body::Body` and `http::Request` — not `httpc-test`. Tests exercise actual router, middleware, extractors, auth, serialization, error handling.

### 9. Per-Suite DB, Per-Test Transaction

One postgres container per test suite. Per-test: `BEGIN` → run test → `ROLLBACK`. Dramatically faster than container-per-test. Full isolated DB only for migration tests, concurrency tests, CI edge cases.

### 10. Modularity — Module Boundaries as API Contracts

Every module (domain, feature, package) has a well-defined public API surface. Internal details are private. Modules communicate only through their public interfaces — never by reaching into internals. This means:

- **Rust modules:** Use `pub(crate)` and `pub(super)` intentionally. Only the handler/route registration is `pub` at the top level. Services, repositories, and state are `pub(crate)`.
- **Feature modules (frontend):** Each `features/<name>/` exports only a barrel `index.ts`. No external code imports from `features/<name>/components/` directly — only through `features/<name>/`.
- **Package boundaries:** `@aspiron/tanstack-client` never imports from `apps/web-admin`. `@aspiron/api-client` never imports from `@aspiron/tanstack-client`. Dependency direction is strictly: `web-admin → tanstack-client → api-client`.
- **No circular dependencies:** Between any two modules, dependency must flow in one direction only. A `cargo` or `Madge` check must pass before merging.
- **Layered dependency rule:** In the backend: `http → application → domain ← infra` (domain knows nothing about infra). No skipping layers.

---

## Definition of Done

A task is considered complete **only when**:

- Implementation exists (not stubs, not placeholders)
- Compilation succeeds
- Relevant tests pass
- Behavior is verified through execution
- Contracts remain valid
- No placeholder logic remains
- No failing checks remain

**Code generation alone is NOT completion.**

---

## Execution & Verification Rules

The agent must **NEVER** mark a task, migration, refactor, or test step as complete without executing the relevant verification commands and confirming success.

Every implementation step must end with:
1. **Execution** — run the relevant verification commands
2. **Verification** — confirm output shows success
3. **Failure analysis** — if broken, read failures carefully
4. **Fix iteration** — fix the root cause
5. **Re-run verification** — confirm fix works

The agent must **remain on the same step** until verification passes. The agent must **never batch multiple unverified architectural steps together**.

### No Assumed Success

The agent must **never assume**:
- Compilation succeeded
- Migrations succeeded
- Tests passed
- Generated types updated correctly
- Routes are wired correctly

**All assumptions must be verified through execution.**

### No Placeholder Completion

A task is **not complete** if:
- `TODO` placeholders remain
- `unimplemented!()` remains
- `panic!("todo")` remains
- Mocked logic replaces required production behavior
- Tests are skipped without documented justification

### Negative Testing Requirement

For newly written tests, the agent must verify the test can fail correctly by temporarily breaking the implementation or assertion.

**A test that never demonstrates failure behavior is not considered trustworthy.**

---

## Verification Gates Per Activity

### 1. Backend Refactor Verification Gate

A backend migration step is **NOT complete** until:

- `cargo check` passes
- `cargo clippy` passes for touched modules
- All affected scenario tests pass
- All affected integration tests pass
- OpenAPI generation succeeds
- No old imports remain for migrated module
- No SeaORM types leak outside infra layer

### 2. Test Writing Verification Gate

A testing task is **NOT complete** until:

- The test executes successfully
- The test fails when behavior is intentionally broken (negative test)
- The test passes again after restoration
- Assertions are meaningful (not existence-only)
- No ignored/skipped tests exist unless documented

### 3. Frontend Verification Gate

A frontend implementation is **NOT complete** until:

- `pnpm typecheck` passes
- `vitest` passes for affected features
- Runtime rendering succeeds without console errors
- MSW handlers match actual request shapes
- TanStack query hooks execute successfully

### 4. Contract Verification Gate

An API change is **NOT complete** until:

- OpenAPI spec regenerates successfully
- Generated types are updated
- `git diff` for generated artifacts is clean
- Affected frontend consumers compile
- Contract tests pass

### 5. CI Verification Gate

CI-related work is **NOT complete** until:

- Workflows execute successfully locally (where possible)
- No step is marked TODO without issue tracking
- Fast lane runtime remains within target budget

---

## Verification Commands Per Phase

### Phase A.1 (Backend Harness)
```bash
cargo check --all-targets --all-features
cargo clippy --all-targets --all-features -- -D warnings
cargo test --test harness -- --nocapture
cargo test --test integration -- --nocapture
```

### Phase B (Scenario Tests)
```bash
cargo test --test scenarios -- --nocapture
cargo test --test integration -- --nocapture
cargo test --lib
cargo clippy --all-targets --all-features -- -D warnings
```

### Phase C (Backend Refactor)
```bash
cargo check --all-targets --all-features
cargo clippy --all-targets --all-features -- -D warnings
cargo test --test scenarios -- --nocapture
cargo test --test integration -- --nocapture
cargo test --lib
just generate-types
git diff --exit-code packages/api-client/src/generated-types/
```

### Phase D (Frontend)
```bash
pnpm typecheck
pnpm --filter web-admin exec vitest run
pnpm biome check .
```

### Phase E (CI)
```bash
just ci-fast
just ci-medium
just generate-openapi
just generate-types
git diff --exit-code
```

---

## Phase A: Test Infrastructure + Contract Enforcement

### Goal

Build the safety net FIRST. Before any architecture refactor, get tests, harnesses, and contract enforcement online. This protects every subsequent migration step.

### A.1 Backend Test Harness

**New directory:**
```
apps/backend/tests/
├── mod.rs                    # Test utilities, test state builder
├── harness.rs                # App harness: ephemeral DB, test client, seed helpers
├── unit/
│   ├── mod.rs
│   └── (algorithm tests, scoring, recall logic)
├── integration/
│   ├── mod.rs
│   └── (repository tests, auth middleware, route behavior)
├── scenarios/
│   ├── mod.rs
│   └── (workflow tests — see Phase B)
├── contracts/
│   ├── mod.rs
│   └── (OpenAPI contract validation)
└── fixtures/
    ├── mod.rs
    ├── student.rs            # create_test_student()
    ├── teacher.rs            # create_test_teacher()
    ├── quiz.rs               # create_test_quiz()
    ├── recall_session.rs     # create_test_recall_session()
    └── content.rs            # create_test_subject/chapter/topic()
```

**Cargo.toml changes:**
```toml
[dev-dependencies]
testcontainers = "0.23"
testcontainers-modules = { version = "0.11", features = ["postgres"] }
```

**Test Harness Pattern:**
```rust
// tests/harness.rs
use migration::{Migrator, MigratorTrait};
use tower::ServiceExt;

pub struct TestApp {
    pub db: DatabaseConnection,
    pub router: Router,
    pub _container: PostgresContainer,  // lives for suite duration
}

impl TestApp {
    /// One postgres container per test suite.
    /// Each test gets a transaction that rolls back.
    pub async fn new() -> Self {
        let postgres = Postgres::default().start().await.expect("failed to start postgres");
        let host = postgres.get_host().await.expect("failed to get host");
        let port = postgres.get_host_port_ipv4(5432).await.expect("failed to get port");

        let db_url = format!("postgres://postgres:postgres@{host}:{port}/test");
        let db = DatabaseConnection::connect(&db_url).await.expect("failed to connect");

        // Run migrations using SeaORM migrator directly
        Migrator::up(&db, None).await.expect("failed to run migrations");

        let router = create_test_router(&db).await;

        Self { db, router, _container: postgres }
    }

    /// Per-test transaction: BEGIN → test → ROLLBACK
    pub async fn transaction<F, Fut>(&self, test_fn: F)
    where
        F: FnOnce(DatabaseConnection, Router) -> Fut,
        Fut: Future<Output = ()>,
    {
        let txn = self.db.begin().await.expect("failed to begin transaction");
        let txn_db = DatabaseConnection::from(txn);

        test_fn(txn_db.clone(), self.router.clone()).await;

        // Rollback — drop the transaction
        let _ = txn.rollback().await;
    }

    /// Request helper using tower::ServiceExt::oneshot
    pub async fn request(&self, req: Request<Body>) -> Response<Body> {
        self.router.clone()
            .oneshot(req)
            .await
            .expect("request failed")
    }

    pub async fn seed_student(&self) -> StudentFixture { ... }
    pub async fn seed_teacher(&self) -> TeacherFixture { ... }
    pub async fn seed_quiz(&self, teacher_id: Uuid) -> QuizFixture { ... }
}
```

**Test Usage Pattern:**
```rust
use axum::{body::Body, http::{Request, StatusCode}};
use tower::ServiceExt;

#[tokio::test]
async fn health_endpoint_returns_ok() {
    let app = TestApp::new().await;

    app.transaction(|db, router| async move {
        let response = router
            .oneshot(
                Request::builder()
                    .method("GET")
                    .uri("/api/v1/health")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }).await;
}
```

**Reset Helper:**
```rust
pub async fn reset_database(db: &DatabaseConnection) {
    // Truncate all tables in test database
    sea_orm::Statement::from_string(
        sea_orm::DatabaseBackend::Postgres,
        "TRUNCATE TABLE users, user_profiles, user_roles, ... RESTART IDENTITY CASCADE",
    );
    db.execute(stmt).await.expect("failed to reset database");
}
```

### A.2 Frontend Test Setup

**New files:**
```
apps/web-admin/
├── vitest.config.ts          # Vitest config with jsdom, aliases
├── test/
│   └── setup.ts              # Testing-library setup, custom matchers, MSW
└── src/
    └── test-utils.tsx        # renderWithProviders(), mockQueryClient
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
```

**package.json additions:**
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "msw": "^2.7.0",
    "@mswjs/http-middleware": "^0.10.0"
  }
}
```

### A.3 Test Utils Package

**New package:**
```
packages/test-utils/
├── package.json              # @aspiron/test-utils
├── tsconfig.json
├── vitest.config.ts
└── src/
    ├── index.ts              # Barrel exports
    ├── factories/
    │   ├── index.ts
    │   ├── student.factory.ts
    │   ├── teacher.factory.ts
    │   ├── quiz.factory.ts
    │   ├── recall-session.factory.ts
    │   └── content.factory.ts
    ├── fixtures/
    │   ├── index.ts
    │   └── (deterministic test data constants)
    └── scenarios/
        ├── index.ts
        └── (shared scenario builders)
```

**Example factory:**
```typescript
// src/factories/student.factory.ts
import type { AuthUserResponse } from '@aspiron/api-client'

export function createStudent(overrides: Partial<AuthUserResponse> = {}): AuthUserResponse {
  return {
    id: crypto.randomUUID(),
    email: `student.${Date.now()}@test.aspiron.dev`,
    name: 'Test Student',
    user_type: 'student',
    roles: [],
    created_at: new Date(),
    ...overrides,
  }
}
```

**package.json:**
```json
{
  "name": "@aspiron/test-utils",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./factories": "./src/factories/index.ts"
  },
  "dependencies": {
    "@aspiron/api-client": "workspace:*"
  }
}
```

### A.4 MSW Setup (Mirrors OpenAPI)

**New files:**
```
apps/web-admin/
├── mock/
│   ├── browser.ts               # MSW browser worker
│   ├── handlers/
│   │   ├── index.ts             # All handlers
│   │   ├── auth.handlers.ts
│   │   ├── learning.handlers.ts
│   │   ├── assessment.handlers.ts
│   │   └── content.handlers.ts
│   └── factories/
│       ├── index.ts
│       ├── student.factory.ts   # Uses @aspiron/test-utils
│       ├── quiz.factory.ts
│       └── recall-session.factory.ts
```

**Pattern — Generated-type-aligned mocks:**
```typescript
// mock/factories/quiz.factory.ts
import type { AssessmentQuizResponse } from '@aspiron/api-client'
import { createQuiz as baseCreateQuiz } from '@aspiron/test-utils/factories'

export function createQuiz(overrides: Partial<AssessmentQuizResponse> = {}): AssessmentQuizResponse {
  return baseCreateQuiz(overrides)
}
```

### A.5 OpenAPI Contract Enforcement

**New files:**
```
apps/backend/
├── openapi/
│   └── openapi.json             # Generated spec (committed for diff checking)
└── scripts/
    └── validate-openapi.sh      # Validates openapi.json is not stale
```

**Contract check in CI:**
```bash
just generate-types
git diff --exit-code packages/api-client/src/generated-types/
pnpm biome check .
```

---

## Phase B: Scenario Tests on Current Architecture

### Goal

Write scenario tests against the CURRENT architecture. These become the safety net that protects the Phase C refactor.

### B.1 Scenario Builder Pattern

Avoid giant imperative setup blocks. Use fluent builders:

```rust
// tests/fixtures/scenario_builder.rs
pub struct ScenarioBuilder {
    db: DatabaseConnection,
    student: Option<StudentFixture>,
    topics: Vec<TopicFixture>,
    weak_areas: usize,
}

impl ScenarioBuilder {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db, student: None, topics: vec![], weak_areas: 0 }
    }

    pub async fn student(mut self) -> Self {
        self.student = Some(create_test_student(&self.db).await);
        self
    }

    pub async fn with_completed_topics(mut self, count: usize) -> Self {
        let student_id = self.student.as_ref().unwrap().id;
        self.topics = create_test_topics(&self.db, student_id, count).await;
        self
    }

    pub async fn with_weak_areas(mut self, count: usize) -> Self {
        self.weak_areas = count;
        self
    }

    pub async fn build(self) -> ScenarioContext {
        // Finalize all setup, return context
        ScenarioContext {
            student: self.student.unwrap(),
            topics: self.topics,
            weak_areas: self.weak_areas,
        }
    }
}
```

### B.2 Scenario Tests

**Files:**
```
apps/backend/tests/scenarios/
├── mod.rs
├── student_onboarding.rs          # Register → profile → first content access
├── daily_revision_workflow.rs     # Recall session → answer → weak areas → revision plan
├── quiz_attempt_lifecycle.rs      # Quiz → attempt → submit → grade → results
├── note_sharing_workflow.rs       # Create note → share → permission check → view
├── recall_session_completion.rs   # Full recall cycle with spaced repetition
├── teacher_content_upload.rs      # Teacher → create subject → chapter → topic → video
└── permission_evolution.rs        # Role change → permission check → access grant/deny
```

**Example — Daily Revision Workflow:**
```rust
// tests/scenarios/daily_revision_workflow.rs

#[tokio::test]
async fn complete_recall_session_generates_weak_areas() {
    let app = TestApp::new().await;

    let ctx = ScenarioBuilder::new(app.db.clone())
        .student()
        .with_completed_topics(5)
        .with_weak_areas(2)
        .build()
        .await;

    let session = app.create_recall_session(&ctx.student.id, &ctx.topics).await;

    app.submit_recall_answers(&session.id, &[
        (ctx.topics[0].id, true),
        (ctx.topics[1].id, false),
        (ctx.topics[2].id, true),
        (ctx.topics[3].id, false),
        (ctx.topics[4].id, true),
    ]).await;

    app.complete_recall_session(&session.id).await;

    let weak_areas = app.get_weak_areas(&ctx.student.id).await;
    assert_eq!(weak_areas.len(), 2);

    let plan = app.get_revision_plan(&ctx.student.id).await;
    assert!(plan.topics_to_review.contains(&ctx.topics[1].id));
    assert!(plan.topics_to_review.contains(&ctx.topics[3].id));
}
```

### B.3 Unit Tests

**Focus:** Pure business logic — no DB, no HTTP.

```
apps/backend/tests/unit/
├── mod.rs
├── scoring.rs                   # Quiz scoring algorithms
├── recall_algorithm.rs          # Spaced repetition calculations
├── progression.rs               # Topic completion → unlock logic
├── permissions.rs               # RBAC permission checks
└── notification_rules.rs        # When to trigger notifications
```

### B.4 Integration Tests

**Focus:** DB interactions, repositories, auth middleware, route behavior.

```
apps/backend/tests/integration/
├── mod.rs
├── auth_middleware.rs           # Token validation, expiry, refresh
├── repositories.rs              # CRUD with real DB
├── transactions.rs              # Transactional integrity
├── route_responses.rs           # HTTP status codes, response shapes
└── pagination.rs                # Pagination behavior across endpoints
```

### B.5 Snapshot Testing (Selective)

Useful for:
- OpenAPI output
- AI-generated prompts
- Revision plan generation
- Structured API responses

NOT useful for:
- Dynamic DB state
- UI snapshots everywhere

---

## Phase C: Backend Architecture Refactor

### Goal

Separate transport, domain, persistence, and orchestration into distinct layers. Protected by scenario tests from Phase B.

### C.1 New Directory Structure

**Current:**
```
apps/backend/src/
├── entries/          # entities, dtos, enums (mixed)
├── routes/           # route definitions + handlers mixed
├── services/         # handler + service + repository mixed
├── middleware/       # auth, client-type
├── setup/            # config, error, openapi, app
├── constants/
├── utils/
└── seeds/
```

**Target:**
```
apps/backend/src/
├── domain/                    # Business rules, models, invariants (NO ORM, NO DTOs)
│   ├── auth/
│   │   ├── mod.rs
│   │   ├── entities.rs        # Domain entities: Student, Teacher, User (business meaning)
│   │   ├── value_objects.rs   # Email, Password, JwtToken, etc.
│   │   ├── rules.rs           # Auth invariants (password rules, session rules)
│   │   ├── events.rs          # Domain events (UserRegistered, SessionCreated)
│   │   └── errors.rs          # Domain-specific errors
│   ├── learning/
│   │   ├── mod.rs
│   │   ├── entities.rs        # RecallSession, LearningProgress, WeakArea
│   │   ├── value_objects.rs   # RecallScore, ProgressPercentage, etc.
│   │   ├── rules.rs           # Spaced repetition rules, progression rules
│   │   ├── events.rs          # RecallCompleted, WeakAreaDetected
│   │   └── errors.rs
│   ├── assessment/
│   ├── content/
│   ├── community/
│   └── notifications/
│
├── application/               # Use cases, orchestration, workflows
│   ├── auth/
│   │   ├── mod.rs
│   │   ├── ports.rs           # trait UserRepository { ... }
│   │   ├── login.rs           # LoginUseCase
│   │   ├── register.rs        # RegisterUseCase
│   │   └── refresh_token.rs
│   ├── learning/
│   │   ├── mod.rs
│   │   ├── ports.rs           # trait RecallSessionRepository { ... }
│   │   ├── create_recall_session.rs
│   │   ├── submit_recall_answer.rs
│   │   └── generate_revision_plan.rs
│   ├── assessment/
│   │   ├── mod.rs
│   │   ├── ports.rs
│   │   ├── create_quiz.rs
│   │   ├── submit_attempt.rs
│   │   └── grade_attempt.rs
│   └── mod.rs
│
├── infra/                     # Implementation details (SeaORM, JWT, bcrypt, etc.)
│   ├── db/
│   │   ├── mod.rs
│   │   ├── connection.rs      # SeaORM connection setup
│   │   ├── entities/          # SeaORM models (DB-shaped, NOT domain models)
│   │   │   ├── user.rs
│   │   │   ├── learning_progress.rs
│   │   │   ├── recall_session.rs
│   │   │   └── ...
│   │   └── repositories/      # SeaORM implementations of application ports
│   │       ├── user_repo.rs   # impl UserRepository for SeaOrmUserRepository
│   │       ├── quiz_repo.rs
│   │       └── ...
│   ├── auth/
│   │   ├── mod.rs
│   │   ├── jwt.rs             # JWT encoding/decoding
│   │   └── password.rs        # bcrypt hashing
│   ├── cache/
│   ├── ai/
│   └── notifications/
│
├── http/                      # Transport layer (thin)
│   ├── payloads/              # Request DTOs (API-shaped)
│   │   ├── auth.rs
│   │   ├── learning.rs
│   │   └── ...
│   ├── responses/             # Response DTOs (API-shaped)
│   │   ├── auth.rs
│   │   ├── learning.rs
│   │   └── ...
│   ├── handlers/              # Thin: extract → call use case → map response
│   │   ├── auth.rs
│   │   ├── learning.rs
│   │   └── ...
│   ├── extractors/
│   │   ├── mod.rs
│   │   └── auth_user.rs       # AuthUser extractor
│   ├── middleware/
│   │   ├── mod.rs
│   │   ├── auth.rs
│   │   └── client_type.rs
│   └── routes/
│       ├── mod.rs
│       └── (router composition)
│
├── setup/                     # App bootstrap (kept as-is)
│   ├── mod.rs
│   ├── config.rs
│   ├── error.rs               # AppError (kept, enhanced)
│   ├── openapi.rs
│   ├── telemetry.rs
│   └── app.rs
│
├── constants/                 # Kept as-is
├── utils/                     # Kept as-is (or moved to infra/)
└── main.rs
```

### C.2 Migration Strategy

Each domain migrates in this order:

1. **Create domain entities** — business-meaning models in `domain/<name>/entities.rs`
2. **Create value objects** — typed primitives in `domain/<name>/value_objects.rs`
3. **Create domain rules** — invariants in `domain/<name>/rules.rs`
4. **Create ports** — traits in `application/<name>/ports.rs`
5. **Create SeaORM entities** — DB models in `infra/db/entities/`
6. **Create repositories** — impl ports in `infra/db/repositories/`
7. **Create use cases** — orchestration in `application/<name>/`
8. **Create HTTP payloads/responses** — DTOs in `http/payloads/` and `http/responses/`
9. **Thin handlers** — `http/handlers/` becomes: extract → call use case → map
10. **Update routes** — `http/routes/` merges routers
11. **Update OpenAPI** — update `setup/openapi.rs` paths
12. **Run scenario tests** — verify behavior unchanged

**Domain migration order:**
1. `auth` (simplest, well-understood)
2. `learning` (core product, recall sessions)
3. `assessment` (quiz lifecycle)
4. `content` (hierarchical, has stubs)
5. `community`
6. `notifications`
7. `insights` (admin)
8. `rbac` (currently stub)
9. `users`
10. `live_session`

### C.3 Key Patterns

**Domain Entity (business-shaped):**
```rust
// domain/auth/entities.rs
#[derive(Debug, Clone)]
pub struct Student {
    pub id: UserId,
    pub email: Email,
    pub name: String,
    pub exam_goal: ExamGoal,
    pub recall_profile: RecallProfile,
    pub progression_state: ProgressionState,
}
```

**SeaORM Entity (DB-shaped):**
```rust
// infra/db/entities/user.rs
#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "users")]
pub struct Model {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub user_type: UserTypeEnum,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
```

**Port (trait in application layer):**
```rust
// application/auth/ports.rs
#[async_trait]
pub trait UserRepository {
    async fn find_by_email(&self, email: &Email) -> Result<Option<User>, AppError>;
    async fn create(&self, user: User) -> Result<User, AppError>;
    async fn find_due_recall_topics(&self, student_id: UserId) -> Result<Vec<Topic>, AppError>;
}
```

**Repository Implementation (infra layer):**
```rust
// infra/db/repositories/user_repo.rs
pub struct SeaOrmUserRepository {
    db: Arc<DatabaseConnection>,
}

#[async_trait]
impl UserRepository for SeaOrmUserRepository {
    async fn find_by_email(&self, email: &Email) -> Result<Option<User>, AppError> {
        let orm_model = UserEntity::find()
            .filter(user::Column::Email.eq(email.as_str()))
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(orm_model.map(|m| map_orm_to_domain(m)))
    }
}
```

**Thin Handler:**
```rust
// http/handlers/auth.rs
pub async fn login(
    Extension(state): Extension<AuthState>,
    Json(payload): Json<LoginPayload>,
) -> Result<Json<LoginResponse>, AppError> {
    let use_case = LoginUseCase::new(state.user_repo.clone());
    let result = use_case.execute(payload.into()).await?;
    Ok(Json(map_to_login_response(result)))
}
```

**Application Use Case:**
```rust
// application/auth/login.rs
pub struct LoginUseCase<R: UserRepository> {
    user_repo: R,
}

impl<R: UserRepository> LoginUseCase<R> {
    pub async fn execute(&self, payload: LoginCommand) -> Result<LoginResult, AppError> {
        // 1. Validate credentials
        // 2. Check account status
        // 3. Create session
        // 4. Generate tokens
        // 5. Return result
    }
}
```

### C.4 What Gets Moved Where

| Current Location | New Location |
|---|---|
| `entries/entities/*.rs` | `infra/db/entities/*.rs` (SeaORM models) |
| `entries/entity_enums/*.rs` | `infra/db/entities/` or `domain/*/value_objects.rs` |
| `entries/dtos/response/*.rs` | `http/responses/*.rs` |
| `entries/dtos/payload/*.rs` | `http/payloads/*.rs` |
| `services/*/repository.rs` | `infra/db/repositories/*.rs` |
| `services/*/service.rs` | `application/*/` (as use cases) |
| `services/*/handler.rs` | `http/handlers/*.rs` (thinned) |
| `services/*/state.rs` | `application/*/mod.rs` (state structs) |
| `routes/*.rs` | `http/routes/*.rs` |
| `middleware/*.rs` | `http/middleware/*.rs` |
| `utils/jwt.rs` | `infra/auth/jwt.rs` |
| `setup/error.rs` | `setup/error.rs` (kept) |
| `setup/config.rs` | `setup/config.rs` (kept) |
| `setup/openapi.rs` | `setup/openapi.rs` (kept, paths updated) |
| `setup/app.rs` | `setup/app.rs` (kept) |

### C.5 Risk Mitigation

- **Scenario tests from Phase B run after each domain migration** — if they pass, migration is safe
- Keep old `services/` and `routes/` modules alive until all domains are migrated
- Use `#[allow(dead_code)]` temporarily on old modules during transition
- Final step: delete old directories, update `lib.rs`

### C.6 DRY/SOLID/Modularity Critical Design Integration

The Phase C refactor naturally addresses many DRY/SOLID violations (trait abstractions → DIP, domain separation → SRP, ports → OCP). Modularity is enforced through strict visibility and dependency rules. The following items must be verified during migration:

- **No new duplication:** Each domain migration step must check for duplicated code before accepting the migration
- **Trait-first:** Before writing any repository implementation, define the port trait
- **God method guard:** Any handler/service/repository method exceeding 60 lines must be reviewed for SRP violation
- **Generated file policy:** Never manually edit generated files; run `just generate-types` after DTO changes
- **Module boundary guard:** Every `pub` item must be justified — if it's not part of the module's public API, use `pub(crate)` or `pub(super)` instead
- **No cross-domain imports:** A module in `application/learning/` must not directly import from `infra/db/repositories/` — it must go through the port trait defined in `application/learning/ports.rs`
- **Dependency direction check:** After each domain migration, run `cargo check` and verify no circular dependencies exist between the new layered modules
- **Barrel export required:** Every feature module (backend and frontend) must have a `mod.rs` or `index.ts` barrel that defines the public API. External consumers import only from the barrel, never from internal paths.

---

## Phase C.7: DRY/SOLID/Modularity Remediation (Backend)

**Protected by:** Phase B scenario tests. All changes run against existing test suite.

**Goal:** Fix every high-to-medium severity DRY and SOLID violation discovered during the codebase audit.

### C.7.1 P0 — Safety & Correctness

| # | File | Violation | Fix |
|---|---|---|---|
| 1 | `services/assessment/quiz.rs`, `attempt.rs`, `services/learning/notes.rs`, `recall.rs`, `progress.rs`, `services/content/subject.rs`, `chapter.rs`, `video.rs`, `services/content/topic/mod.rs` | ~30 identical stub handlers (1,200+ lines dead code) | Delete orphan files; consolidate into `handler.rs` |
| 2 | `services/assessment/repository.rs:45,52`, `services/community/repository.rs:27`, `services/learning/repository.rs:51`, `services/notification/repository.rs:47` | `todo!()` in production — panics at runtime | Replace with `AppError::NotImplemented { feature: "..." }` |
| 3 | `services/rbac/mod.rs`, `roles.rs`, `permission.rs`, `role_permission.rs` | 4 empty files, compile but do nothing | Delete or stub with `AppError::NotImplemented` |

### C.7.2 P1 — High-Value Structural

| # | File | Violation | Fix |
|---|---|---|---|
| 4 | `utils/jwt.rs:20-40,42-62` | `encode_access_token` / `encode_refresh_token` byte-for-byte identical | Extract `fn encode_token()` |
| 5 | All `services/*/repository.rs` + `services/*/service.rs` | Zero trait abstractions → cannot mock, cannot swap repositories | Define `#[async_trait] pub trait XxxRepository` per domain; inject via constructor |
| 6a | All `services/*/mod.rs`, `services/*/handler.rs` | Over-broad `pub` visibility — internal helpers exposed as public API | Audit every `pub` item; use `pub(crate)` for module-internal symbols; only route registration and state constructors remain `pub` |
| 6b | `services/` — no barrel exports | Consumers import from arbitrary deep paths (`use crate::services::users::repository::UserRepository`) | Add `mod.rs` barrel for each domain; export only the public API surface (handler router, state, selected types) |
| 7 | `services/users/repository.rs:58-176` | `get_user_profile_by_id()` = 118-line god method (5 fetches + 5 mappings + business logic) | Split into `find_user`, `find_profile`, `find_roles`, `find_permissions`; compose in service |
| 8 | `services/insights/repository.rs:46-416` | Mixes data access + metrics calculation + DTO mapping | Split `InsightMetricsService` out; repo does queries only |
| 9 | `services/insights/service.rs:29-261` | 230-line methods with duplicated pagination/search/sort inline | Extract `paginate<T>()`, `apply_sort<T>()`, `apply_search<T>()` helpers |

### C.7.3 P2 — Open/Closed + Interface Segregation

| # | File | Violation | Fix |
|---|---|---|---|
| 10 | `services/users/utils/permission.rs:42-81` | 14/15-variant manual match duplicates `Display` impl | `#[derive(FromStr)]` on enums; remove manual parse |
| 11 | `setup/error.rs:72-88,136-191` | `ErrorCode::from` + `IntoResponse` — same variant mapping duplicated | Store `(StatusCode, &str)` as variant fields; dedupe |
| 12 | `services/insights/service.rs:63-102,212-233` | Match-on-variant for sort — new variant = modify match | Strategy pattern via `HashMap<SortBy, fn>` |
| 13 | `services/repository.rs:1-23` | `BaseRepository` fat trait (5 methods, unused) | Split into `ReadRepository`/`WriteRepository` or remove dead trait |
| 14 | `services/*/service.rs` (6 files) | Commented-out `// repository:` fields | Clean up dead comments |
| 15 | Cross-domain: `services/insights/repository.rs` imports from `entries/entities/` and other domains | No domain boundary enforcement — insights directly reaches into other domains' internals | Enforce that each layer (`application/*/`) only depends on its own ports and domain types; cross-domain communication goes through public handlers only |

### C.7.4 P3 — Boilerplate Reduction

| # | File | Violation | Fix |
|---|---|---|---|
| 16 | 8x `services/*/state.rs` | 16-line State structs with identical `#[derive(Clone)]` + `new(Arc<DatabaseConnection>)` | `state!` macro |
| 17 | `entries/dtos/payload/insights.rs:151-163,287-298` | Duplicated `get_page()`, `get_limit()`, `get_offset()` | `Paginable` trait with default impls |
| 18 | All repository files | Entity-to-DTO mapping via inline closure every time | `impl From<EntityModel> for Dto` |

### C.7.5 Verification Gate

```bash
cargo check --all-targets --all-features
cargo clippy --all-targets --all-features -- -D warnings
# Modularity: verify no leaking pub items
cargo doc --no-deps --document-private-items 2>&1 | head -50
# Run all tests
cargo test --test scenarios -- --nocapture
cargo test --test integration -- --nocapture
just generate-types
git diff --exit-code packages/api-client/src/generated-types/
```

---

## Phase D: Frontend Architecture + Testing

### Goal

Reorganize frontend into feature-based modules with flows for multi-step orchestration, and set up MSW-aligned testing.

### D.1 Feature-Based Reorganization

**Current:**
```
apps/web-admin/src/
├── modules/auth/
├── modules/dashboard/
├── components/
├── routes/
└── hooks/
```

**Target:**
```
apps/web-admin/src/
├── features/
│   ├── auth/
│   │   ├── api/                 # Re-export tanstack-client hooks
│   │   ├── components/          # LoginForm, RegisterForm, etc.
│   │   ├── hooks/               # useCsrfTokenQuery, etc.
│   │   ├── flows/               # Multi-step auth flows (if needed)
│   │   ├── schema.ts            # Zod schemas
│   │   ├── form-option.ts       # Form options
│   │   ├── zod-adapters.ts      # Generated type → Zod runtime validation
│   │   └── tests/               # Feature-specific tests
│   ├── learning/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── flows/               # Session orchestration, multi-step state
│   │   └── tests/
│   ├── assessment/
│   ├── recall/
│   ├── content/
│   ├── community/
│   └── dashboard/
│
├── components/                  # Shared UI (kept)
│   ├── ui/                      # shadcn primitives
│   ├── forms/                   # Form system
│   └── app-layout.tsx           # Shell components
│
├── routes/                      # TanStack routes (kept, thin)
├── hooks/                       # Shared hooks (kept)
├── lib/                         # Utilities (kept)
└── types/                       # Shared types (kept)
```

### D.2 Flows

For multi-step orchestration that doesn't belong in hooks or components:

```
features/revision/flows/
├── session-orchestrator.ts      # Manages recall session lifecycle
├── optimistic-updater.ts        # Optimistic UI updates
└── state-machine.ts             # Session state transitions
```

### D.3 Zod Adapters (Runtime Validation)

Even with generated types, validate at the FE boundary:

```typescript
// features/auth/zod-adapters.ts
import { z } from 'zod'
import type { AuthUserResponse } from '@aspiron/api-client'

export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  user_type: z.enum(['student', 'teacher', 'admin']),
  roles: z.array(z.any()),
  created_at: z.coerce.date(),
}) satisfies z.ZodType<AuthUserResponse>

// Usage: validate API responses at runtime
export function parseAuthUser(data: unknown): AuthUserResponse {
  return authUserSchema.parse(data)
}
```

### D.4 MSW Setup

(Already created in Phase A.4 — extended here with more handlers)

### D.5 Frontend Tests

```
apps/web-admin/src/features/auth/tests/
├── login-form.test.tsx          # Form validation, submission, error handling
└── auth-flow.test.tsx           # Login → redirect flow

apps/web-admin/src/features/learning/tests/
├── recall-session.test.tsx      # Recall session UI
└── progress-tracker.test.tsx    # Progress display
```

### D.6 Frontend DRY/SOLID/Modularity Remediation

**Runs in parallel with:** Phase C.7 (backend). No cross-cutting dependencies.

#### D.6.1 P0 — Safety & Correctness

| # | File | Violation | Fix |
|---|---|---|---|
| 1 | `modules/auth/form-option.ts:8-11` | Hardcoded admin credentials in source | Remove defaults; use env vars or placeholder text |
| 2 | `routes/_private-routes/content/_content-layout/topic/$id.tsx:8-15` | Route loader calls API service directly → bypasses TanStack Query cache | Use `queryClient.ensureQueryData` with matching query key |

#### D.6.2 P1 — High-Value Structural

| # | File | Violation | Fix |
|---|---|---|---|
| 3 | `components/forms/field-elements/*.tsx` (9 files) | 85% duplicate boilerplate per field component | Extract shared `FieldWrapper<T>` base component |
| 4 | `components/ui/sidebar.tsx` (727 lines) | 22 components + 1 hook in one file | Split: `sidebar-context.tsx`, `sidebar-root.tsx`, `sidebar-menu.tsx`, `sidebar-group.tsx` |
| 5 | `modules/dashboard/components/action-required.tsx` | God component: fetching + rendering + 4 if-branches + 4 inline button components | Registry pattern via `dashboardQuickActionRouteMapper`; extract button components |

#### D.6.3 P2 — DRY / Dead Code / Modularity

| # | File | Violation | Fix |
|---|---|---|---|
| 6 | `components/forms/types/*.ts` (9 files) | `*WithZodSchema` types duplicated, never used | Delete dead types |
| 7 | `packages/api-client/src/services/*.ts` | `createApiClient` conditional duplicated per method | Extract `getClient()` utility (already exists in `auth.service.ts`) |
| 8 | `packages/tanstack-client/src/hooks/**/*.ts` | `useAxiosConfig()` merge pattern duplicated each hook | Extract `useMergedAxiosConfig()` utility |
| 9 | `packages/api-client/src/utils/error-handler.ts` | 76 lines of dead code (all methods just `console.*`) | Implement redirect-on-401 + toasts, or delete class |
| 9a | All `features/` directories | No barrel `index.ts` exports — consumers import from internal paths | Add `index.ts` barrel per feature module exporting only the public API; enforce via lint rule |
| 9b | Package dependency: verify `@aspiron/api-client` never imports from `@aspiron/tanstack-client` | Reverse dependency would create circular chain | Run `Madge` or manual audit; fix any violations |

#### D.6.4 P3 — LSP / ISP / Polish / Modularity

| # | File | Violation | Fix |
|---|---|---|---|
| 10 | `components/forms/form-elements/submit-button.tsx:10-11` | Overrides consumer's `variant` during submit | Respect consumer's variant; add loading visual |
| 11 | `packages/api-client/src/types/index.ts:3-6` | `ServiceMethodArguments.args` always `?` | Two variants: required/optional |
| 12 | `modules/dashboard/components/action-required.tsx:9` | Imports `iconContainerVariants` from different component (cross-module coupling) | Define `insightActionVariants` in the dashboard module's own scope |
| 13 | `modules/auth/hooks/use-csrf-token-query.ts` | Uses raw `fetch` instead of `apiClient` | Route through `auth.service.ts` |
| 14 | `modules/auth/components/login-form.tsx:42-49` | Inline regex error parsing | Move parsing to service layer |
| 15 | `components/logout.tsx` | Full form + server function for simple logout | Create `useLogoutMutation` hook; simplify to button |

#### D.6.5 Verification Gate

```bash
pnpm typecheck
pnpm biome check .
pnpm --filter web-admin exec vitest run
# Modularity: verify no circular package deps
pnpm exec madge --circular apps/web-admin/src/
```

---

## Phase E: CI Architecture

### Goal

Three-tier CI pipeline: fast (< 3 min), medium (< 10 min), slow (async/nightly).

### E.1 Justfile Updates

```just
# Fast lane (every PR) — must complete in < 3 minutes
ci-fast:
    cargo fmt --check
    cargo clippy --all-targets --all-features -- -D warnings
    cargo test -p backend --lib -- unit::
    pnpm typecheck
    pnpm --filter @aspiron/api-client build
    pnpm --filter @aspiron/tanstack-client build
    pnpm --filter web-admin exec vitest run --reporter=dot
    just generate-types
    git diff --exit-code packages/api-client/src/generated-types/

# Medium lane (PR merge) — must complete in < 10 minutes
ci-medium:
    cargo test -p backend --test integration
    cargo test -p backend --test scenarios

# Slow lane (nightly / main branch)
ci-slow:
    pnpm --filter web-admin exec playwright test

# Full CI (pre-commit, current behavior)
ci: format lint build-all check
```

### E.2 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  fast-lane:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
      - run: cargo fmt --check
      - run: cargo clippy --all-targets --all-features -- -D warnings
      - run: cargo test -p backend --lib -- unit::
      - run: pnpm install
      - run: pnpm typecheck
      - run: just build-packages
      - run: pnpm --filter web-admin exec vitest run --reporter=dot
      - run: just generate-types
      - run: git diff --exit-code packages/api-client/src/generated-types/

  integration-tests:
    needs: fast-lane
    runs-on: ubuntu-latest
    timeout-minutes: 15
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_aspiron
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - run: cargo test -p backend --test integration
      - run: cargo test -p backend --test scenarios

  openapi-diff:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - run: npx @openapi-diff/cli ./apps/backend/openapi/openapi.json origin/main:./apps/backend/openapi/openapi.json

  e2e:
    needs: integration-tests
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm --filter web-admin exec playwright test
```

### E.3 Playwright E2E Tests (10-15 critical flows)

| # | Flow | Priority |
|---|---|---|
| 1 | Student signup → login → dashboard | Critical |
| 2 | Login → start recall session → submit answers | Critical |
| 3 | Teacher login → create quiz → student attempts | Critical |
| 4 | Create note → share → view shared note | High |
| 5 | Login → view weak areas → revision plan | High |
| 6 | Teacher upload chapter content | High |
| 7 | Role change → permission verification | High |
| 8 | Forgot password flow | Medium |
| 9 | Community thread → post → reply | Medium |
| 10 | Live session join → view recording | Medium |
| 11 | Admin insights dashboard | Low |
| 12 | Content search and filtering | Low |

### E.4 Contract Coverage Metrics

Track which routes lack:
- Tests
- OpenAPI schemas
- Handlers
- Auth metadata

```
apps/backend/
└── scripts/
    └── contract-coverage.sh     # Reports gaps in test/schema coverage
```

---

## Implementation Order & Dependencies

```
Phase A.1 (Week 1) — Backend Harness (FIRST)
├── Step 1: Minimal TestApp::new() with testcontainers + SeaORM migrator + tower oneshot
│   └── Success: /health endpoint test passes
├── Step 2: Auth integration test (register → login → authenticated route)
│   └── Validates: DB, middleware, JWT, serialization, migrations, router wiring
├── Step 3: Scenario builder (fluent API)
└── Step 4: First scenario test (onboarding or quiz lifecycle)
    └── Discovers: fixture pain, transaction pain, auth helper pain, DB reset pain

Phase A.2-A.5 (Week 1-2) — Remaining Test Infra (parallel with Phase B)
├── A.2 Frontend vitest setup
├── A.3 @aspiron/test-utils package
├── A.4 MSW setup (aligned to OpenAPI)
└── A.5 OpenAPI contract enforcement (committed spec, diff check)

Phase B (Week 2-3) — Scenario Tests on Current Architecture
├── B.1 Scenario builder pattern (fluent API) ─────────► Depends on A.1 Step 3
├── B.2 Scenario tests (6 workflows) ──────────────────► Depends on A.1 Step 4
├── B.3 Unit tests (algorithms, rules)
├── B.4 Integration tests ─────────────────────────────► Depends on A.1
└── B.5 Snapshot testing (selective)

Phase C (Week 3-6) — Backend Architecture Refactor
├── C.1 Create new directory skeleton
├── C.2 Migrate auth domain ───────────────────────────► Protected by Phase B tests
├── C.3 Migrate learning domain ───────────────────────► Protected by Phase B tests
├── C.4 Migrate assessment domain ─────────────────────► Protected by Phase B tests
├── C.5 Migrate remaining domains ─────────────────────► Protected by Phase B tests
├── C.6 Update OpenAPI paths + lib.rs
└── C.7 DRY/SOLID remediation ────────────────────────► Protected by Phase B tests

Phase C.7 (Week 6-7) — Backend DRY/SOLID (parallel with Phase D)
├── C.7.1 Safety fixes (P0) ──────────────────────────► ~15 minutes
├── C.7.2 Structural improvements (P1) ───────────────► 2-3 days
├── C.7.3 OCP/ISP fixes (P2) ────────────────────────► 1-2 days
├── C.7.4 Boilerplate reduction (P3) ─────────────────► 1 day
└── C.7.5 Verification ──────────────────────────────► In CI

Phase D (Week 4-7) — Frontend Architecture + Testing
├── D.1 Feature-based reorg ───────────────────────────► Depends on A.3
├── D.2 Flows (multi-step orchestration)
├── D.3 Zod adapters (runtime validation)
├── D.4 MSW extension
├── D.5 Frontend component tests
└── D.6 DRY/SOLID remediation ───────────────────────► Parallel with C.7

Phase E (Week 6-8) — CI Architecture
├── E.1 Justfile CI lanes
├── E.2 GitHub Actions workflow
├── E.3 Playwright E2E (10-15 critical flows)
├── E.4 Contract coverage metrics
└── E.5 Preview environments (optional)
```

---

## Files Changed Summary

| Category | New Files | Modified Files |
|---|---|---|
| Test infrastructure | ~20 files | `Cargo.toml`, `vite.config.ts`, `package.json` |
| Test utils package | ~10 files | — |
| MSW + factories | ~10 files | — |
| Scenario tests | ~15 files | — |
| Backend refactor | ~80 files (reorganized) | `lib.rs`, `main.rs`, all domain modules, `setup/openapi.rs` |
| Frontend reorg | ~30 files (reorganized) | Route files, component imports |
| DRY/SOLID backend | ~5 new (trait files) | ~20 files (repository, service, error, jwt) |
| DRY/SOLID frontend | ~6 new (split components) | ~15 files (form types, service, hook utils) |
| CI/Justfile | ~4 files | `justfile`, `AGENTS.md` |
| **Total** | **~180 files** | **~35 files** |

---

## Risk Matrix

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Backend refactor breaks existing functionality | High | Medium | Scenario tests from Phase B run after each migration |
| Scenario tests are flaky | High | Medium | Use testcontainers for isolated DB, deterministic fixtures |
| MSW drifts from OpenAPI | Medium | Medium | Generate factory types from same DTOs, contract check in CI |
| CI becomes too slow | Medium | Low | Fast lane < 3 min, medium < 10 min, slow lane async |
| AI agents generate inconsistent code | High | High | Scenario tests catch regressions, generated SDK prevents type mismatches |
| ts-rs type generation breaks | Medium | Low | Pin ts-rs version, run `just generate-types` in CI |
| Testcontainers slow on CI | Medium | Medium | Use lightweight postgres image, cache layers |
| Migration complexity during active development | High | High | Phase B tests protect Phase C refactor; migrate one domain at a time |
| DRY/SOLID refactor breaks working stubs | Medium | Low | P0 fixes are pure deletions; P1 adds trait abstractions but keeps existing impls |
| Hardcoded credentials leak to production | High | High | P0 fix removes credentials; review required before deployment |

---

## Success Criteria

### Phase A.1 (Backend Harness)
- [x] `TestApp::new()` spins up testcontainers postgres, runs SeaORM migrations, builds router
- [x] Per-test transaction rollback works (`BEGIN` → test → `ROLLBACK`)
- [x] `tower::ServiceExt::oneshot` request helper works
- [x] `/health` endpoint test passes
- [x] Auth integration test passes (register → login → authenticated route)
- [x] First scenario test passes (onboarding or quiz lifecycle)

### Phase A.2-A.5 (Remaining Test Infra)
- [x] Frontend vitest configured and running
- [x] @aspiron/test-utils package with factories
- [x] MSW handlers covering all active API endpoints
- [x] OpenAPI spec committed and diff-checked in CI

### Phase B (Scenario Tests)
- [~] 4/6 scenario tests passing (2 blocked on real handlers)
- [x] 10+ unit tests passing (33 total: permissions, JWT, snapshots)
- [x] 5+ integration tests passing (16 total: auth middleware, route responses)
- [x] Scenario builder fluent API working

### Phase C (Backend Refactor)
- [~] 1/10 domains migrated to new layer structure (auth)
- [~] Domain models separated from SeaORM entities (auth done)
- [~] DTOs in http layer, not domain (auth done)
- [~] Ports (traits) defined for each domain (auth done)
- [x] `cargo check --all-targets --all-features` passes
- [x] `cargo clippy -D warnings` passes
- [x] All Phase B scenario tests still pass after refactor

### Phase D (Frontend)
- [ ] Frontend feature-based reorganization complete
- [ ] Flows directories for multi-step orchestration
- [ ] Zod adapters for runtime validation
- [ ] 5+ frontend component tests passing

### Phase C.7 (Backend DRY/SOLID/Modularity)
- [ ] All `todo!()` and `unimplemented!()` removed from production code
- [ ] All orphan stub handler files deleted
- [ ] `encode_access_token` / `encode_refresh_token` consolidated
- [ ] Repository traits defined for all domains with `#[cfg_attr(test, mockall::automock)]`
- [ ] `UserRepository::get_user_profile_by_id()` split into focused methods
- [ ] Permission parsing uses `FromStr` derive, not manual match
- [ ] `AppError` variant-to-status-code mapping is single-sourced
- [ ] `Paginable` trait replaces duplicated pagination helpers
- [ ] Every `pub` item across all backend modules audited — only intended API surface is `pub`; internals use `pub(crate)`
- [ ] Every backend domain module has a barrel `mod.rs` exporting only its public API
- [ ] No cross-layer dependency violations: `http → application → domain ← infra` enforced
- [ ] `cargo clippy -D warnings` passes clean
- [ ] All Phase B scenario tests still pass

### Phase D.6 (Frontend DRY/SOLID/Modularity)
- [ ] Hardcoded credentials removed from `form-option.ts`
- [ ] Route loaders use `queryClient.ensureQueryData` with TanStack Query keys
- [ ] `FieldWrapper` base component extracted; form field boilerplate eliminated
- [ ] `sidebar.tsx` split into domain-specific files
- [ ] `action-required.tsx` uses registry pattern instead of if-chain
- [ ] All `WithZodSchema` dead types deleted
- [ ] `getClient()` utility shared across API client services
- [ ] `submit-button.tsx` respects consumer's variant prop
- [ ] Every feature module has a barrel `index.ts` — no external imports from internal paths
- [ ] No circular dependencies between packages (`Madge` check passes)
- [ ] `pnpm typecheck` and `pnpm biome check .` pass

### Phase E (CI)
- [ ] Fast lane CI completes in < 3 minutes
- [x] `just ci` passes (full pre-commit check, runs on every commit via husky + lint-staged)
- [ ] Contract coverage metrics script working
