---
title: Core Concepts
description: Foundational architecture and platform principles
order: 6
section: Core Concepts
---

> **Core**: This document describes Aspiron's foundational architecture and will not change.

# Core Concepts

Aspiron is built on a set of interconnected concepts that work together to support effective learning.

## Platform Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ASPIRON PLATFORM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   CONTEXT    │    │    LEARNING  │    │  ASSESSMENT  │       │
│  │    LAYER     │───▶│   STRUCTURE  │───▶│    SYSTEM    │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                   │                 │
│         │                   │                   │                 │
│         ▼                   ▼                   ▼                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    NOTES SYSTEM                         │    │
│  │   • Teacher Notes    • Student Notes    • External Refs │    │
│  └─────────────────────────────────────────────────────────┘    │
│         │                   │                   │                 │
│         │                   │                   │                 │
│         ▼                   ▼                   ▼                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      AI FEATURES                        │    │
│  │   • Context-Aware Chat    • Recall Check    • Analysis  │    │
│  └─────────────────────────────────────────────────────────┘    │
│         │                   │                   │                 │
│         │                   │                   │                 │
│         ▼                   ▼                   ▼                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   COMMUNITY  │    │    SAFETY    │    │   PROGRESS   │       │
│  │    FORUM     │    │   & INTEGRITY│    │   TRACKING   │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## How Concepts Connect

### Context Layer (Foundation)

Everything starts with context. Students select:
- **Exam** - PGT, JEE, or NEET
- **Subject** - Their primary study subject
- **Target Year** - When they're taking the exam
- **Language** - Content language preference

This context persists across the entire platform.

### Learning Structure

Content is organized as:
- **Subjects** → **Chapters** → **Topics**
- Each piece linked to context
- Progress tracked at each level

### Assessment System

Students demonstrate learning through:
- **Practice Quizzes** - Topic-level feedback
- **Tests** - Chapter/section validation
- **Mock Exams** - Full simulation

### Notes System

Two note types, one unified system:

1. **Teacher Notes** - Official, linked to content
2. **Student Notes** - Personal, timestamped, shareable

Both can reference external content (videos, PDFs).

### AI Features

AI operates within boundaries:

- **Context-Aware Chat** - Knows where you are in content
- **Recall Check** - Tests memory, not recognition
- **Analysis** - Identifies gaps, suggests review

AI never operates during high-stakes assessments.

### Community

Peer support without social noise:

- **Forum** - Doubt resolution, organized by context
- **Community Bot** - Guidance, not replacement
- **Notes Sharing** - Optional, permission-based

### Safety & Integrity

Non-negotiable principles:

- AI disabled during exams
- Copy/paste blocked during tests
- Transparent about what's being monitored
- No punishments in MVP (trust-first)

### Progress Tracking

Multiple views:

- **Student View** - Personal progress, trends
- **Teacher View** - Class progress (later phases)
- **AI Insights** - Pattern recognition, suggestions

---

## Data Flow

### Learning Flow

```
Context Setup → Browse Syllabus → Watch Video → Take Notes → Practice Quiz → AI Insight
```

### Assessment Flow

```
Take Quiz/Test → Immediate Feedback → Post-Test Analysis → AI Recommendations → Targeted Review
```

### Revision Flow

```
AI Recall Check → Identify Gaps → Guided Review → Re-test Weak Areas → Updated Progress
```

### Community Flow

```
Post Doubt → Community Bot Response → Peer Answers → Resolution → Knowledge Shared
```

---

## Why This Architecture

### Student Outcomes First

Every component exists to improve learning outcomes:

- **Context** ensures relevant content
- **Structure** provides clear paths
- **Assessment** validates understanding
- **Notes** capture and link knowledge
- **AI** guides without replacing
- **Community** offers peer support
- **Safety** ensures integrity
- **Progress** motivates through visibility

### Modularity

Each component can evolve independently:

- New assessment types without restructuring
- Enhanced AI without changing structure
- Expanded community features
- Improved progress visualizations

### Scalability

Architecture supports growth:

- New exams can be added (context layer)
- New content types (learning structure)
- New assessment formats (assessment system)
- New AI features (within boundaries)

---

## Key Principles

1. **Context is foundational** - Everything starts here
2. **Retention over completion** - Not watched, but learned
3. **Active recall over passive review** - Produce, don't recognize
4. **AI assists, never replaces** - Human learning is the goal
5. **Community supports, doesn't distract** - Focused peer help
6. **Safety is non-negotiable** - Integrity always

---

## Next Steps

- [Context Layer](/docs/context-layer) - Understand exam persistence
- [Learning Structure](/docs/learning-structure) - See content organization
- [Notes System](/docs/notes-system) - Learn about notes architecture
- [AI Recall Check](/docs/ai-recall-check) - See memory-aware revision
