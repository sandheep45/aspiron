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
| **Database** | PostgreSQL 16+ |
| **Migrations** | SeaORM Migrations |
| **Seeding** | Custom CLI with progress tracking |
| **Entity Models** | Comprehensive SeaORM entities |
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

### Mobile (React Native + Expo)

| Component | Technology |
|-----------|------------|
| **Framework** | Expo 54+ |
| **Navigation** | Expo Router 6+ |
| **Language** | TypeScript |
| **UI Components** | Expo Vector Icons |
| **Platform Support** | iOS, Android, Web |
| **Development** | Expo Go + Development Build |

## Project Structure

```
aspiron/
├── Cargo.toml                    # Rust workspace config
├── package.json                  # Node.js workspace config
├── pnpm-workspace.yaml           # pnpm monorepo config
├── Justfile                      # Task runner commands
├── .env.example                  # Environment template
├── .github/
│   └── workflows/                # CI/CD (future)
├── apps/
│   ├── backend/                  # Rust API server
│   │   ├── src/
│   │   │   ├── main.rs           # Entry point
│   │   │   ├── lib.rs            # Library exports
│   │   │   ├── entries/          # Core business logic modules
│   │   │   │   ├── mod.rs        # Module exports
│   │   │   │   ├── entities/     # SeaORM entity models
│   │   │   │   │   ├── user.rs
│   │   │   │   │   ├── content_subject.rs
│   │   │   │   │   ├── content_chapter.rs
│   │   │   │   │   ├── content_topic.rs
│   │   │   │   │   ├── content_video.rs
│   │   │   │   │   ├── learning_progress.rs
│   │   │   │   │   ├── learning_notes.rs
│   │   │   │   │   ├── assessment_quiz.rs
│   │   │   │   │   ├── assessment_question.rs
│   │   │   │   │   ├── assessment_attempt.rs
│   │   │   │   │   ├── community_thread.rs
│   │   │   │   │   ├── community_post.rs
│   │   │   │   │   ├── live_session.rs
│   │   │   │   │   ├── live_session_recording.rs
│   │   │   │   │   ├── notification_event.rs
│   │   │   │   │   └── notification_log.rs
│   │   │   │   ├── entitiy_enums/ # Database enums
│   │   │   │   │   ├── user_types.rs
│   │   │   │   │   ├── exam_types.rs
│   │   │   │   │   ├── content_owner_types.rs
│   │   │   │   │   ├── notes_content_type.rs
│   │   │   │   │   ├── learning_recall_question_type.rs
│   │   │   │   │   ├── learning_recall_session_status.rs
│   │   │   │   │   ├── trust_level.rs
│   │   │   │   │   ├── notification_event_type.rs
│   │   │   │   │   └── notification_logs_types.rs
│   │   │   │   ├── dtos/         # Data transfer objects
│   │   │   │   │   ├── payload/  # Request payloads
│   │   │   │   │   └── response/ # Response models
│   │   │   │   └── seeds/        # Database seeding system
│   │   │   │       ├── main.rs   # CLI entry point
│   │   │   │       ├── runner.rs # Seeding engine
│   │   │   │       ├── config.rs # Seeding configuration
│   │   │   │       └── entities/ # Entity-specific seeders
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
│   │   │   ├── lib.rs            # Migration exports
│   │   │   ├── main.rs           # Migration runner
│   │   │   ├── entities/
│   │   │   │   ├── migration/    # Migration files
│   │   │   │   │   ├── m20260120_00000_create_enums.rs
│   │   │   │   │   ├── m20260120_00001_create_auth_tables.rs
│   │   │   │   │   ├── m20260120_00002_create_content_tables.rs
│   │   │   │   │   ├── m20260120_00003_create_learning_tables.rs
│   │   │   │   │   ├── m20260120_00004_create_assessment_tables.rs
│   │   │   │   │   ├── m20260120_00005_create_community_tables.rs
│   │   │   │   │   ├── m20260120_00006_create_live_tables.rs
│   │   │   │   │   └── m20260120_00007_create_notification_tables.rs
│   │   │   │   └── identifiers/  # Table constant definitions
│   │   │   │       ├── mod.rs
│   │   │   │       ├── auth_table.rs
│   │   │   │       ├── content_table.rs
│   │   │   │       ├── learning_table.rs
│   │   │   │       ├── assessment_table.rs
│   │   │   │       ├── community_table.rs
│   │   │   │       ├── live_table.rs
│   │   │   │       └── notification_table.rs
│   │   └── Cargo.toml
│   ├── documentation/            # SvelteKit documentation site
│   │   ├── src/
│   │   │   ├── app.css           # Global styles with Tailwind v4
│   │   │   ├── app.html          # HTML template
│   │   │   ├── lib/
│   │   │   │   ├── components/   # Reusable UI components
│   │   │   │   │   ├── Header.svelte
│   │   │   │   │   ├── Sidebar.svelte
│   │   │   │   │   ├── Callout.svelte
│   │   │   │   │   └── Search.svelte
│   │   │   │   ├── docs/         # Documentation content
│   │   │   │   │   ├── docs.ts   # Navigation configuration
│   │   │   │   │   └── *.md      # Documentation pages (26 pages)
│   │   │   │   └── utils/
│   │   │   │       ├── types.ts
│   │   │   │       └── search-index.ts
│   │   │   └── routes/
│   │   │       ├── +page.svelte         # Homepage
│   │   │       └── docs/[...slug]/      # Documentation pages
│   │   ├── static/               # Static assets
│   │   ├── package.json
│   │   └── svelte.config.js
│   └── mobile-student/          # React Native mobile app
│       ├── app/                  # Expo Router app directory
│       ├── package.json
│       ├── tsconfig.json
│       └── expo.json (generated)
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

#### Required Tools

- **Rust 1.75+** - Backend runtime and compilation
- **Node.js 20+** - Frontend and mobile development toolchain
- **PostgreSQL 16+** - Primary database (or use Docker)
- **pnpm 9+** - Monorepo package manager
- **Just** - Task runner for common development commands

#### Development Tools

- **Docker & Docker Compose** (Recommended) - For easy database setup
  ```bash
  # Alternative to local PostgreSQL installation
  docker-compose up -d postgres
  ```

#### Mobile Development

- **Expo Go App** (iOS/Android) - For testing mobile app development
  - Available on App Store and Google Play Store
- **Expo CLI** (Optional) - For advanced mobile development features
  ```bash
  npm install -g @expo/cli
  ```

#### Version Verification

Verify your setup with these commands:
```bash
# Rust toolchain
rustc --version    # Should be 1.75+
cargo --version

# Node.js ecosystem
node --version      # Should be 20+
pnpm --version      # Should be 9+

# Database
psql --version      # Should be 16+  (if using local PostgreSQL)
docker --version    # If using Docker

# Task runner
just --version

# Optional mobile tools
npx expo --version  # If Expo CLI installed
```

#### Installation Quick Reference

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Node.js (using fnm for version management)
curl -fsSL https://fnm.vercel.app/install | bash
fnm install 20
fnm use 20

# Install pnpm
npm install -g pnpm@latest

# Install Just (Ubuntu/Debian)
sudo apt install just

# Install Just (macOS)
brew install just

# Install Docker & Docker Compose
# Visit: https://docs.docker.com/get-docker/
```

### Setup

```bash
# Option 1: Use the convenience command (recommended)
# This generates SSL certificates, installs dependencies, and sets up the database
just setup

# Option 2: Manual setup
# Install all dependencies (including mobile)
pnpm install

# Copy environment templates
cp .env.example .env

# Build all packages (config, api-client, tanstack-client)
just build-packages

# Set up database
just migrate
just seed  # Seed development data

# Start development servers
just run-rust backend
just dev-js web-admin
```

### Running Individual Apps

```bash
# Rust backend
just run-rust backend

# Documentation site
just dev-js documentation

# Mobile app (requires Expo Go)
just dev-mobile

# Database Setup & Operations

## Quick Start Commands
```bash
# Full setup: generates SSL certs, installs deps, sets up database
just setup

# To setup fresh database:
just migrate
just seed

# To reset database completely:
just migrate -- reset
just migrate
just seed

# Or use the convenience workflow:
just fresh-db  # Does all three commands above
```

## Individual Commands
```bash
just migrate         # Run pending migrations (or any migration command)
just seed            # Seed all development data
just seed rbac       # Seed RBAC system (roles, permissions, assignments)
just seed users       # Seed only users with role assignments
just seed content     # Seed only content hierarchy (subjects/chapters/topics/videos)
just seed assessments # Seed only quizzes and questions
just seed community   # Seed only forum threads and posts
```

## Setup Workflows
```bash
just setup           # Full setup: SSL certs + install + migrate + seed
just fresh-db        # Reset database (migrate reset + migrate + seed)
just setup-dev       # Full development setup (install + migrate + seed)
```
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

## Database Architecture

### Entity System

The platform uses a comprehensive SeaORM entity system organized into logical domains:

#### Core Entities
- **User**: Student and teacher accounts with role-based access
- **Content**: Subject → Chapter → Topic → Video hierarchy
- **Learning**: Progress tracking, notes, and recall sessions
- **Assessment**: Quizzes, questions, and attempt tracking
- **Community**: Threads, posts, and bot interactions
- **Live**: Sessions and recordings
- **Notifications**: Events and delivery logs

#### Database Enums
- **User Types**: Student, Teacher, Admin
- **Exam Types**: PGT, JEE, NEET, etc.
- **Content Owner Types**: System, Teacher, Student
- **Learning Recall Types**: Multiple choice, Numerical, Short answer
- **Notification Types**: System, Learning, Community, Assessment

### Migration System

The database uses SeaORM migrations with a structured approach:

```bash
# Migration files (chronological order)
m20260120_00000_create_enums.rs          # Database enums
m20260120_00001_create_user_tables.rs   # Users and sessions
m20260120_00002_create_content_tables.rs # Content hierarchy
m20260120_00003_create_learning_tables.rs # Learning data
m20260120_00004_create_assessment_tables.rs # Assessments
m20260120_00005_create_community_tables.rs # Community features
m20260120_00006_create_live_tables.rs     # Live sessions
m20260120_00007_create_notification_tables.rs # Notifications
m20260120_00008_create_rbac_enums.rs     # RBAC enums
m20260120_00009_create_roles_table.rs     # Roles table
m20260120_00010_create_permissions_table.rs # Permissions table
m20260120_00011_create_role_permissions_table.rs # Role-permission assignments
m20260120_00012_create_user_roles_table.rs # User-role assignments
m20260120_00013_create_audit_logs_table.rs # Audit logging
m20260120_00014_create_resource_permissions_table.rs # Resource-level permissions
m20260120_00015_create_user_sessions_table.rs # User sessions
m20260120_00016_create_user_profiles_table.rs # User profiles
```

### Seeding System

A comprehensive CLI-based seeding system for development data:

```bash
# Seed all development data
just seed

# Seed specific categories
just seed rbac          # RBAC system (roles, permissions, assignments)
just seed users         # User accounts with role assignments
just seed content       # Content hierarchy (subjects/chapters/topics/videos)
just seed assessments   # Quizzes and questions
just seed community     # Forum threads and posts

# Validate data integrity
just seed validate --deep
```

**Seeding Features:**
- RBAC system seeding with role-permission assignments
- Automatic role assignment to users based on user type
- Batch processing with configurable sizes
- Progress indicators for large datasets
- Data integrity validation
- Transaction-based operations
- Modular entity-specific seeders

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

### ✅ Phase 2: Database (Complete)
- [x] Complete SeaORM entity system (15+ entities)
- [x] Database enums (8+ enum types)
- [x] Migration files (8 comprehensive migrations)
- [x] Entity sharing between crates
- [x] Comprehensive seeding system with CLI
- [x] Data integrity validation
- [x] Batch processing and progress tracking
- [x] Table identifiers and relationships

### ⏳ Phase 3: Authentication (Next)
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

### 🚀 Phase 7: Mobile App (Started)
- [x] Expo React Native setup
- [x] TypeScript configuration
- [x] Navigation structure
- [ ] Student-specific features
- [ ] API integration
- [ ] Offline capabilities

## License

MIT
