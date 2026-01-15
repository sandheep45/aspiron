---
title: Context Layer
description: Exam, subject, and target year persistence
order: 7
section: Core Concepts
---

> **Core**: This document describes the context layer, which is foundational to Aspiron's architecture.

# Context Layer

The context layer is Aspiron's foundational architecture. It ensures every feature knows who you are and what you're preparing for.

## What Is Context?

Context is the set of parameters that define a student's learning journey:

- **Exam Type** - State PGT, JEE, or NEET
- **Subject** - Primary study subject
- **Target Year** - When the exam is scheduled
- **Language Preference** - Content language for AI and materials

## Why Context Matters

### The Problem Without Context

In most learning platforms:

- AI doesn't know which exam you're preparing for
- Videos aren't filtered by your subject
- Quizzes don't match your exam pattern
- You constantly re-explain your situation

### The Aspiron Solution

Context is foundational. Everything starts with it.

## Context Initialization

### Onboarding Flow

New students go through context setup:

1. **Select Exam**
   - PGT (Post Graduate Teacher)
   - JEE (Joint Entrance Examination)
   - NEET (National Eligibility cum Entrance Test)

2. **Select Subject**
   - Filtered by exam (different subjects available per exam)

3. **Set Target Year**
   - Determines content relevance and urgency

4. **Choose Language**
   - Content language for AI and materials

### Context Persistence

Once set, context persists across:

- Video recommendations
- Quiz generation
- AI chat interactions
- Note organization
- Forum threads
- Progress tracking
- Notification prioritization

## Context in Action

### Videos

```
Exam: JEE + Subject: Physics + Target: 2026
→ Shows: JEE Physics videos
→ Hides: NEET Physics, JEE Chemistry
```

### Quizzes

```
Exam: NEET + Subject: Biology + Target: 2026
→ Generates: NEET-style MCQs
→ Timing: NEET exam duration
→ Pattern: NEET marking scheme
```

### AI Chat

```
User asks: "Explain this concept"
AI knows: Exam=JEE, Subject=Physics, Target=2026
→ Explains in JEE context
→ Uses Physics terminology
→ Links to relevant JEE topics
```

### Notes

```
Student creates note
→ Automatically tagged with: Exam, Subject, Topic
→ Organized by context
→ Shareable within same context
```

### Forum

```
User posts doubt
→ Posted to: Exam → Subject → Topic
→ Viewable by: Same exam/subject students
→ Answered by: Peers with same context
```

## Context and AI

### How AI Uses Context

- **Recall Check** - Asks about concepts relevant to your exam
- **Chat** - Explains in your exam's context
- **Recommendations** - Suggests content you need for your exam
- **Analysis** - Identifies gaps specific to your exam pattern

### AI Boundaries

AI never:
- Mixes content from wrong exams
- Recommends irrelevant topics
- Ignores your target year

## Changing Context

### Can Students Change Context?

Yes. Students can update:

- **Subject** - If preparing multiple subjects
- **Target Year** - If exam date changes
- **Language** - If preference changes

### Cannot Change

- **Exam Type** - Once selected, locked for that account

> **Planned**: Multi-exam support may come in future phases.

## Context and Privacy

### What Context Stores

- Exam selection
- Subject choice
- Target year
- Language preference

### What Context Does NOT Store

- Personal identifying information
- Learning data (stored separately)
- Progress data (stored separately)

### Data Isolation

Context is separate from:

- **Progress Data** - What's been completed
- **Performance Data** - Quiz scores, accuracy
- **Behavioral Data** - Time spent, patterns

## Context and Teachers

### Teacher Context

Teachers see context when:

- Viewing student progress
- Creating content
- Answering forum doubts

### Teacher Content

Teachers create content within their context:

- Videos tagged with exam/subject
- Notes linked to specific syllabus
- Quizzes matching exam pattern

## Future Context Expansion

### Planned Additions

- **Multiple Exams** - Prepare for more than one exam
- **Custom Contexts** - Institution-specific contexts
- **Dynamic Context** - Context that evolves with progress

### Core Principle

Context will always remain:

- Foundational to architecture
- Privacy-respecting
- Learning-focused

---

## Next Steps

- [Learning Structure](/docs/learning-structure) - See how content is organized
- [Notes System](/docs/notes-system) - Learn about notes architecture
- [AI Recall Check](/docs/ai-recall-check) - See context-aware revision
- [Progress Tracking](/docs/progress-tracking) - Understand metrics
