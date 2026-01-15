---
title: MVP Scope
description: What exists and what is intentionally excluded
order: 2
section: Introduction
---

> **Core**: This document describes intentional scope decisions that define Aspiron's MVP boundaries.

# MVP Scope

This document outlines what exists in the Aspiron MVP and what is intentionally excluded.

## What's Included

### Core Learning (Current)

- **Video Learning**
  - Topic-wise recorded videos
  - Playback speed control
  - Resume from last watched position
  - Bookmarks
  - Video transcripts (for AI and search)

- **Live Classes** (Limited MVP)
  - Scheduled live classes
  - One-way video (teacher → students)
  - Live text chat
  - Auto-recording
  - AI-generated class summaries and key points

- **Teacher Notes & PDFs**
  - Official teacher-provided notes
  - PDF viewer with zoom and scroll
  - Offline access
  - Linked to topics and videos

### Student Notes (Current)

- **Personal Notes**
  - Create notes while watching videos (auto timestamp)
  - Create notes while reading PDFs
  - Create notes while solving quizzes
  - Click timestamp to jump to video position
  - Notes linked to exam, subject, and topic

- **Notes Sharing**
  - Private notes (only you)
  - Public notes (read-only for community)
  - Share with peers
  - Share to discussion forum
  - Clear separation: Teacher notes vs Student notes

### Assessment (Current)

- **Practice Quizzes**
  - MCQs and numerical questions
  - Topic and chapter-wise
  - Timer-based
  - Step-by-step solutions (after submission)
  - AI explanations (post-submit only)

- **Tests & Mock Exams**
  - Chapter tests
  - Sectional tests
  - Full-length mock exams
  - Real exam-like UI
  - AI strictly disabled during exams

- **AI Proctoring** (Soft)
  - Monitors tab switching
  - Detects unusual answer speed
  - Flags excessive pauses
  - Outputs focus score and integrity indicators
  - No punishments in MVP (trust-first approach)

### AI Features (Guided, Not Autonomous) (Current)

- **Context-Aware AI Chat**
  - Available across videos, notes, and quizzes
  - Knows your timestamp in videos
  - Knows your notes (teacher and student)
  - Contextual explanations
  - Can convert explanations into notes

- **AI Recall Check** (Memory-Aware Revision)
  - Periodically asks what you remember from old lessons
  - No MCQs, no marks—just explain in your own words
  - Evaluates remembered, partially forgotten, and forgotten concepts
  - Provides exact video links, relevant notes, and focused quizzes
  - Makes revision guided, not overwhelming

- **Revision Mode**
  - Wrong questions list
  - Important formulas and key points
  - Student notes + AI summaries together
  - Quick access to re-learning resources

- **Post-Test AI Summary**
  - Accuracy analysis
  - Time management insights
  - Mistake patterns
  - Clear "what to do next" with links to videos, notes, quizzes, and tests

### Community (Current)

- **Peer Discussion Forum**
  - Exam → Subject → Topic based threads
  - Text and image doubts
  - Attach video timestamps and notes
  - Upvotes
  - Manual moderation (POC)

- **Community Bot** (Virtual Tutor + Guardian)
  - Summarizes long threads
  - Detects duplicate doubts
  - Nudges unanswered questions
  - Encourages peer replies
  - Asks guiding questions instead of giving answers
  - Provides hints, not solutions
  - Normalizes struggle ("You're not alone")
  - Notices stuck or disengaged students privately
  - Suggests recall checks, relevant resources, or live class escalation

### Progress & Context (Core)

- **Exam Selection**
  - PGT / JEE / NEET (focused scope for MVP, additional exams in future phases)

- **Subject Selection**

- **Target Year**

- **Language Preference**

- **Context persists across** AI, content, tests, notifications, and community

- **Basic Progress Tracking**
  - Syllabus completion percentage
  - Quiz and test attempts
  - Accuracy trends
  - Basic topic mastery view

### Notifications (Current)

- **Smart Notifications**
  - Curiosity-based nudges
  - Recall Check reminders
  - Progress reinforcement
  - Light loss-aversion phrasing
  - Strict anti-spam rules

### Safety (Core)

- **Exam Integrity**
  - AI disabled during exams
  - Copy and paste blocked
  - Explanations only after submission
  - Transparency to students

### Platforms (Current)

- **Mobile Apps**
  - iOS and Android apps
  - Access to all learning features on mobile

- **Teacher/Admin Dashboards**
  - Teacher tools for content management
  - Admin tools for platform management
  - Student progress visibility for teachers

### Monetization (Will implement this feature soon)

- **Payment/Gating** - All features free during early MVP, monetization designed in later phases

- **School/Institution Integration** - Individual student focus in early MVP, B2B integration for later phases

---

## What's Intentionally Excluded

### No Gamification (Core Decision)

- No points, badges, or leaderboards
- No streaks or streak-based motivation
- No "competitive" features between students

### No Social Features (Core Decision)

- No profiles with followers or following
- No likes, comments, or reactions
- No sharing to external social media
- No viral or shareable content mechanics

### No Full AI Autonomy (Core Decision)

- AI cannot take tests for students
- AI cannot generate answers during exams
- AI does not "force" studying
- AI suggestions are always advisory, never mandatory

---

### Advanced AI Features (Planned - Future Phases)

- Personalized study paths
- AI-generated practice questions
- Predictive performance modeling
- Adaptive difficulty scaling

---

## Why These Exclusions

The MVP is designed to prove **learning outcomes**, not engagement metrics.

Excluded features are either:

- **Distractions** from actual learning
- **Unproven** to improve retention
- **Out of scope** for proving core value proposition

---

## Future Phases Will Include (Planned)

- Advanced AI features (personalized study paths)
- Subscription and monetization model
- School and institution integration
- Offline mode
- Peer study groups
- AI-generated practice questions
- Advanced analytics and predictions

---

## Next Steps

- [Student Journey](/docs/student-journey) - See how students use Aspiron daily
- [Design Philosophy](/docs/design-philosophy) - Understand our guiding principles
- [Core Concepts](/docs/core-concepts) - Learn the foundational architecture
