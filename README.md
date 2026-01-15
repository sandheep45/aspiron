# Aspiron

Student-first learning and productivity platform for competitive exam preparation (State PGT, JEE, NEET).

## Overview

Aspiron is built around the belief that **systems beat motivation**. The platform provides structured learning paths, AI-assisted recall, and community support to help students achieve their exam goals.

### Core Philosophy

- **Student-First Design**: Every feature is designed for the student's actual experience, not administrative convenience
- **Systems Over Motivation**: Build habits and structures that work regardless of daily motivation
- **Context Persistence**: The platform remembers where the student is in their preparation journey
- **Recall-Focused Learning**: Spaced repetition and memory-aware features to maximize retention

## Tech Stack

### Backend (Rust)

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
| **API Documentation** | utoipa |
| **Containerization** | Docker (planned) |
| **CI/CD** | GitHub Actions (planned) |

### Frontend (SvelteKit + TypeScript)

| Component | Technology |
|-----------|------------|
| **Framework** | SvelteKit 2 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Skeleton UI |
| **Markdown** | mdsvex |
| **State Management** | TanStack Query |
| **Theme** | Dark/Light mode support |

## Project Structure

```
aspiron/
├── Cargo.toml                    # Rust workspace config
├── package.json                  # Node.js workspace config
├── pnpm-workspace.yaml           # pnpm monorepo config
├── .env.example                  # Environment template
├── .github/
│   └── workflows/                # CI/CD (future)
├── apps/
│   ├── backend/                  # Rust API server
│   │   ├── src/
│   │   │   ├── main.rs           # Entry point
│   │   │   ├── lib.rs            # Library exports
│   │   │   ├── setup/            # Foundation modules
│   │   │   │   ├── mod.rs
│   │   │   │   ├── config.rs     # Config loading from env
│   │   │   │   ├── error.rs      # Error types + IntoResponse
│   │   │   │   ├── telemetry.rs  # Logging/tracing initialization
│   │   │   │   ├── app.rs        # App struct, router setup, route registry
│   │   │   │   └── openapi.rs    # OpenAPI spec
│   │   │   ├── routes/           # HTTP handlers
│   │   │   │   ├── mod.rs
│   │   │   │   ├── health.rs     # Health check endpoint
│   │   │   │   ├── auth.rs       # Placeholder for auth routes
│   │   │   │   └── users.rs      # Placeholder for user routes
│   │   │   ├── services/         # Business logic (placeholders)
│   │   │   └── middleware/       # Auth middleware (placeholder)
│   │   └── Cargo.toml
│   ├── migrations/               # SeaORM migrations
│   │   ├── src/
│   │   │   ├── lib.rs            # Entity exports
│   │   │   └── main.rs           # Migration runner
│   │   └── Cargo.toml
│   └── documentation/            # SvelteKit documentation site
│       ├── src/
│       │   ├── app.css           # Global styles with Tailwind v4
│       │   ├── app.html          # HTML template
│       │   ├── lib/
│       │   │   ├── components/   # Reusable UI components
│       │   │   │   ├── Header.svelte
│       │   │   │   ├── Sidebar.svelte
│       │   │   │   ├── Callout.svelte
│       │   │   │   └── Search.svelte
│       │   │   ├── docs/         # Documentation content
│       │   │   │   ├── docs.ts   # Navigation configuration
│       │   │   │   └── *.md      # Documentation pages (26 pages)
│       │   │   └── utils/
│       │   │       ├── types.ts
│       │   │       └── search-index.ts
│       │   └── routes/
│       │       ├── +page.svelte         # Homepage
│       │       └── docs/[...slug]/      # Documentation pages
│       ├── static/               # Static assets
│       ├── package.json
│       └── svelte.config.js
├── README.md
└── AGENTS.md                     # AI agent instructions
```

## Features

### Learning Modules

- **Video Learning**: Playback controls, bookmarks, timestamps, transcripts
- **Live Classes**: Scheduled sessions, chat, AI-generated summaries
- **Teacher Notes**: PDF viewer, offline access, structured organization
- **Student Notes**: Personal annotations synced to video timestamps
- **Notes Sharing**: Privacy controls (private/peer/shared/public)

### Assessment

- **Practice Quizzes**: MCQs, numericals, detailed solutions
- **Tests & Mock Exams**: Chapter, section, and full mock exams
- **AI Proctoring**: Soft proctoring with focus scores (no cameras)

### AI Features

- **Context-Aware AI Chat**: Global assistant aware of exam/subject context
- **AI Recall Check**: Memory-aware revision system (key feature)
- **Revision Mode**: Focus on wrong questions, formula review
- **Test Analysis**: Post-test summaries, improvement plans

### Community

- **Peer Forum**: Structured doubt resolution threads
- **Community Bot**: Virtual tutor, emotional support
- **Smart Notifications**: Ethical nudges, recall reminders

### Safety

- **Exam Integrity**: AI disable toggle, copy/paste blocking during tests

## Documentation

The project includes comprehensive documentation at `/docs`:

### Introduction

- [Introduction](/docs/intro) - Platform overview, problem statement, core philosophy
- [MVP Scope](/docs/mvp-scope) - What's included/excluded, 1-year roadmap
- [Student Journey](/docs/student-journey) - Day 1 onboarding, daily flows, revision
- [Design Philosophy](/docs/design-philosophy) - Student-first principles
- [Roadmap](/docs/roadmap) - 5-phase plan (Now → Month 12)

### Core Concepts

- [Core Concepts](/docs/core-concepts) - Architecture overview
- [Context Layer](/docs/context-layer) - Exam/subject/target year persistence
- [Learning Structure](/docs/learning-structure) - Subject → Chapter → Topic hierarchy
- [Notes System](/docs/notes-system) - Teacher/student notes architecture
- [Progress Tracking](/docs/progress-tracking) - Student and teacher views

### Learning

- [Video Learning](/docs/video-learning)
- [Live Classes](/docs/live-classes)
- [Teacher Notes](/docs/teacher-notes)
- [Student Notes](/docs/student-notes)
- [Notes Sharing](/docs/notes-sharing)

### Assessment

- [Practice Quizzes](/docs/practice-quizzes)
- [Tests & Mock Exams](/docs/tests-mock-exams)
- [AI Proctoring](/docs/ai-proctoring)

### AI Features

- [Context AI Chat](/docs/context-ai-chat)
- [AI Recall Check](/docs/ai-recall-check)
- [Revision Mode](/docs/revision-mode)
- [Test Analysis](/docs/test-analysis)

### Community

- [Peer Forum](/docs/peer-forum)
- [Community Bot](/docs/community-bot)
- [Notifications](/docs/notifications)

### Safety

- [Exam Integrity](/docs/exam-integrity)

## Development

### Prerequisites

- Rust 1.75+ (for backend)
- Node.js 20+ (for frontend)
- PostgreSQL 16+ (or Docker)
- pnpm 9+

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment templates
cp apps/backend/.env.example apps/backend/.env

# Build all apps
pnpm build

# Run development server (documentation)
pnpm --filter documentation run dev
```

### Running Individual Apps

```bash
# Run Rust backend
pnpm run-rust backend
# or
cd apps/backend && cargo run

# Run documentation site
pnpm --filter documentation run dev

# Run migrations
cargo run -p migrations
```

### Running Tests

```bash
# All tests
pnpm test

# Backend tests only
cargo test --workspace

# Frontend tests only
pnpm --filter documentation run test
```

## Backend Documentation

### OpenAPI Documentation

The backend uses [utoipa](https://github.com/juhaku/utoipa) to generate OpenAPI 3.0 specifications.

**Available Endpoints:**

| Endpoint | Description |
|----------|-------------|
| `/api-docs/openapi.json` | OpenAPI 3.0 specification in JSON format |
| `/health` | Health check endpoint |

### Environment Variables

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

# Logging
LOG_LEVEL=info       # debug, info, warn, error
LOG_FORMAT=pretty    # pretty (human-readable) or json
```

## Code Style

### Backend (Rust)

- **Linting**: Clippy
- **Formatting**: rustfmt
- **Panics**: Denied in lints
- **Debug**: `dbg!` macro denied in production code

### Frontend

- **Linting**: Biome
- **Formatting**: Prettier
- **TypeScript**: Strict mode enabled

## Implementation Status

### ✅ Phase 1: Foundation (Complete)
- [x] Project structure setup
- [x] Workspace configuration (Rust + Node.js)
- [x] Backend foundation (config, errors, telemetry)
- [x] Health check endpoint
- [x] Route registry
- [x] OpenAPI integration
- [x] Documentation site with 26 pages
- [x] Categorized navigation

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
- [ ] Exam/Subject/Topic routes
- [ ] Video/Notes routes
- [ ] Quiz/Test routes

### ⏳ Phase 5: AI Integration
- [ ] Context-aware chat service
- [ ] Recall check algorithm
- [ ] Test analysis generation
- [ ] Community bot

### ⏳ Phase 6: Testing & CI/CD
- [ ] Unit tests
- [ ] Integration tests
- [ ] GitHub Actions workflow
- [ ] Docker build/push
- [ ] VPS deployment

## License

MIT
