---
title: Student Journey
description: Day 1, daily, and revision workflows
order: 3
section: Introduction
---

> **Current**: This document describes student workflows implemented in the MVP.

# Student Journey

Aspiron supports students through their entire preparation journey—from Day 1 onboarding to final revision before the exam.

## Day 1: Onboarding

### Context Setup

New students begin by selecting their exam context. This selection persists across the entire platform:

- **Exam Type** - State PGT, JEE, or NEET
- **Subject** - Your primary study subject
- **Target Year** - When you're taking the exam
- **Language Preference** - Content language for AI and materials

> **Core**: The context layer is foundational and applies to all features.

### Exam Selection

Aspiron currently focuses on:
- **State PGT** (Post Graduate Teacher) exams
- **JEE** (Joint Entrance Examination)
- **NEET** (National Eligibility cum Entrance Test)

> **Planned**: Aspiron is architecturally exam-agnostic; these exams represent the initial focus, not a hard limitation.

### Initial Assessment (Optional)

Students may take an optional diagnostic assessment to:
- Identify current knowledge level
- Set baseline for progress tracking
- Help AI prioritize what to review first

This assessment does NOT:
- Gate access to content
- Generate a "score" that affects the student
- Compare students to each other

### First Learning Session

After context setup, students are guided to:
1. Browse their syllabus
2. Select their first topic
3. Watch an introductory video
4. Take a practice quiz
5. Create their first timestamped note

---

## Daily Study Flow

A typical study day follows this pattern:

### Morning: New Content

1. **Select Topic**
   - Choose from syllabus based on AI recommendation or self-selection
   - Progress tracking shows completion percentage

2. **Watch Video**
   - Playback speed control (0.5x to 2x)
   - Resume from last position
   - Add bookmarks at important moments
   - Transcript available for search

3. **Take Notes**
   - Create notes while watching (auto-timestamped)
   - Click timestamp to return to exact moment
   - Notes linked to exam, subject, and topic

4. **Practice Quiz**
   - Complete MCQs and numericals for the topic
   - Timer creates exam-like pressure
   - Immediate feedback after submission

### Afternoon: Deep Work

1. **Review Notes**
   - Revisit timestamped notes from morning
   - AI suggests related content

2. **Doubt Resolution**
   - Post questions in peer forum
   - Tag with exam, subject, topic
   - Community Bot may suggest similar answered doubts

### Evening: Active Recall

1. **AI Recall Check** (periodic, not daily)
   - AI asks what you remember from recent topics
   - You explain concepts in your own words
   - AI identifies gaps and suggests review

2. **Revision Mode**
   - Review wrong questions from past quizzes
   - Flashcard-style formula review
   - AI summary of key points

---

## Weekly Cycle

Aspiron is designed for sustainable weekly rhythm:

| Day | Focus |
|-----|-------|
| Monday | New chapter content |
| Tuesday | New chapter content |
| Wednesday | Practice quizzes + note review |
| Thursday | New chapter content |
| Friday | Mixed review + AI Recall Check |
| Saturday | Full mock exam (chapter or section) |
| Sunday | Rest + light revision only |

> **Note**: This is a suggested pattern. Students can customize their schedule.

---

## Monthly Progression

### Syllabus Completion Tracking

Students see:
- Topics completed vs. total
- Time spent per topic
- Subject-wise breakdown

### AI-Generated Insights

Monthly, AI provides:
- Topics most frequently forgotten
- Quiz accuracy trends
- Recommended focus areas for next month

### Milestone Checkpoints

At syllabus completion milestones:
- Diagnostic assessment
- Full mock exam recommendation
- AI study plan for remaining topics

---

## Revision Flow

Revision is where Aspiron differs from other platforms.

### The Revision Problem

Most platforms:
- Show you content to review
- Hope you remember it
- Track completion, not retention

### The Aspiron Solution

1. **AI Tracks Forgetting**
   - Platform knows when you learned each concept
   - AI predicts when you'll start forgetting
   - Proactive nudges for review

2. **Active Recall Over Passive Review**
   - Instead of "read this again," AI asks "explain this"
   - You produce answers, not just recognize them
   - Wrong answers trigger targeted review

3. **Guided, Not Overwhelming**
   - AI doesn't dump 100 topics to review
   - Prioritizes what matters most
   - Breaks revision into manageable chunks

### Revision Mode Access

Students enter revision mode through:
- AI Recall Check notifications
- Wrong questions list
- Formula quick-reference
- AI-generated summaries

---

## Test Day Preparation

Before a mock exam or the real exam:

### Pre-Exam Week

1. **Focus on Weak Areas**
   - AI identifies top 5 topics to review
   - Targeted quizzes on weak concepts
   - Formula flashcards

2. **Full Mock Exam**
   - Simulates real exam conditions
   - AI proctoring active
   - No AI assistance during exam

### Post-Exam Analysis

After each mock exam:
- Accuracy breakdown by topic
- Time management insights
- Mistake patterns identified
- Clear "what to do next" plan

---

## Long-Term Motivation

Aspiron doesn't use streaks or gamification. Instead:

### Progress Visibility

- Visual syllabus completion
- Accuracy trend lines
- Topic mastery indicators

### Community Support

- Peer discussion forum
- Community Bot encouragement
- No public leaderboards

### System Over Motivation

- AI remembers what you forget
- Quizzes appear when they're useful
- Notifications are respectful and rare

---

## Next Steps

- [Design Philosophy](/docs/design-philosophy) - Understand our guiding principles
- [Core Concepts](/docs/core-concepts) - Learn the foundational architecture
- [AI Recall Check](/docs/ai-recall-check) - Understand memory-aware revision
