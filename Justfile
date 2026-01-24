set dotenv-load := true
set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

# ==================================================
# Configuration
# ==================================================

RUST_BINDINGS_CRATE := "packages/contracts-rust"
GENERATED_TS_DIR    := "packages/dummy-lib/src"

CACHE_DIR           := ".cache"

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
    cargo run -p storage-migrations {{ARGS}}

add-rust-dep crate package *flags:
    cargo add --package {{crate}} {{package}} {{flags}}

add-rust-dev-dep crate package *flags:
    cargo add --package {{crate}} --dev {{package}} {{flags}}

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

generate-types:
    #!/usr/bin/env bash
    set -euo pipefail

    echo "Generating TS bindings from {{RUST_BINDINGS_CRATE}}..."
    cargo test -p contracts-rust export_bindings

    echo "Refreshing {{GENERATED_TS_DIR}}..."
    rm -rf "{{GENERATED_TS_DIR}}"/*
    mkdir -p "{{GENERATED_TS_DIR}}"

    cp -r "{{RUST_BINDINGS_CRATE}}/bindings/"* "{{GENERATED_TS_DIR}}/"
    echo "TypeScript bindings updated."

watch-types:
    #!/usr/bin/env bash
    set -euo pipefail

    cargo watch \
        -w "{{RUST_BINDINGS_CRATE}}/src" \
        -x "test -p contracts-rust export_bindings" \
        -s "rm -rf {{GENERATED_TS_DIR}}/* && cp -r {{RUST_BINDINGS_CRATE}}/bindings/* {{GENERATED_TS_DIR}}/"

# ==================================================
# Workflows
# ==================================================

build-with-types: generate-types build
test-with-types:  generate-types test
# build-all:        generate-types build
build-all:        build
test-all:         generate-types test



# ==================================================
# Unified Development (Backend + Frontend)
# ==================================================

dev:
    #!/usr/bin/env bash
    set -euo pipefail

    echo "Starting unified development environment…"

    # Start Rust backend
    echo "[backend] starting Rust backend..."
    just run-rust backend &

    RUST_PID=$!

    # Start all frontend apps (JS)
    echo "[frontend] starting frontend apps..."
    just dev-js-all &

    JS_PID=$!

    # Trap Ctrl+C and forward to both processes
    trap "echo 'Stopping development environment…'; kill $RUST_PID $JS_PID; wait; exit 0" INT TERM

    # Wait for both processes
    wait $RUST_PID $JS_PID
