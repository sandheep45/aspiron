import type { Doc } from '$utils/types'

const docsData: Omit<Doc, 'previous' | 'next'>[] = [
  // Introduction
  {
    slug: 'intro',
    title: 'What is Aspiron',
    description: 'Introduction to Aspiron platform',
    order: 1,
    section: 'Introduction',
  },
  {
    slug: 'mvp-scope',
    title: 'MVP Scope',
    description: 'What exists and what is excluded',
    order: 2,
    section: 'Introduction',
  },
  {
    slug: 'student-journey',
    title: 'Student Journey',
    description: 'Day 1, daily, and revision workflows',
    order: 3,
    section: 'Introduction',
  },
  {
    slug: 'design-philosophy',
    title: 'Design Philosophy',
    description: 'Student-first principles',
    order: 4,
    section: 'Introduction',
  },
  {
    slug: 'roadmap',
    title: 'Future Roadmap',
    description: 'Post-MVP plans',
    order: 5,
    section: 'Introduction',
  },

  // Core Concepts
  {
    slug: 'core-concepts',
    title: 'Core Concepts',
    description: 'Foundational architecture',
    order: 6,
    section: 'Core Concepts',
  },
  {
    slug: 'context-layer',
    title: 'Context Layer',
    description: 'Exam/subject persistence',
    order: 7,
    section: 'Core Concepts',
  },
  {
    slug: 'learning-structure',
    title: 'Learning Structure',
    description: 'Subjects and topics',
    order: 8,
    section: 'Core Concepts',
  },
  {
    slug: 'notes-system',
    title: 'Notes System',
    description: 'Personal and shared notes',
    order: 9,
    section: 'Core Concepts',
  },
  {
    slug: 'progress-tracking',
    title: 'Progress Tracking',
    description: 'Metrics and mastery views',
    order: 10,
    section: 'Core Concepts',
  },

  // Learning
  {
    slug: 'video-learning',
    title: 'Video Learning',
    description: 'Recorded videos and playback',
    order: 11,
    section: 'Learning',
  },
  {
    slug: 'live-classes',
    title: 'Live Classes',
    description: 'Scheduled classes and AI summaries',
    order: 12,
    section: 'Learning',
  },
  {
    slug: 'teacher-notes',
    title: 'Teacher Notes & PDFs',
    description: 'Official materials',
    order: 13,
    section: 'Learning',
  },
  {
    slug: 'student-notes',
    title: 'Student Notes',
    description: 'Timestamped personal notes',
    order: 14,
    section: 'Learning',
  },
  {
    slug: 'notes-sharing',
    title: 'Notes Sharing & Privacy',
    description: 'Visibility controls',
    order: 15,
    section: 'Learning',
  },

  // Assessment
  {
    slug: 'practice-quizzes',
    title: 'Practice Quizzes',
    description: 'MCQs and solutions',
    order: 16,
    section: 'Assessment',
  },
  {
    slug: 'tests-mock-exams',
    title: 'Tests & Mock Exams',
    description: 'Chapter and full exams',
    order: 17,
    section: 'Assessment',
  },
  {
    slug: 'ai-proctoring',
    title: 'AI Proctoring',
    description: 'Soft proctoring',
    order: 18,
    section: 'Assessment',
  },

  // AI Features
  {
    slug: 'context-ai-chat',
    title: 'Context-Aware AI Chat',
    description: 'Global AI assistant',
    order: 19,
    section: 'AI Features',
  },
  {
    slug: 'ai-recall-check',
    title: 'AI Recall Check',
    description: 'Memory-aware revision',
    order: 20,
    section: 'AI Features',
  },
  {
    slug: 'revision-mode',
    title: 'Revision Mode',
    description: 'Wrong questions review',
    order: 21,
    section: 'AI Features',
  },
  {
    slug: 'test-analysis',
    title: 'Test Analysis',
    description: 'Post-test summaries',
    order: 22,
    section: 'AI Features',
  },

  // Community
  {
    slug: 'peer-forum',
    title: 'Peer Discussion Forum',
    description: 'Threads and doubts',
    order: 23,
    section: 'Community',
  },
  {
    slug: 'community-bot',
    title: 'Community Bot',
    description: 'Virtual tutor',
    order: 24,
    section: 'Community',
  },
  {
    slug: 'notifications',
    title: 'Smart Notifications',
    description: 'Ethical nudges',
    order: 25,
    section: 'Community',
  },

  // Safety
  {
    slug: 'exam-integrity',
    title: 'Exam Integrity & Safety',
    description: 'AI disable and blocking',
    order: 26,
    section: 'Safety',
  },
]

function computeNavigation(docs: Omit<Doc, 'previous' | 'next'>[]): Doc[] {
  const sorted = [...docs].sort((a, b) => a.order - b.order)
  return sorted.map((doc, index) => ({
    ...doc,
    previous: index > 0 ? sorted[index - 1].slug : undefined,
    next: index < sorted.length - 1 ? sorted[index + 1].slug : undefined,
  }))
}

export const docs = computeNavigation(docsData)
export const docsDir = './src/lib/docs'
