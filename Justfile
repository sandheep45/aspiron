set dotenv-load := true
set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

# ==================================================
# Configuration
# ==================================================

# Rust packages
BACKEND_PACKAGE := "backend"
MIGRATIONS_PACKAGE := "migrations"

# Frontend apps
DOCUMENTATION_APP := "documentation"
MOBILE_APP := "mobile-student"

# Directories
CACHE_DIR := ".cache"

# ==================================================
# Default / Help
# ==================================================

default:
    just --list

# ==================================================
# Setup / Install
# ==================================================

install:
    just install-js-all

install-js-all:
    pnpm -r --parallel install

install-js app:
    pnpm --filter {{app}} install

# ==================================================
# Formatting
# ==================================================

format:
    just format-rust
    just format-js

format-rust:
    cargo fmt --all

format-js:
    pnpm biome format . --write

# ==================================================
# Linting
# ==================================================

lint:
    just lint-rust
    just lint-js

lint-rust:
    cargo clippy --all-targets --all-features -- -D warnings

lint-js:
    pnpm biome lint .

# ==================================================
# Static Checks (no mutation)
# ==================================================

check:
    just check-rust
    just check-js

check-rust:
    cargo check --all-targets --all-features

check-js:
    pnpm biome check .

# ==================================================
# CI
# ==================================================

ci:
    just format
    just lint
    just check

# ==================================================
# Build / Test (Parallel + Cached)
# ==================================================

build:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Running Rust + JS builds in parallel…"
    just build-rust &
    just build-js &
    wait

test:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Running Rust + JS tests in parallel…"
    just test-rust &
    just test-js &
    wait

clean:
    rm -rf node_modules {{CACHE_DIR}}
    cargo clean

# ==================================================
# JavaScript / TypeScript (Workspace)
# ==================================================

build-js:
    #!/usr/bin/env bash
    set -euo pipefail
    CACHE_DIR=".cache"
    mkdir -p "$CACHE_DIR"

    if [[ ! -f "$CACHE_DIR/js-build.stamp" || pnpm-lock.yaml -nt "$CACHE_DIR/js-build.stamp" ]]; then
        echo "Building JS (cache miss)…"
        pnpm -r --parallel build
        touch "$CACHE_DIR/js-build.stamp"
    else
        echo "Skipping JS build (cache hit)"
    fi

test-js:
    pnpm test --workspaces

dev-js app:
    pnpm --filter {{app}} dev

start-js app:
    pnpm --filter {{app}} start

build-js-app app:
    pnpm --filter {{app}} build

dev-js-all:
    pnpm -r --parallel dev

# ==================================================
# Mobile App (Expo)
# ==================================================

dev-mobile:
    pnpm --filter {{MOBILE_APP}} start

build-mobile:
    pnpm --filter {{MOBILE_APP}} build

build-mobile-android:
    pnpm --filter {{MOBILE_APP}} build:android

build-mobile-ios:
    pnpm --filter {{MOBILE_APP}} build:ios

build-mobile-web:
    pnpm --filter {{MOBILE_APP}} build:web

test-mobile:
    pnpm --filter {{MOBILE_APP}} test

# ==================================================
# JavaScript App Scaffolding
# ==================================================

create-react appDir appName:
    pnpm create vite {{appDir}}/{{appName}}


create-expo-app appDir appName:
    pnpm create expo-app {{appDir}}/{{appName}}

create-next appDir appName:
    pnpm create next-app {{appDir}}/{{appName}}

create-nest appDir appName:
    pnpm dlx @nestjs/cli new {{appDir}}/{{appName}}

# ==================================================
# Rust
# ==================================================

build-rust:
    #!/usr/bin/env bash
    set -euo pipefail
    CACHE_DIR=".cache"
    mkdir -p "$CACHE_DIR"

    if [[ ! -f "$CACHE_DIR/rust-build.stamp" || Cargo.lock -nt "$CACHE_DIR/rust-build.stamp" ]]; then
        echo "Building Rust (cache miss)…"
        cargo build
        touch "$CACHE_DIR/rust-build.stamp"
    else
        echo "Skipping Rust build (cache hit)"
    fi

test-rust *ARGS:
    cargo test {{ARGS}}

run-rust app *ARGS:
    cargo run -p {{app}} {{ARGS}}

run-rust-migration *ARGS:
    cargo run -p {{MIGRATIONS_PACKAGE}} {{ARGS}}

add-rust-dep crate package *flags:
    cargo add --package {{crate}} {{package}} {{flags}}

add-rust-dev-dep crate package *flags:
    cargo add --package {{crate}} --dev {{package}} {{flags}}

# ==================================================
# Database Management
# ==================================================

# Migration command (unified)
migrate *ARGS:
    cargo run -p {{MIGRATIONS_PACKAGE}} {{ARGS}}

# Database seeding (unified command)
seed type="all" *extra_args:
    cargo run -p {{BACKEND_PACKAGE}} --features seed --bin seed -- {{type}} --progress {{extra_args}}

# Database Management Commands:
# To setup fresh db:  just migrate && just seed
# To reset db:       just reset-db
# Or use workflow:     just fresh-db

# Migration + seeding workflow
fresh-db:
    migrate -- reset
    migrate
    seed

# Setup fresh database (new workflow)
setup-db:
    migrate
    seed

create-rust-app name dir="packages":
    #!/usr/bin/env bash
    set -euo pipefail

    DIR="{{dir}}"
    [[ "$DIR" == dir=* ]] && DIR="${DIR#dir=}"

    case "$DIR" in
        apps|apps/*|packages|packages/*) ;;
        *)
            echo "Error: Directory must start with 'apps' or 'packages'"
            exit 1
            ;;
    esac

    APP_DIR="$DIR/{{name}}"
    [ -d "$APP_DIR" ] && echo "Crate already exists: $APP_DIR" && exit 1

    cargo new "$APP_DIR"

    if ! grep -q "\"$APP_DIR\"" Cargo.toml; then
        sed -i.bak "/members = \[/a\\
        \"$APP_DIR\"," Cargo.toml
        echo "Added $APP_DIR to workspace"
    fi

# ==================================================
# Rust → TypeScript Bindings (ts-rs)
# ==================================================
# Note: This section is preserved for future use when TypeScript bindings are needed
# Currently disabled as no contracts-rust package exists

# generate-types:
#     #!/usr/bin/env bash
#     set -euo pipefail
#     echo "TypeScript bindings generation not yet implemented"

# watch-types:
#     #!/usr/bin/env bash
#     set -euo pipefail
#     echo "TypeScript bindings watching not yet implemented"

# ==================================================
# Workflows
# ==================================================

build-all:        build
test-all:         test

# Full development setup
setup-dev: install migrate seed

# Reset database (full reset workflow)
reset-db: fresh-db



# ==================================================
# Unified Development (Backend + Frontend + Mobile)
# ==================================================

dev:
    #!/usr/bin/env bash
    set -euo pipefail

    echo "Starting unified development environment…"

    # Start Rust backend
    echo "[backend] starting Rust backend..."
    just run-rust backend &

    RUST_PID=$!

    # Start documentation site
    echo "[documentation] starting documentation site..."
    just dev-js documentation &

    DOC_PID=$!

    # Start mobile app (if not already running)
    echo "[mobile] starting mobile app..."
    just dev-mobile &

    MOBILE_PID=$!

    # Trap Ctrl+C and forward to all processes
    trap "echo 'Stopping development environment…'; kill $RUST_PID $DOC_PID $MOBILE_PID; wait; exit 0" INT TERM

    # Wait for all processes
    wait $RUST_PID $DOC_PID $MOBILE_PID

dev-backend-frontend:
    #!/usr/bin/env bash
    set -euo pipefail

    echo "Starting backend + frontend development environment…"

    # Start Rust backend
    echo "[backend] starting Rust backend..."
    just run-rust backend &

    RUST_PID=$!

    # Start documentation site
    echo "[documentation] starting documentation site..."
    just dev-js documentation &

    DOC_PID=$!

    # Trap Ctrl+C and forward to both processes
    trap "echo 'Stopping development environment…'; kill $RUST_PID $DOC_PID; wait; exit 0" INT TERM

    # Wait for both processes
    wait $RUST_PID $DOC_PID
