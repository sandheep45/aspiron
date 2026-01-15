# Aspiron Backend

Monorepo containing the Rust backend API and database migrations for the Aspiron project.

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Axum 0.8 |
| **ORM** | SeaORM 1.1 |
| **Database** | PostgreSQL |
| **Async Runtime** | tokio |
| **Logging** | tracing + telemetry |
| **Configuration** | Environment variables |
| **Error Handling** | thiserror + anyhow |
| **Authentication** | JWT (planned) |
| **API Documentation** | utoipa (planned) |
| **Containerization** | Docker (planned) |
| **CI/CD** | GitHub Actions (planned) |

## Project Structure

```
aspiron/
├── Cargo.toml              # Workspace config
├── .env.example            # Environment template
├── .github/
│   └── workflows/          # CI/CD (future)
├── apps/
│   ├── backend/            # Main API server
│   │   ├── src/
│   │   │   ├── main.rs     # Entry point
│   │   │   ├── lib.rs      # Library exports
│   │   │   ├── setup/      # Foundation modules
│   │   │   │   ├── mod.rs
│   │   │   │   ├── config.rs    # Config loading from env
│   │   │   │   ├── error.rs     # Error types + IntoResponse
│   │   │   │   ├── telemetry.rs # Logging/tracing initialization
│   │   │   │   └── app.rs       # App struct, router setup, route registry
│   │   │   ├── routes/     # HTTP handlers
│   │   │   │   ├── mod.rs
│   │   │   │   ├── health.rs    # Health check endpoint
│   │   │   │   ├── auth.rs      # Placeholder for auth routes
│   │   │   │   └── users.rs     # Placeholder for user routes
│   │   │   ├── services/   # Business logic (placeholders)
│   │   │   └── middleware/ # Auth middleware (placeholder)
│   │   └── Cargo.toml
│   └── migrations/         # SeaORM migrations
│       ├── src/
│       │   ├── lib.rs      # Entity exports
│       │   └── main.rs     # Migration runner
│       └── Cargo.toml
└── README.md
```

## Implementation Status

### ✅ Phase 1: Foundation (Complete)
- [x] Project structure setup
- [x] Workspace configuration
- [x] Config loading from environment variables
- [x] Error handling setup (AppError enum)
- [x] Tracing/logging initialization (telemetry module)
- [x] App struct and router setup
- [x] Health check endpoint
- [x] Route registry (routes printed at startup)

### ⏳ Phase 2: Database (Next)
- [ ] User entity
- [ ] Session entity (for JWT blacklist)
- [ ] Migration files
- [ ] Entity sharing between crates

### ⏳ Phase 3: Authentication
- [ ] JWT token creation/verification
- [ ] Bcrypt password hashing
- [ ] Auth routes (register, login, logout)
- [ ] Auth middleware

### ⏳ Phase 4: Core Routes
- [ ] User CRUD endpoints
- [ ] OpenAPI integration
- [ ] Swagger UI

### ⏳ Phase 5: Testing
- [ ] Unit tests
- [ ] Integration tests with testcontainers
- [ ] Mocking dependencies

### ⏳ Phase 6: CI/CD & Deployment
- [ ] GitHub Actions workflow
- [ ] Docker build/push
- [ ] VPS deployment

## Development

### Prerequisites

- Rust 1.75+
- PostgreSQL 16+ (or Docker)

### Setup

```bash
# Install just (task runner)
cargo install just

# Copy environment template
cp .env.example .env
# Edit .env with your database credentials

# Build the project
cargo build --workspace

# Run the backend (using just)
just run-rust backend

# Run migrations (placeholder)
cargo run -p migrations
```

### Running Tests

```bash
cargo test --workspace
```

## Route Registry

The backend includes a global route registry that automatically tracks all registered routes and prints them at startup.

**Example output:**
```
═════════════════════
   Available Routes   
═════════════════════
  GET /api/health
═════════════════════
```

**Registering new routes:**

Routes are registered automatically in `create_app()`:

```rust
pub fn create_app() -> axum::Router {
    let router = axum::Router::new()
        .nest("/api", routes::health::router())
        .nest("/api", routes::users::router())
        .layer(tower_http::trace::TraceLayer::new_for_http())
        .layer(tower_http::cors::CorsLayer::permissive());

    // Routes are automatically registered
    let mut registry = ROUTE_REGISTRY.write().unwrap();
    registry.register("GET", "/api/health");
    registry.register("GET", "/api/users");
    registry.register("POST", "/api/users");
    drop(registry);

    router
}
```

## Environment Variables

```bash
# Server
APP_HOST=0.0.0.0
APP_PORT=8080
APP_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=aspiron

# JWT (future)
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY_HOURS=24
JWT_COOKIE_NAME=jwt

# Logging
LOG_LEVEL=info       # debug, info, warn, error
LOG_FORMAT=pretty    # pretty (human-readable) or json
```

## Code Style

- **Linting**: Clippy (workspace defaults configured)
- **Formatting**: rustfmt (standard)
- **Panics**: Denied in lints
- **Debug**: `dbg!` macro denied in production code

## License

MIT
