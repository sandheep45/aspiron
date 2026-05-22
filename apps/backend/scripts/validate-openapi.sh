#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
COMMITTED="$PROJECT_DIR/apps/backend/openapi/openapi.json"
GENERATED="/tmp/openapi-regenerated.json"

# Backup the committed spec
cp "$COMMITTED" "$GENERATED"

echo "Regenerating OpenAPI spec..."
cargo run -p backend --bin backend -- --generate-openapi 2>/dev/null

echo "Checking for differences..."
if ! diff -q "$COMMITTED" "$GENERATED" >/dev/null 2>&1; then
  echo "ERROR: OpenAPI spec is stale."
  echo "Run 'just generate-openapi' and commit the updated openapi.json."
  exit 1
fi

echo "OpenAPI spec is up to date."
