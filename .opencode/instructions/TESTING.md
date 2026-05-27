# Testing Conventions

## Stack

| Layer | Framework | Location |
|---|---|---|
| **Rust unit** | `#[test]` / `#[tokio::test]` | `apps/backend/tests/unit/` |
| **Rust snapshot** | `insta` | `apps/backend/tests/unit/` |
| **Rust integration** | `TestApp` + testcontainers | `apps/backend/tests/integration/` |
| **Rust scenario** | `ScenarioBuilder` fluent builder | `apps/backend/tests/scenarios/` |
| **Rust harness** | `TestApp` (Postgres per test) | `apps/backend/tests/harness.rs` |
| **Rust fixtures** | Helper functions + context structs | `apps/backend/tests/fixtures/` |
| **Vitest** | `vitest` + `jsdom` | `apps/web-admin/src/**/*.test.{ts,tsx}` |
| **Component tests** | `@testing-library/react` + `userEvent` | Same tree as source |
| **Utility tests** | `vitest` | `apps/web-admin/src/lib/*.test.ts` |
| **Factories** | `build<Type>(overrides?)` | `packages/test-utils/src/factories/` |
| **MSW handlers** | `msw` `http.get/post` | `apps/web-admin/mock/handlers/` |
| **E2E (mocked)** | Playwright `page.route()` | `apps/web-admin/e2e/dashboard/` |
| **E2E (real API)** | Playwright + `pg` seed | `apps/web-admin/e2e/real-api/` |

## Rust Tests

### Unit Tests

**File:** `apps/backend/tests/unit/<domain>.rs`
**Entry:** `apps/backend/tests/unit_tests.rs` → `mod unit;` → `unit/mod.rs`

Pure function tests. No database, no harness. Import internal functions directly.

```rust
// apps/backend/tests/unit/permissions.rs
use backend::application::users::permission::parse_permission_name;
use backend::entries::entity_enums::action_types::ActionTypeEnum;
use backend::entries::entity_enums::resource_types::ResourceTypeEnum;
use backend::http::responses::users::OwnershipType;

#[test]
fn parse_permission_name_returns_none_for_empty_string() {
    assert!(parse_permission_name("").is_none());
}

#[test]
fn parse_permission_name_returns_none_for_single_part() {
    assert!(parse_permission_name("CONTENT").is_none());
}

#[test]
fn parse_permission_name_parses_two_part_with_all_ownership() {
    let result = parse_permission_name("CONTENT.READ");
    assert_eq!(
        result,
        Some((ResourceTypeEnum::CONTENT, ActionTypeEnum::READ, OwnershipType::All))
    );
}

#[test]
fn parse_permission_name_parses_all_resource_types() {
    let cases = [
        ("USER", ResourceTypeEnum::USER),
        ("CONTENT", ResourceTypeEnum::CONTENT),
        ("ASSESSMENT", ResourceTypeEnum::ASSESSMENT),
    ];
    for (name, expected) in &cases {
        let result = parse_permission_name(&format!("{}.READ", name));
        assert_eq!(
            result,
            Some((expected.clone(), ActionTypeEnum::READ, OwnershipType::All)),
            "Failed for resource: {}",
            name
        );
    }
}
```

```rust
// apps/backend/tests/unit/jwt.rs
use backend::utils::jwt::{Claims, JwtError, decode_jwt, encode_access_token};
use jsonwebtoken::{EncodingKey, Header, encode};

const TEST_SECRET: &str = "test-secret-key-for-unit-tests-32chars!!";
const USER_ID: &str = "550e8400-e29b-41d4-a716-446655440000";

#[test]
fn encode_and_decode_access_token_roundtrip() {
    let token = encode_access_token(USER_ID, TEST_SECRET, 3600).unwrap();
    let claims = decode_jwt(&token, TEST_SECRET).unwrap();
    assert_eq!(claims.sub, USER_ID);
}

#[test]
fn decode_returns_invalid_error_for_garbage_token() {
    let result = decode_jwt("not.a.token", TEST_SECRET);
    assert!(matches!(result, Err(JwtError::Invalid(_))));
}

#[test]
fn decode_returns_expired_error_for_expired_token() {
    let claims = Claims { sub: USER_ID.to_string(), exp: 0 };
    let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(TEST_SECRET.as_bytes())).unwrap();
    let result = decode_jwt(&token, TEST_SECRET);
    assert!(matches!(result, Err(JwtError::Expired(_))));
}
```

**Conventions:**
- Pure `#[test]` functions, no async needed
- Direct imports of internal functions
- `assert_eq!`, `assert!`, `matches!` for assertions
- Constants for reusable test values (secrets, IDs)
- Table-driven tests with `for (name, expected) in &cases` for bulk validation
- Helper factory functions for constructing domain model instances
- One assertion pattern per `#[test]`

### Snapshot Tests (insta)

**File:** `apps/backend/tests/unit/<name>_snapshot.rs`
**Snapshots:** `apps/backend/tests/unit/snapshots/*.snap`

```rust
// apps/backend/tests/unit/error_snapshot.rs
use backend::setup::error::{ErrorDetails, ErrorResponse};

fn error_json(error: ErrorResponse) -> serde_json::Value {
    let mut value = serde_json::to_value(error).expect("serialize error response");
    // Strip non-deterministic field for stable snapshots
    value.as_object_mut().and_then(|m| m.remove("request_id"));
    value
}

#[test]
fn validation_error() {
    let err = ErrorResponse {
        error: ErrorDetails {
            code: "VALIDATION".into(),
            message: "email is required".into(),
            details: None,
        },
        request_id: None,
    };
    insta::assert_json_snapshot!("validation-error", error_json(err));
}

#[test]
fn internal_error() {
    let err = ErrorResponse {
        error: ErrorDetails {
            code: "INTERNAL".into(),
            message: "something went wrong".into(),
            details: Some(serde_json::json!({ "detail": "db connection failed" })),
        },
        request_id: None,
    };
    insta::assert_json_snapshot!("internal-error", error_json(err));
}
```

```rust
// apps/backend/tests/unit/openapi_snapshot.rs
use backend::setup::openapi::ApiDoc;
use utoipa::OpenApi;

#[test]
fn openapi_spec_matches_snapshot() {
    let openapi = ApiDoc::openapi();
    insta::assert_json_snapshot!("openapi-spec", openapi);
}
```

**Conventions:**
- `insta::assert_json_snapshot!("name", value)` creates/validates `.snap` files
- Strip non-deterministic fields (e.g., `request_id`, UUIDs, timestamps) before snapshotting
- Named snapshots (first arg) to distinguish multiple snapshots in same file
- Run `cargo insta review` to review changes, `cargo insta accept` to accept
- OpenAPI snapshot (~1582 lines) catches unintended API contract changes

### Integration Tests

**File:** `apps/backend/tests/integration/<domain>.rs`
**Entry:** `apps/backend/tests/integration_tests.rs` → `mod integration;` → `integration/mod.rs`

Full HTTP roundtrip against ephemeral PostgreSQL via `TestApp`.

```rust
// apps/backend/tests/integration/auth_middleware.rs
use crate::harness::{TestApp, create_test_user, extract_jwt_cookie};
use axum::body::Body;
use axum::http::Request;
use backend::utils::jwt::{Claims, encode_access_token};
use jsonwebtoken::{EncodingKey, Header, encode};

#[tokio::test]
async fn me_returns_200_with_valid_cookie() {
    let app = TestApp::new().await;
    let test_email = "valid_cookie@test.com";

    create_test_user(app.db.as_ref(), test_email, "password123").await;

    let login = app
        .post_json("/api/v1/auth/login", serde_json::json!({
            "email": test_email, "password": "password123"
        }))
        .await;
    assert_eq!(login.status(), 200);

    let cookie = extract_jwt_cookie(&login);

    let response = app.get_with_cookie("/api/v1/auth/me", &cookie).await;
    assert_eq!(response.status(), 200);
}

#[tokio::test]
async fn me_returns_401_without_cookie() {
    let app = TestApp::new().await;

    let response = app.get("/api/v1/auth/me").await;
    assert_eq!(response.status(), 401);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["error"]["code"], "AUTH");
}

#[tokio::test]
async fn me_returns_200_with_authorization_bearer_header() {
    let app = TestApp::new().await;
    let test_email = "bearer_token@test.com";

    let (user_id, _) = create_test_user(app.db.as_ref(), test_email, "password123").await;

    let token = encode_access_token(&user_id.to_string(), jwt_secret(), 3600).unwrap();

    let req = Request::builder()
        .method("GET")
        .uri("/api/v1/auth/me")
        .header("x-client-type", "BROWSER")
        .header("authorization", format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();

    let response = app.request(req).await;
    assert_eq!(response.status(), 200);
}

fn jwt_secret() -> &'static str {
    "test-jwt-secret-for-testing-only-32chars!!"
}
```

**Conventions:**
- `#[tokio::test]` for all async tests
- `TestApp::new().await` boots a testcontainer Postgres + runs migrations
- `app.get(path)`, `app.post_json(path, body)`, `app.get_with_cookie(path, cookie)`, `app.request(req)` for HTTP calls
- `create_test_user(db, email, password)` inserts directly into DB via SeaORM ActiveModel
- `extract_jwt_cookie(&response)` parses `Set-Cookie` header
- Assert status codes with `assert_eq!(response.status(), 200|401|422)`
- Parse JSON body and assert error codes: `json["error"]["code"]`

### Scenario Tests

**File:** `apps/backend/tests/scenarios/<name>.rs`
**Entry:** `apps/backend/tests/scenarios/mod.rs`

Multi-step user journeys using the `ScenarioBuilder` fluent builder.

```rust
// apps/backend/tests/scenarios/quiz_lifecycle.rs
use axum::{body::to_bytes, http::StatusCode};
use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;
use crate::fixtures::scenario_builder::ScenarioBuilder;
use crate::harness::{TestApp, extract_jwt_cookie};

#[tokio::test]
async fn scenario_quiz_lifecycle_create_student_and_quiz() {
    let app = TestApp::new().await;

    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("student@aspiron.test", "pass123", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Mechanics")
        .topic("Newton's Laws")
        .quiz("Mechanics Quiz")
        .questions(5)
        .build()
        .await;

    let student = ctx.users.get(&UserTypeEnums::STUDENT).expect("student should exist");
    assert_eq!(student.email, "student@aspiron.test");
    assert_eq!(student.role, UserTypeEnums::STUDENT);

    let quiz = ctx.quiz.as_ref().expect("quiz should exist");
    assert_eq!(quiz.title, "Mechanics Quiz");

    // Verify the quiz endpoint returns 200
    let quiz_response = app.get(&format!("/api/v1/quizzes/{}", quiz.id)).await;
    assert_eq!(quiz_response.status(), StatusCode::OK);

    // Verify the user can login via HTTP
    let login = app.post_json("/api/v1/auth/login", serde_json::json!({
        "email": student.email, "password": "pass123",
    })).await;
    assert_eq!(login.status(), StatusCode::OK);

    let cookie = extract_jwt_cookie(&login);

    let me = app.get_with_cookie("/api/v1/auth/me", &cookie).await;
    assert_eq!(me.status(), StatusCode::OK);

    let body = to_bytes(me.into_body(), usize::MAX).await.expect("read body");
    let body: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(body["data"]["user"]["email"], student.email);
}

#[tokio::test]
async fn scenario_multi_user_student_and_teacher() {
    let app = TestApp::new().await;

    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("student@multi.test", "pass1", UserTypeEnums::STUDENT)
        .with_user("teacher@multi.test", "pass2", UserTypeEnums::TEACHER)
        .subject("Math", ExamTypeEnums::JEE)
        .chapter("Algebra")
        .topic("Quadratic Equations")
        .build()
        .await;

    assert_eq!(ctx.users.len(), 2, "should have two users");

    let student = ctx.users.get(&UserTypeEnums::STUDENT).expect("student");
    let teacher = ctx.users.get(&UserTypeEnums::TEACHER).expect("teacher");

    for (user, password) in [(&student, "pass1"), (&teacher, "pass2")] {
        let login = app.post_json("/api/v1/auth/login", serde_json::json!({
            "email": user.email, "password": password,
        })).await;
        assert_eq!(login.status(), StatusCode::OK, "{} should login", user.email);
    }
}
```

**Conventions:**
- Builder pattern with fluent API: each method returns `Self`
- `ScenarioContext` holds `HashMap<UserTypeEnums, TestUser>` + optional entities
- `build()` calls `helpers::create_test_*` functions sequentially with parent-child chaining
- Tests assert both entity creation AND HTTP endpoint responses
- Workflow-oriented: "create user → create content → login → verify"

### Test Harness (TestApp)

**File:** `apps/backend/tests/harness.rs`

```rust
use axum::{Router, body::Body, http::Request};
use backend::setup::app::{AppState, create_app};
use backend::setup::config::Config;
use migrations::{Migrator, MigratorTrait};
use sea_orm::{Database, DatabaseConnection, DatabaseTransaction, TransactionTrait};
use std::sync::Arc;
use testcontainers::ContainerAsync;
use testcontainers_modules::postgres::Postgres;
use tower::ServiceExt;

pub struct TestApp {
    pub db: Arc<DatabaseConnection>,
    pub router: Router,
    _container: ContainerAsync<Postgres>,
}

impl TestApp {
    /// Spin up Postgres container, run migrations, build router.
    pub async fn new() -> Self {
        let postgres = Postgres::default().start().await.expect("start postgres");
        let host = postgres.get_host().await.expect("host");
        let port = postgres.get_host_port_ipv4(5432).await.expect("port");
        let db_url = format!("postgres://postgres:postgres@{host}:{port}/postgres");

        let db = Database::connect(&db_url).await.expect("connect");
        Migrator::up(&db, None).await.expect("migrate");

        let config = Config::for_test();
        let app_state = AppState::new(Arc::new(config.clone()), db);
        let db = Arc::clone(&app_state.db);
        let router = create_app(&app_state.config, app_state.clone()).with_state(app_state);

        Self { db, router, _container: postgres }
    }

    /// Full HTTP request through middleware stack.
    pub async fn request(&self, req: Request<Body>) -> axum::http::Response<Body> {
        self.router.clone().oneshot(req).await.expect("request")
    }

    /// Convenience GET with x-client-type header.
    pub async fn get(&self, path: &str) -> axum::http::Response<Body> {
        let req = Request::builder()
            .method("GET").uri(path)
            .header("x-client-type", "BROWSER")
            .body(Body::empty()).expect("valid request");
        self.request(req).await
    }

    /// Convenience POST with JSON body.
    pub async fn post_json(&self, path: &str, body: serde_json::Value) -> axum::http::Response<Body> {
        let req = Request::builder()
            .method("POST").uri(path)
            .header("content-type", "application/json")
            .header("x-client-type", "BROWSER")
            .body(Body::from(serde_json::to_string(&body).expect("valid json")))
            .expect("valid request");
        self.request(req).await
    }

    /// Convenience GET with Cookie header.
    pub async fn get_with_cookie(&self, path: &str, cookie: &str) -> axum::http::Response<Body> {
        let req = Request::builder()
            .method("GET").uri(path)
            .header("x-client-type", "BROWSER")
            .header("cookie", cookie)
            .body(Body::empty()).expect("valid request");
        self.request(req).await
    }
}

/// Create a test user directly in the database.
pub async fn create_test_user<C: ConnectionTrait>(db: &C, email: &str, password: &str) -> (Uuid, String) {
    use backend::entries::entities::{user, user_profile};
    let id = Uuid::new_v4();
    let password_hash = bcrypt::hash(password, bcrypt::DEFAULT_COST).expect("hash");
    let now: DateTimeWithTimeZone = Utc::now().into();
    user::ActiveModel { id: Set(id), email: Set(email.to_string()), password_hash: Set(password_hash), is_active: Set(true), created_at: Set(now), updated_at: Set(now) }
        .insert(db).await.expect("insert user");
    user_profile::ActiveModel { user_id: Set(id), first_name: Set(Some("Test".to_string())), last_name: Set(Some("User".to_string())), ..Default::default() }
        .insert(db).await.expect("insert profile");
    (id, password.to_string())
}

/// Extract the JWT cookie value from a login response.
pub fn extract_jwt_cookie(response: &axum::http::Response<Body>) -> String {
    let set_cookie = response.headers().get("set-cookie").expect("set-cookie header");
    set_cookie.to_str().expect("valid utf-8").split(';').next().expect("name=value").trim().to_string()
}
```

**Conventions:**
- One Postgres container per test instance (auto-cleaned on drop)
- `Config::for_test()` for test-specific JWT secret
- All assertions made against HTTP response status + body
- `tower::ServiceExt::oneshot` for full middleware stack exercise

### Test Fixtures

**File:** `apps/backend/tests/fixtures/helpers.rs`
**Context types:** `apps/backend/tests/fixtures/context.rs`

```rust
// context.rs — typed context structs
pub struct TestUser { pub id: Uuid, pub email: String, pub password: String, pub role: UserTypeEnums }
pub struct TestSubject { pub id: Uuid, pub name: String, pub exam_type: ExamTypeEnums }
pub struct TestChapter { pub id: Uuid, pub name: String }
pub struct TestTopic { pub id: Uuid, pub name: String }
pub struct TestQuiz { pub id: Uuid, pub title: String }
pub struct TestRecallSession { pub id: Uuid }
pub struct ScenarioContext {
    pub users: HashMap<UserTypeEnums, TestUser>,
    pub subject: Option<TestSubject>,
    pub chapter: Option<TestChapter>,
    pub topic: Option<TestTopic>,
    pub quiz: Option<TestQuiz>,
    pub recall_session: Option<TestRecallSession>,
}
```

```rust
// helpers.rs — entity creation helpers
pub async fn ensure_role_exists(db: &DatabaseConnection, role_type: UserTypeEnums) -> Uuid {
    let existing = role::Entity::find()
        .filter(role::Column::Name.eq(role_type)).one(db).await.expect("query");
    if let Some(existing_role) = existing { return existing_role.id; }
    // ... insert role::ActiveModel
}

pub async fn create_test_user(db: &DatabaseConnection, email: &str, password: &str, role_type: UserTypeEnums) -> TestUser {
    let id = Uuid::new_v4();
    let password_hash = bcrypt::hash(password, bcrypt::DEFAULT_COST).expect("hash");
    // insert user::ActiveModel + user_profile::ActiveModel + user_role::ActiveModel
    TestUser { id, email: email.to_string(), password: password.to_string(), role: role_type }
}

pub async fn create_test_quiz(db: &DatabaseConnection, topic_id: Uuid, title: &str) -> TestQuiz {
    let id = Uuid::new_v4();
    assessment_quiz::ActiveModel { id: Set(id), topic_id: Set(topic_id), title: Set(title.to_string()) }
        .insert(db).await.expect("insert quiz");
    TestQuiz { id, title: title.to_string() }
}
```

```rust
// scenario_builder.rs — fluent builder
impl<'db> ScenarioBuilder<'db> {
    pub fn new(db: &'db DatabaseConnection) -> Self { /* ... */ }
    pub fn with_user(mut self, email: &str, password: &str, role: UserTypeEnums) -> Self { /* ... */ }
    pub fn subject(mut self, name: &str, exam_type: ExamTypeEnums) -> Self { /* ... */ }
    pub fn chapter(mut self, name: &str) -> Self { /* ... */ }
    pub fn topic(mut self, name: &str) -> Self { /* ... */ }
    pub fn quiz(mut self, title: &str) -> Self { /* ... */ }
    pub fn questions(mut self, count: usize) -> Self { /* ... */ }
    pub fn recall_session(mut self) -> Self { /* ... */ }

    pub async fn build(self) -> ScenarioContext {
        let mut ctx = ScenarioContext::default();
        for (email, password, role) in &self.users {
            ctx.users.insert(*role, helpers::create_test_user(self.db, email, password, *role).await);
        }
        if let Some((name, exam_type)) = &self.subject {
            let subject = helpers::create_test_subject(self.db, name, exam_type.clone()).await;
            // chain: chapter → topic → quiz → recall_session
            ctx.subject = Some(subject);
        }
        ctx
    }
}
```

**Conventions:**
- Each helper function creates a single entity via SeaORM `ActiveModel::insert()`
- `ensure_role_exists` checks for existing role first (idempotent)
- Helper functions return typed context structs (not tuples)
- All entities use `Uuid::new_v4()` for unique IDs

## JS/TS Vitest Tests

### Test Setup

**File:** `apps/web-admin/test/setup.ts`

```typescript
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../mock/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  Element.prototype.scrollIntoView = () => {}
})
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({ handler: vi.fn() }),
}))
vi.mock('@tanstack/react-start/server', () => ({
  getCookies: vi.fn(() => ({})),
}))
vi.mock('@tanstack/react-start/client', () => ({
  useServerFn: vi.fn(),
}))
```

**File:** `apps/web-admin/vitest.config.ts`

```typescript
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@mock': fileURLToPath(new URL('./mock', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'mock/**/*.test.{ts,tsx}'],
    css: false,
    coverage: { provider: 'v8', include: ['src/**/*.{ts,tsx}'] },
    server: { deps: { inline: ['@aspiron'] } },
  },
})
```

### Custom Render

**File:** `apps/web-admin/src/test-utils.tsx`

```typescript
import type { AxiosConfigOptions } from '@aspiron/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type RenderOptions, render } from '@testing-library/react'
import type { ReactNode } from 'react'

export function createMockQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

interface ProviderOptions {
  queryClient?: QueryClient
  axiosConfig?: AxiosConfigOptions
  isAuthenticated?: boolean
}

function TestProviders({ children, options }: { children: ReactNode; options: ProviderOptions }) {
  const queryClient = options.queryClient ?? createMockQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

function customRender(ui: ReactNode, options?: RenderOptions & ProviderOptions) {
  const { queryClient, axiosConfig, isAuthenticated, ...renderOptions } = options ?? {}
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders options={{ queryClient, axiosConfig, isAuthenticated }}>
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  })
}

export { customRender as render }
```

### Component Tests

**File:** `apps/web-admin/src/features/<domain>/components/<name>.test.tsx`

Tests must cover all runtime states: **loading** (skeleton), **error** (retry button), **empty**, **success**.

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ActionRequired } from '@/features/dashboard/components/action-required'

// Hoisted mock variable for per-test control
const { mockUseInsightQuery } = vi.hoisted(() => ({
  mockUseInsightQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useInsightQuery: mockUseInsightQuery,
  useGetTopicByIdQuery: () => ({ data: null, isLoading: false }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const successData = {
  time_window: { start: '2025-01-01T00:00:00Z', end: '2025-01-31T00:00:00Z' },
  insights: [
    { id: '1', insight_type: 'quiz_review_pending', severity: 'danger', title: 'Quizzes Pending Review', description: '5 quizzes need your attention', metadata: { quiz_id: 'quiz-1', count: 5 }, detected_at: new Date('2025-01-15T10:00:00Z') },
    { id: '2', insight_type: 'low_attendance', severity: 'warning', title: 'Low Attendance', description: 'Class attendance dropped to 60%', metadata: {}, detected_at: new Date('2025-01-15T11:00:00Z') },
  ],
  summary: { total: 2, filtered_item: null, filtered_item_count: 0, danger: 1, success: 0, neutral: 0, warning: 1, info: 0 },
  pagination: { page: 1, limit: 10, total: 2 },
}

describe('ActionRequired', () => {
  afterEach(() => { vi.clearAllMocks() })

  it('renders section heading in success state', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData, isLoading: false, isError: false, error: null, refetch: vi.fn(),
    })
    render(<ActionRequired />)
    expect(screen.getByText('Action Required')).toBeInTheDocument()
  })

  it('renders skeleton while loading', () => {
    mockUseInsightQuery.mockReturnValue({
      data: undefined, isLoading: true, isError: false, error: null, refetch: vi.fn(),
    })
    const { container } = render(<ActionRequired />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('Quizzes Pending Review')).not.toBeInTheDocument()
  })

  it('renders empty state when no insights', () => {
    mockUseInsightQuery.mockReturnValue({
      data: { ...successData, insights: [] }, isLoading: false, isError: false, error: null, refetch: vi.fn(),
    })
    render(<ActionRequired />)
    expect(screen.getByText('No items need attention right now')).toBeInTheDocument()
  })

  it('renders error state with retry button', async () => {
    const refetch = vi.fn()
    mockUseInsightQuery.mockReturnValue({
      data: undefined, isLoading: false, isError: true, error: new Error('Failed to fetch insights'), refetch,
    })
    const user = userEvent.setup()
    render(<ActionRequired />)
    expect(screen.getByTestId('module-error')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch insights')).toBeInTheDocument()
    await user.click(screen.getByTestId('retry-button'))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('renders insight cards from mocked data', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData, isLoading: false, isError: false, error: null, refetch: vi.fn(),
    })
    render(<ActionRequired />)
    expect(screen.getByText('Quizzes Pending Review')).toBeInTheDocument()
    expect(screen.getByText('Low Attendance')).toBeInTheDocument()
  })
})
```

**Conventions:**
- `vi.mock('@package')` at module level for external dependency mocking
- `vi.hoisted(() => ({ mockFn: vi.fn() }))` for test-controllable mock variables
- `mockReturnValue({ data, isLoading, isError, error, refetch })` for TanStack Query hooks
- Always test all states: loading (skeleton), error (retry button), empty, success
- `userEvent.setup()` for simulating clicks, typing (always `await`)
- `afterEach(() => vi.clearAllMocks())` to reset between tests
- `screen.getByText()`, `screen.getByRole()`, `screen.getByTestId()` for assertions
- `container.querySelector('.animate-pulse')` for skeleton detection
- `screen.queryByText(...).not.toBeInTheDocument()` for absence assertions

### Utility Tests

**File:** `apps/web-admin/src/lib/<name>.test.ts`

```typescript
import { describe, expect, it } from 'vitest'
import { cn, formatPercentage, formatRelativeTime } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })
  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })
  it('merges tailwind classes correctly', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })
  it('handles empty inputs', () => {
    expect(cn()).toBe('')
  })
  it('handles undefined and null', () => {
    expect(cn('px-4', undefined, null, 'py-2')).toBe('px-4 py-2')
  })
})

describe('formatRelativeTime', () => {
  it('returns "just now" for dates less than 1 minute ago', () => {
    expect(formatRelativeTime(new Date())).toBe('just now')
  })
  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago')
  })
  it('returns formatted date for older dates', () => {
    const oldDate = new Date('2024-01-15')
    expect(formatRelativeTime(oldDate)).toBe('Jan 15, 2024')
  })
})

describe('formatPercentage', () => {
  it('formats 0.756 to "76%"', () => {
    expect(formatPercentage(0.756)).toBe('76%')
  })
  it('returns em dash for null', () => {
    expect(formatPercentage(null)).toBe('\u2014')
  })
  it('returns em dash for undefined', () => {
    expect(formatPercentage(undefined)).toBe('\u2014')
  })
})
```

**Conventions:**
- `describe` / `it` from vitest (globals enabled)
- Pure function assertions: `expect(fn(input)).toBe(expected)`
- One assertion per `it` block
- Test edge cases: null, undefined, empty, boundary values

### Factory Tests

**File:** `packages/test-utils/src/__tests__/<name>.factory.test.ts`

```typescript
import { describe, expect, it } from 'vitest'
import { buildQuizResponse, buildQuizResponseList } from '../factories/quiz.factory'

describe('quiz factory', () => {
  describe('buildQuizResponse', () => {
    it('creates a quiz with default values', () => {
      const quiz = buildQuizResponse()
      expect(quiz.title).toBe('Test Quiz')
      expect(quiz.passing_score).toBe(70)
    })
    it('overrides default values', () => {
      const quiz = buildQuizResponse({ title: 'Final Exam', passing_score: 80 })
      expect(quiz.title).toBe('Final Exam')
      expect(quiz.passing_score).toBe(80)
    })
  })
  describe('buildQuizResponseList', () => {
    it('creates the requested number of quizzes', () => {
      const quizzes = buildQuizResponseList(3)
      expect(quizzes).toHaveLength(3)
    })
  })
})
```

**Conventions:**
- Factories use `build<Type>(overrides?: Partial<Type>): Type` pattern
- Incremental `idCounter` ensures unique IDs across tests
- Always provide sensible defaults
- `build<Type>List(count, overrides?)` for arrays

### MSW Verification

**File:** `apps/web-admin/mock/__tests__/msw-verification.test.ts`

```typescript
import { server } from '@mock/server'
import { HttpResponse, http } from 'msw'

describe('MSW', () => {
  it('intercepts health endpoint', async () => {
    const response = await fetch('/api/v1/health')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body).toEqual({ status: 'healthy', version: '0.1.0' })
  })

  it('allows per-test handler overrides', async () => {
    server.use(
      http.get('*/api/v1/health', () => HttpResponse.json({ status: 'degraded' }))
    )
    const response = await fetch('/api/v1/health')
    expect(response.status).toBe(200)
    expect((await response.json()).status).toBe('degraded')
  })

  it('resets handlers between tests', async () => {
    const response = await fetch('/api/v1/health')
    expect((await response.json()).status).toBe('healthy')
  })
})
```

## MSW Handlers

**File:** `apps/web-admin/mock/handlers/<domain>.handlers.ts`
**Index:** `apps/web-admin/mock/handlers/index.ts`

One file per domain. Wildcard `*/api/v1/...` to work with any base URL.

```typescript
// health.handlers.ts — simplest handler
import { HttpResponse, http } from 'msw'

export const healthHandlers = [
  http.get('*/api/v1/health', () => {
    return HttpResponse.json({ status: 'healthy', version: '0.1.0' })
  }),
]
```

```typescript
// insights.handlers.ts — param parsing + factory data
import type { Insight, InsightSummary, InsightsResponse } from '@aspiron/api-client'
import { HttpResponse, http } from 'msw'

function buildInsight(overrides?: Partial<Insight>): Insight {
  return {
    id: 'insight-1',
    insight_type: 'quiz_review_pending',
    severity: 'danger',
    title: 'Quizzes Pending Review',
    description: '5 quizzes need your attention',
    metadata: { quiz_id: 'quiz-1', count: 5 },
    detected_at: new Date('2025-01-15T10:00:00Z'),
    ...overrides,
  }
}

export const insightsHandlers = [
  http.get('*/api/v1/admin/insights', ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('insight_type')
    const insights = type
      ? [buildInsight({ insight_type: type as Insight['insight_type'] })]
      : [buildInsight({ id: '1', insight_type: 'quiz_review_pending' })]

    const response: InsightsResponse = {
      time_window: { start: '2025-01-01T00:00:00Z', end: '2025-01-31T00:00:00Z' },
      insights,
      summary: { total: insights.length, filtered_item: null, filtered_item_count: 0, danger: 1, success: 0, neutral: 0, warning: 0, info: 0 },
      pagination: { page: 1, limit: 10, total: insights.length, filtered_total: insights.length, total_pages: 1 },
    }
    return HttpResponse.json(response)
  }),
]
```

```typescript
// auth.handlers.ts — Set-Cookie pattern
import type { ApiResponse, AuthResponse } from '@aspiron/api-client'
import { createAuthResponse } from '@mock/factories/student.factory'
import { HttpResponse, http } from 'msw'

export const authHandlers = [
  http.post('*/api/v1/auth/login', () => {
    return HttpResponse.json(
      { success: true, data: null, message: null, code: null } satisfies ApiResponse<null>,
      {
        headers: {
          'Set-Cookie': [
            'access_token=mock-access-token; Path=/; HttpOnly; SameSite=Lax; Max-Age=900',
            'refresh_token=mock-refresh-token; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800',
          ].join(', '),
        },
      },
    )
  }),

  http.get('*/api/v1/auth/me', () => {
    const data = createAuthResponse({ expires_in: 3600 as unknown as bigint }) as unknown as AuthResponse
    return HttpResponse.json({ success: true, data, message: null, code: null } satisfies ApiResponse<AuthResponse>)
  }),
]
```

```typescript
// index.ts — barrel export
import { assessmentHandlers } from './assessment.handlers'
import { authHandlers } from './auth.handlers'
import { communityHandlers } from './community.handlers'
import { contentHandlers } from './content.handlers'
import { healthHandlers } from './health.handlers'
import { insightsHandlers } from './insights.handlers'
import { learningHandlers } from './learning.handlers'
import { liveSessionHandlers } from './live-session.handlers'
import { notesHandlers } from './notes.handlers'
import { notificationHandlers } from './notification.handlers'
import { topicPerformanceHandlers } from './topic-performance.handlers'
import { upcomingClassesHandlers } from './upcoming-classes.handlers'

export const handlers = [
  ...assessmentHandlers, ...authHandlers, ...communityHandlers, ...contentHandlers,
  ...healthHandlers, ...insightsHandlers, ...learningHandlers, ...liveSessionHandlers,
  ...notesHandlers, ...notificationHandlers, ...topicPerformanceHandlers, ...upcomingClassesHandlers,
]
```

**Conventions:**
- Each domain in its own `*.handlers.ts` file
- Wildcard path `*/api/v1/...` to work with any base URL
- `HttpResponse.json(body, { headers })` for typed responses with custom headers
- `server.use()` for per-test handler overrides
- `server.resetHandlers()` auto-called in `afterEach` (via test setup)

## E2E Tests (Playwright)

**Config:** `apps/web-admin/playwright.config.ts` — two projects: `unit-msw` (mocked) and `real-api` (real backend)

### Mocked E2E

**File:** `apps/web-admin/e2e/dashboard/<name>.spec.ts`

Uses Playwright `page.route()` for mocking (not MSW). Auth via `page.context().addCookies()`.

```typescript
// e2e/dashboard/dashboard-page-sections.spec.ts
import { expect, type Page, test } from '@playwright/test'

async function setupAuthenticatedDashboard(page: Page) {
  // Set auth cookie for SSR auth
  await page.context().addCookies([
    { name: 'jwt_refresh', value: 'mock-refresh-token', domain: 'localhost', path: '/' },
  ])

  // Mock all API endpoints
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { user: { id: 'user-1', email: 'admin@aspiron.test', first_name: 'Admin', last_name: 'User' }, roles: [{ id: 'role-1', name: 'Admin' }], permissions: ['VIEW_ANALYTICS'], expires_in: 3600 } }) })
  })
  await page.route('**/api/v1/admin/insights', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ time_window: { start: '2025-01-01T00:00:00Z', end: '2025-01-31T00:00:00Z' }, insights: [{ id: '1', insight_type: 'quiz_review_pending', severity: 'danger', title: 'Quizzes Pending Review', description: '5 quizzes need your attention', metadata: {}, detected_at: '2025-01-15T10:00:00Z' }], summary: { total: 1, danger: 1, success: 0, neutral: 0, warning: 0, info: 0 }, pagination: { page: 1, limit: 10, total: 1, filtered_total: 1, total_pages: 1 } }) })
  })
  // ... more mocks
}

test.describe('Dashboard — Section Presence & Order', () => {
  test.beforeEach(async ({ page }) => { await setupAuthenticatedDashboard(page) })

  test('renders all 4 dashboard sections', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('System Health')).toBeVisible()
    await expect(page.getByText('Action Required')).toBeVisible()
    await expect(page.getByText('Student Pain Points')).toBeVisible()
    await expect(page.getByText('Upcoming Classes')).toBeVisible()
  })

  test('renders correct visual hierarchy', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const headings = page.locator('h2')
    await expect(headings.nth(0)).toHaveText('System Health')
    await expect(headings.nth(1)).toHaveText('Action Required')
  })
})
```

```typescript
// e2e/dashboard/dashboard-runtime.spec.ts — loading, error, retry
test('shows skeleton while insights load', async ({ page }) => {
  await setupAuth(page)
  await page.route('**/api/v1/admin/insights', async (route) => {
    await new Promise((r) => setTimeout(r, 500)) // delay to catch skeleton
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ insights: [], summary: { total: 0 }, pagination: { page: 1, limit: 10, total: 0 } }) })
  })
  await page.goto('/dashboard')
  await expect(page.locator('.animate-pulse').first()).toBeVisible({ timeout: 300 })
})

test('recovers after retry on failed module', async ({ page }) => {
  await setupAuth(page)
  let insightsFailed = true
  await page.route('**/api/v1/admin/insights', async (route) => {
    if (insightsFailed) {
      insightsFailed = false
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Error' }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ insights: [{ id: '1', insight_type: 'quiz_review_pending', severity: 'danger', title: 'Quizzes Pending Review', description: '5 quizzes need your attention', metadata: {}, detected_at: '2025-01-15T10:00:00Z' }], summary: { total: 1, danger: 1, success: 0, neutral: 0, warning: 0, info: 0 }, pagination: { page: 1, limit: 10, total: 1, filtered_total: 1, total_pages: 1 } }) })
    }
  })
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await page.getByTestId('retry-button').first().click()
  await expect(page.getByText('Quizzes Pending Review')).toBeVisible({ timeout: 5000 })
})
```

```typescript
// e2e/dashboard/dashboard-mobile-runtime.spec.ts — mobile responsiveness
test('sections stack vertically at 375px width', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const viewportWidth = await page.evaluate(() => window.innerWidth)
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5)
})

test('sidebar toggle visible on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-slot="sidebar-trigger"]')).toBeVisible()
})
```

**Mocked E2E conventions:**
- `page.context().addCookies([{ name, value, domain, path }])` for auth
- `page.route('**/api/v1/...', handler)` for all endpoint mocks (not MSW)
- `setupAuthenticatedDashboard(page)` helper pattern
- `beforeEach` for common setup
- `page.setViewportSize()` for mobile tests

### Real API E2E

**File:** `apps/web-admin/e2e/real-api/<name>.spec.ts`

Requires running backend + seeded Postgres. Uses `globalSetup`/`globalTeardown` via `pg` pool.

```typescript
// e2e/real-api/dashboard-health.spec.ts
import { expect, test } from '@playwright/test'
import { seedUser } from './login'

test.describe('Dashboard System Health (Real API)', () => {
  test.beforeEach(async ({ page, context }) => { await seedUser(context, page) })

  test('system health section is visible', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="system-health"]')
    await expect(section).toBeVisible()
  })

  test('shows metric values', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="system-health"]')
    await expect(section.getByText(/756|active students/i).first()).toBeVisible()
  })
})
```

```typescript
// e2e/real-api/dashboard-hydration.spec.ts — SSR hydration check
test('no hydration mismatch warnings in console', async ({ page, context }) => {
  const warnings: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'warning' && msg.text().includes('hydration')) warnings.push(msg.text())
  })
  await seedUser(context, page)
  expect(warnings).toHaveLength(0)
})

test('dashboard source contains SSR-rendered content', async ({ page, context }) => {
  await seedUser(context, page)
  const html = await page.content()
  expect(html).toContain('data-dashboard-section')
})
```

### Visual Regression

**File:** `apps/web-admin/e2e/real-api/dashboard-visual.spec.ts`

```typescript
test.describe('Dashboard Visual Regression (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedUser(context, page)
    await page.waitForLoadState('networkidle')
  })

  test('dashboard layout matches baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard-full.png', {
      maxDiffPixelRatio: 0.05,
    })
  })
})
```

**Real API E2E conventions:**
- `seedUser(context, page)` helper for auth flow + data seeding
- `globalSetup`/`globalTeardown` with direct `pg` pool connection
- Deterministic UUIDs for idempotent cleanup
- Console warning checks for SSR hydration mismatch detection
- `page.content()` for verifying SSR-rendered content
- `expect(page).toHaveScreenshot('name.png', { maxDiffPixelRatio: 0.05 })` for visual regression

## Adding a New Test (Checklist)

### Rust — Unit Test
1. Create file: `apps/backend/tests/unit/<domain>.rs`
2. Add `mod <domain>;` to `apps/backend/tests/unit/mod.rs`
3. Import internal functions directly from `backend::`
4. Write `#[test]` functions with helper factories
5. Verify: `cargo test -p backend --lib unit::`

### Rust — Snapshot Test
1. Create file: `apps/backend/tests/unit/<name>_snapshot.rs`
2. Strip non-deterministic fields before snapshotting
3. Use `insta::assert_json_snapshot!("name", value)`
4. Run `cargo insta review` to accept new snapshots
5. Verify: `cargo test -p backend --lib unit::`

### Rust — Integration Test
1. Create file: `apps/backend/tests/integration/<domain>.rs`
2. Add `mod <domain>;` to `apps/backend/tests/integration/mod.rs`
3. Use `TestApp::new().await`, `create_test_user()`, `app.get()`/`app.post_json()`
4. Assert HTTP status codes + JSON error codes
5. Verify: `cargo test -p backend --test integration`

### Rust — Scenario Test
1. Create file: `apps/backend/tests/scenarios/<name>.rs`
2. Add `mod <name>;` to `apps/backend/tests/scenarios/mod.rs`
3. Use `ScenarioBuilder::new(db).with_user().subject()....build().await`
4. Assert entity creation + HTTP endpoint responses
5. Add helper to `tests/fixtures/helpers.rs` if new entity type
6. Verify: `cargo test -p backend --test scenarios`

### JS/TS — Component Test
1. Create file next to component: `<name>.test.tsx`
2. Hoist mock variables with `vi.hoisted(() => ({ mockFn: vi.fn() }))`
3. Mock all external dependencies: `@aspiron/tanstack-client`, `@tanstack/react-router`
4. Write tests for all states: loading → error (retry) → empty → success
5. Use `render()` from `@/test-utils` (custom render with QueryClientProvider)
6. Use `userEvent.setup()` for interactions
7. Verify: `pnpm --filter web-admin exec vitest run`

### JS/TS — MSW Handler
1. Create file: `apps/web-admin/mock/handlers/<domain>.handlers.ts`
2. Use wildcard `*/api/v1/...` path
3. Use factory functions for response data
4. Add barrel export to `mock/handlers/index.ts`
5. Verify: `pnpm --filter web-admin exec vitest run mock/`

### E2E — Mocked
1. Create file: `apps/web-admin/e2e/dashboard/<name>.spec.ts`
2. Create `setupAuthenticatedDashboard(page)` with `addCookies()` + `page.route()`
3. Write tests with `page.goto()`, `page.waitForLoadState()`, `expect().toBeVisible()`
4. Verify: `pnpm --filter web-admin exec playwright test --project=unit-msw`

### E2E — Real API
1. Create file: `apps/web-admin/e2e/real-api/<name>.spec.ts`
2. Use `seedUser()` from `./login` for auth
3. Write tests against real backend endpoints
4. Add baseline for visual regression tests
5. Verify: `pnpm --filter web-admin exec playwright test --project=real-api`

## Commands Reference

| Command | What |
|---|---|
| `cargo test -p backend --lib unit::` | Rust unit tests |
| `cargo test -p backend --test integration` | Rust integration tests |
| `cargo test -p backend --test scenarios` | Rust scenario tests |
| `cargo insta review` | Review snapshot changes |
| `cargo insta accept` | Accept snapshot changes |
| `pnpm --filter web-admin exec vitest run` | All JS/TS Vitest tests |
| `pnpm --filter web-admin exec vitest --coverage` | Vitest with coverage |
| `pnpm --filter web-admin exec playwright test --project=unit-msw` | Mocked E2E tests |
| `pnpm --filter web-admin exec playwright test --project=real-api` | Real API E2E tests |
| `just test` | All Rust + JS tests in parallel |
