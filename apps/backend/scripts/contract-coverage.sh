#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
OPENAPI_SPEC="$PROJECT_DIR/apps/backend/openapi/openapi.json"
ROUTE_REGISTRY_SRC="$PROJECT_DIR/apps/backend/src/setup/app.rs"
REPORT_FILE="/tmp/contract-coverage-report.txt"

> "$REPORT_FILE"

echo "============================================" >> "$REPORT_FILE"
echo " Contract Coverage Report" >> "$REPORT_FILE"
echo "============================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

TOTAL=0
COVERED_TESTS=0
COVERED_OPENAPI=0
COVERED_BOTH=0

while read -r line; do
  METHOD=$(echo "$line" | sed -n 's/.*register("\([^"]*\)".*/\1/p')
  PATH_VAL=$(echo "$line" | sed -n 's/.*register("[^"]*", "\([^"]*\)").*/\1/p')

  [ -z "$METHOD" ] && continue

  TOTAL=$((TOTAL + 1))

  # Normalize path for test search
  TEST_QUERY=$(echo "$PATH_VAL" | sed 's|/api/v1/||' | tr '/' '_' | tr '-' '_')
  HAS_TEST=false
  TEST_FILE=$(find "$PROJECT_DIR/apps/backend/tests" -name "*.rs" -exec grep -l "$TEST_QUERY\|${PATH_VAL##*/}" {} \; 2>/dev/null | head -1)
  if [ -n "$TEST_FILE" ]; then
    HAS_TEST=true
    COVERED_TESTS=$((COVERED_TESTS + 1))
  fi

  # Check OpenAPI schema coverage
  HAS_OPENAPI=false
  OPENAPI_PATH=$(echo "$PATH_VAL" | sed 's|{\([^}]*\)}|\1|g')
  if [ -f "$OPENAPI_SPEC" ]; then
    if jq -e ".paths[\"$OPENAPI_PATH\"]" "$OPENAPI_SPEC" > /dev/null 2>&1; then
      HAS_OPENAPI=true
      COVERED_OPENAPI=$((COVERED_OPENAPI + 1))
    fi
  fi

  if $HAS_TEST && $HAS_OPENAPI; then
    STATUS="OK"
    COVERED_BOTH=$((COVERED_BOTH + 1))
  elif $HAS_TEST; then
    STATUS="NO_OPENAPI"
  elif $HAS_OPENAPI; then
    STATUS="NO_TEST"
  else
    STATUS="MISSING"
  fi

  printf " %s %-7s %-50s test=%-5s openapi=%-5s\n" \
    "$STATUS" "$METHOD" "$PATH_VAL" "$HAS_TEST" "$HAS_OPENAPI" >> "$REPORT_FILE"
done < <(grep 'registry.register' "$ROUTE_REGISTRY_SRC")

echo "" >> "$REPORT_FILE"
echo "============================================" >> "$REPORT_FILE"
echo " Summary" >> "$REPORT_FILE"
echo "============================================" >> "$REPORT_FILE"
echo " Total routes:      $TOTAL" >> "$REPORT_FILE"
echo " With tests:        $COVERED_TESTS" >> "$REPORT_FILE"
echo " With OpenAPI:      $COVERED_OPENAPI" >> "$REPORT_FILE"
echo " Both:              $COVERED_BOTH" >> "$REPORT_FILE"

cat "$REPORT_FILE"
echo ""

NO_COVERAGE=$((TOTAL - COVERED_BOTH))
if [ "$NO_COVERAGE" -gt 0 ]; then
  echo " NOTE: $NO_COVERAGE route(s) lack both tests and OpenAPI schemas"
else
  echo " All routes have test + OpenAPI coverage"
fi
