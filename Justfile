set dotenv-load := true
set shell := ["bash", "-eu", "-o", "pipefail", "-c"]
set windows-shell := ["powershell", "-c"]

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
    pnpm -r install

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
    just build-all

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
    pnpm --parallel build

test-js:
    pnpm test --workspaces

dev-js app:
    pnpm --filter {{app}} dev

start-js app:
    pnpm --filter {{app}} start

build-js-app app:
    pnpm --filter {{app}} build

dev-js-all:
    pnpm --parallel dev

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
    echo "Building Rust…"
    cargo build

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
seed type="all":
    cargo run -p {{BACKEND_PACKAGE}} --features seed --bin seed -- {{type}} --progress

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
# Generate TypeScript types from Rust DTOs for frontend consumption

generate-types:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "🚀 Generating TypeScript bindings from Rust DTOs..."
    cargo test -p backend -- --nocapture
    echo "📦 Copying bindings to api-client..."
    cp -r apps/backend/bindings/* packages/api-client/src/generated-types/
    rm -rf apps/backend/bindings

    for f in packages/api-client/src/generated-types/*.ts; do
        if [ -f "$f" ] && [ "$(basename "$f" .ts)" != "index" ]; then
            sed -i "s|from '\./\([^']*\)'|from '@/generated-types/\1'|g" "$f"
            sed -i "s|from \"\./\([^\"]*\)\"|from \"@/generated-types/\1\"|g" "$f"
        fi
    done

    for f in packages/api-client/src/generated-types/*.ts; do
        if [ -f "$f" ] && [ "$(basename "$f" .ts)" != "index" ]; then
            sed -i 's|// This file was generated by \[ts-rs\](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.|// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs).\n// Relative imports converted to absolute imports by generate-types recipe. DO NOT EDIT.|' "$f"
        fi
    done

    cd packages/api-client/src/generated-types && \
    rm -f index.ts && \
    echo "// Generated by ts-rs - DO NOT EDIT" > index.ts && \
    echo "export type { Uuid } from '@/generated-types/uuid'" >> index.ts && \
    for f in *.ts; do \
        name=$(basename "$f" .ts); \
        if [ "$name" != "index" ] && [ "$name" != "uuid" ]; then \
            echo "export type { $name } from '@/generated-types/$name'" >> index.ts; \
        fi; \
    done
    just format-js
    echo "✅ TypeScript bindings generated successfully!"
    echo "📂 Location: packages/api-client/src/generated-types/"

watch-types:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "🔍 Watching Rust DTOs for changes and regenerating TypeScript..."
    echo "Press Ctrl+C to stop watching."
    cd /home/lnxdev9/zenith/dev/aspiron && \
    cargo watch -s 'cargo test -p backend -- --nocapture' -s 'cp -r apps/backend/bindings/* packages/api-client/src/generated-types/' -s 'rm -rf apps/backend/bindings' -s 'for f in packages/api-client/src/generated-types/*.ts; do if [ -f "$f" ] && [ "$(basename "$f" .ts)" != "index" ]; then sed -i "s|from '"'"'\./\([^'"'"']*\)'"'"'|from '"'"'@/generated-types/\1'"'"'|g" "$f"; sed -i "s|from \"\./\([^\"]*\)\"|from \"@/generated-types/\1\"|g" "$f"; fi; done' -s 'for f in packages/api-client/src/generated-types/*.ts; do if [ -f "$f" ] && [ "$(basename "$f" .ts)" != "index" ]; then sed -i '"'"'s|// This file was generated by \[ts-rs\](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.|// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs).\n// Relative imports converted to absolute imports by generate-types recipe. DO NOT EDIT.|'"'"' "$f"; fi; done' -s 'cd packages/api-client/src/generated-types && rm -f index.ts && echo "// Generated by ts-rs - DO NOT EDIT" > index.ts && echo "export type { Uuid } from '"'"'@/generated-types/uuid'"'"'"'"' >> index.ts && for f in *.ts; do name=$(basename "$f" .ts); if [ "$name" != "index" ] && [ "$name" != "uuid" ]; then echo "export type { $name } from '"'"'@/generated-types/$name'"'"'"'"' >> index.ts; fi; done'

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
