---
title: Notes System
description: Personal and shared notes architecture
order: 9
section: Core Concepts
---

> **Core**: This document describes the notes system architecture in Aspiron.

# Notes System

Aspiron's notes system unifies teacher-provided and student-created notes in a single, context-aware architecture.

## Note Types

### Teacher Notes

Official notes provided by teachers:

- Created by subject matter experts
- Linked to specific topics and videos
- PDF format with offline access
- Structured and verified content

### Student Notes

Personal notes created by students:

- Created while learning (videos, PDFs, quizzes)
- Auto-timestamped with video position
- Linked to exam, subject, and topic
- Private by default

## Note Architecture

```
NOTES SYSTEM
    │
    ├── TEACHER NOTES
    │       │
    │       ├── PDF Viewer
    │       │       ├── Zoom
    │       │       ├── Scroll
    │       │       └── Offline Access
    │       │
    │       └── Linked to Topics/Videos
    │               └── Timestamps
    │
    └── STUDENT NOTES
            │
            ├── Created During Learning
            │       ├── Video Timestamps
            │       ├── PDF References
            │       └── Quiz Insights
            │
            ├── Organization
            │       ├── By Topic
            │       ├── By Subject
            │       └── By Exam
            │
            └── Sharing Options
                    ├── Private
                    ├── Peer Shared
                    └── Public
```

## Teacher Notes

### PDF Viewer

Built-in PDF viewer with features:

- **Zoom In/Out** - Adjust magnification
- **Continuous Scroll** - Smooth navigation
- **Page Navigation** - Jump to specific pages
- **Offline Access** - Download for offline viewing
- **Bookmarking** - Mark important pages

### PDF Links

Teacher notes are linked to:

- Video timestamps (click to jump to video)
- Related topics
- Practice quizzes
- External resources

## Student Notes

### Creation Methods

Students create notes in multiple ways:

1. **While Watching Videos**
   - Click to add note at timestamp
   - Auto-saves video position
   - Click timestamp to return

2. **While Reading PDFs**
   - Add notes on PDF content
   - Reference specific pages
   - Link to PDF positions

3. **While Solving Quizzes**
   - Note insights from solutions
   - Mark confusing questions
   - Add personal explanations

### Note Features

Each student note has:

- **Content** - The note text
- **Timestamp** - Video position (if applicable)
- **Topic Link** - Associated topic
- **Created At** - When created
- **Updated At** - When last modified

## Note Organization

### By Context

Notes are automatically organized by:

- **Exam** - Your selected exam
- **Subject** - Your chosen subject
- **Topic** - Related learning topic

### Manual Organization

Students can:

- Add custom tags
- Group related notes
- Link notes to each other
- Create note collections

## Note Sharing

### Sharing Levels

#### Private (Default)

- Only visible to creator
- Not accessible to anyone else
- Fully personal

#### Peer Shared

- Share with specific peers
- View-only for peers
- Collaborative discussion

#### Public to Community

- Visible to all students
- Read-only for community
- Can attach to forum posts

### Sharing Controls

Creators control:

- Who can view
- Who can edit (if collaborative)
- Whether attachable to forum
- Whether searchable

## External References

### Video Links

Notes can reference videos:

- Click timestamp → Jump to video position
- Automatic video context in AI
- Related video suggestions

### PDF Links

Notes can reference PDFs:

- Page number references
- Section highlighting
- PDF content in AI context

### Web Links

Notes can include:

- External articles
- Reference websites
- Educational resources

## Note Lifecycle

### Creation

1. Student creates note
2. Auto-tagged with context
3. Timestamped (if from video)
4. Saved to personal space

### Usage

1. Student accesses note
2. Clicks timestamp to jump
3. Reviews content
4. Edits if needed

### Sharing (Optional)

1. Creator sets sharing level
2. Note becomes visible
3. Peers/community can view
4. Creator can revoke access

## Notes and AI

### AI Context

AI knows about your notes:

- Teacher notes you've viewed
- Personal notes you've created
- Note content for explanations

### AI Features

AI uses notes for:

- Explaining concepts in your words
- Summarizing note content
- Finding related notes
- Suggesting note improvements

### AI Boundaries

AI never:
- Reads private notes without permission
- Shares notes without consent
- Generates notes for you

## Notes Search

### Search Capabilities

Search across notes:

- By content text
- By topic
- By date created
- By sharing level

### AI Search

AI-enhanced search:

- Semantic search
- Find related concepts
- Search within PDF content
- Search video transcripts

---

## Next Steps

- [Student Notes](/docs/student-notes) - Learn about timestamped personal notes
- [Notes Sharing](/docs/notes-sharing) - Understand privacy and sharing controls
- [Teacher Notes](/docs/teacher-notes) - Explore official PDF notes
- [Video Learning](/docs/video-learning) - See timestamped note creation
