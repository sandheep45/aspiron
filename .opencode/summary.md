## Goal
- Complete Recall Insights intelligence dashboard with all test layers per TESTING.md conventions, including E2E (mocked), E2E (real API), and visual regression.

## Constraints & Preferences
- Playwright `page.route()` patterns use `*` wildcards, NOT `:param` named segments.
- Mocked E2E must use a real seeded topic ID (`30000000-0000-0000-0000-000000000041`) so the SSR loader succeeds against the running backend.
- `derive_overall_status` threshold: ≥70 → "Strong Recall", ≥45 → "Medium Recall", <45 → "Weak Recall".
- New Playwright projects in `playwright.config.ts` follow the exact `webServer` pattern from existing MSW projects.
- Empty state mocks return `JSON.stringify(null)` with 200 (not 404), so TanStack Query hooks get falsy `data` without `isError`.
- Visual regression uses `maxDiffPixelRatio: 0.05`.
- Dark enterprise design system matching existing pages.

## Progress
### Done
- **Mocked E2E** — `apps/web-admin/e2e/recall-insights/recall-insights.spec.ts`: 21 tests across 5 describe blocks (Section Presence 12, Content Details 4, Empty States 2, Key Insight Card 1, Loading & Error States 2). Uses `page.route('**/api/v1/topics/*/recall/free-response')` (not `free-recall` — the backend endpoint is `/free-response`). 6 mock endpoints + `auth/me`. All 21 tests pass.
- **Real API E2E** — `apps/web-admin/e2e/real-api/recall-insights.spec.ts`: 7 tests using `loginAsCDAdmin`, topic `30000000-0000-0000-0000-000000000041` (CD Quadratic Equations with seeded recall data), hydration mismatch check.
- **Visual regression** — `apps/web-admin/e2e/real-api/recall-insights-visual.spec.ts`: 1 test, screenshot baseline `recall-insights-full.png`, `maxDiffPixelRatio: 0.05`.
- **Playwright config** — Added `recall-insights-msw` project with `testDir: './e2e/recall-insights'` and identical `webServer` to other MSW projects.
- **Empty state mock fix** — Root cause: mock URL used `free-recall` but backend endpoint is `free-response`. The mock never matched, so requests fell through to the real backend showing populated data. Fixed by correcting URL to `free-response` in all 3 mock setups.

### In Progress
- None (all mocked E2E tests pass)

### Blocked
- Real API + visual regression tests — need a running backend with seeded data. The `webServer` in the MSW project starts the frontend only; the real API tests expect the backend to be up separately.
- (Rust integration and scenario tests remain blocked on Docker/testcontainers running.)

## Key Decisions
- Switched all `page.route()` patterns from `:topicId` named params to `*` wildcards — Playwright glob matching does not support `:param` syntax in route URL patterns, only `*`, `**`, `?`.
- Used real seeded topic ID `30000000-0000-0000-0000-000000000041` instead of a fake `test-topic` so SSR loader hits the real backend successfully.
- Empty state mocks return `JSON.stringify(null)` with 200 (not 404) — `null` body is valid JSON, Axios parses it as `response.data = null`, TanStack Query stores `data: null`, component treats falsy data as empty state (not error state).
- `.first()` required on `td` locators because "Gauss's Law Statement" and "Flux Calculation" appear in both the question performance table and the memory gap table.

## Next Steps
1. Run `pnpm biome check .` for lint/format compliance.
2. Optionally, run real API E2E tests against a backend with seeded CD Quadratic Equations data.

## Critical Context
- PostgreSQL enum `learning_recall_question_type` has values `'mcq'` and `'reflection'` (NOT `"MCQ"` or `"FreeResponse"`).
- Rust handlers use `LearningRecallQuestionTypeEnum::MCQ` and `LearningRecallQuestionTypeEnum::REFLECTION` — never string literals.
- `derive_recall_status` threshold: ≥0.7 → Remembered, ≥0.4 → Partial, <0.4 → Forgotten.
- `derive_memory_decay` threshold: ≥70 → stable, ≥45 → degrading, <45 → critical.
- `derive_overall_status` threshold: ≥70 → Strong Recall, ≥45 → Medium Recall, <45 → Weak Recall.
- `derive_mismatch_alert` trigger: confidence ≥0.7 AND correctness <0.4, OR confidence <0.3 AND correctness ≥0.7.
- `count` and `attempts` fields in TS types are `bigint` from ts-rs but factories use `as unknown as bigint` cast (JSON numbers).
- Route file: `apps/web-admin/src/routes/_private-routes/content/_content-layout/topic/$id/recall-insights.tsx`.
- SSR loader cannot be intercepted by `page.route()` — must hit real backend. Mocked E2E tests rely on a running local backend.

## Relevant Files
- `apps/web-admin/e2e/recall-insights/recall-insights.spec.ts`: 21 mocked E2E tests (section presence, content details, key insight, empty states, loading/error) — all passing.
- `apps/web-admin/e2e/real-api/recall-insights.spec.ts`: 7 real API E2E tests.
- `apps/web-admin/e2e/real-api/recall-insights-visual.spec.ts`: 1 visual regression test.
- `apps/web-admin/playwright.config.ts`: Added `recall-insights-msw` project.
- `apps/web-admin/src/features/recall-insights/components/*.tsx`: 10 sub-components (previously done).
- `apps/web-admin/src/features/recall-insights/components/*.test.tsx`: 11 test files (previously done).
- `apps/backend/src/http/handlers/recall_insights.rs`: 6 handlers + 4 pure helper functions (previously done).
- `apps/backend/tests/unit/recall_insights.rs`: 13 unit tests (previously done).
- `apps/web-admin/mock/factories/recall-insights.factory.ts`: 12 builder functions (previously done).
