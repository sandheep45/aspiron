# Backend (Rust) Conventions

## Stack

- Axum 0.8, SeaORM 1.1, PostgreSQL 16+
- All routes under `/api/v1/`
- Docker services: PostgreSQL, Meilisearch, pgAdmin, LocalStack (see `docker-compose.yml`)

## Module structure

Each domain follows a `handler → service → repository` pattern:

```
apps/backend/src/services/<domain>/
├── mod.rs          — declares sub-modules, defines *State struct
├── handler.rs      — Axum handler functions, delegates to service
├── service.rs      — business logic, filtering, sorting, pagination
├── repository.rs   — pure data access via SeaORM
└── state.rs        — (optional, can be in mod.rs)
```

- State struct: `#[derive(Clone)]` with domain services as fields, constructed with `Arc<DatabaseConnection>`
- Handler functions take `Extension(State)`, `Query(params)`, optional `AuthUser(user_id)`
- Return `Result<Json<ResponseType>, AppError>`
- Repository methods use `Entity::find().filter(...).all(&*self.db)` and map errors via `.map_err(AppError::Database)`

## Route registration

Each domain exports `pub fn router(app_state: &AppState) -> Router<AppState>` in its `handler.rs` (or `mod.rs`). Routes are merged in `routes/mod.rs`:

```rust
pub fn api_v1_router(app_state: &AppState) -> Router<AppState> {
    Router::new()
        .merge(health::router(app_state))
        .merge(auth::router(app_state))
        .merge(insights::router(app_state))
        // ...
}
```

All routes are manually tracked via `ROUTE_REGISTRY`.

## DTOs

Location: `apps/backend/src/entries/dtos/response/` and `payload/`.

```rust
#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "PascalCaseName")]
#[serde(rename_all = "snake_case")]
pub struct FooResponse {
    pub id: Uuid,
    #[schema(value_type = String)]
    pub name: String,
    #[ts(optional)]
    pub optional_field: Option<f64>,
    #[schema(value_type = String)]
    #[ts(type = "Date")]
    pub created_at: DateTime<Utc>,
}
```

Enums use `#[serde(rename_all = "snake_case")]` or `"lowercase"`. Flexible metadata uses `serde_json::Value`.

## Error handling

Clippy denies (workspace lint in root `Cargo.toml`):
- `unwrap_used`, `expect_used`, `panic`, `todo`, `dbg_macro`, `print_stdout`, `print_stderr`

Use `AppError` from `setup::error::AppError` for all fallible paths.

## Database

| Command | What |
|---|---|
| `docker compose up -d` | Start PostgreSQL, Meilisearch, pgAdmin, LocalStack |
| `just migrate` | Apply pending migrations |
| `just migrate -- reset` | Reset database |
| `just seed` | Seed database (requires `seed` feature) |
| `just fresh-db` | Reset → migrate → seed |

Migrations live in `apps/migrations` (SeaORM). Seed binary at `apps/backend/src/seeds/main.rs` (requires `--features seed`).

## Type generation (ts-rs)

- Rust DTOs annotated with `#[derive(TS)]` and `#[ts(export)]`
- Run `just generate-types` after DTO changes:
  1. Runs `cargo test -p backend` (ts-rs generates `.ts` files during test execution)
  2. Copies output from `apps/backend/bindings/` to `packages/api-client/src/generated-types/`
  3. Converts relative imports to absolute (`@/generated-types/`)
  4. Generates barrel `index.ts`
  5. Runs `just format-js`
- Never edit generated files manually.
