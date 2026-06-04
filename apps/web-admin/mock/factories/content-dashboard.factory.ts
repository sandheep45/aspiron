import type {
  ContentDashboardAttentionItem,
  ContentDashboardAttentionResponse,
  ContentDashboardSignalItem,
  ContentDashboardSubjectProgress,
  ContentDashboardSummary,
} from '@aspiron/api-client'

let nextId = 1

function resetIdCounter() {
  nextId = 1
}

function uid() {
  return `content-dashboard-${nextId++}`
}

export function buildContentDashboardSummary(
  overrides?: Partial<ContentDashboardSummary>,
): ContentDashboardSummary {
  return {
    subjects_covered: 3 as unknown as bigint,
    topics_published: 147 as unknown as bigint,
    topics_in_draft: 23 as unknown as bigint,
    topics_flagged: 12 as unknown as bigint,
    ...overrides,
  }
}

export function buildContentDashboardAttentionItem(
  overrides?: Partial<ContentDashboardAttentionItem>,
): ContentDashboardAttentionItem {
  const issues = [
    { issue: 'Low Recall', reason: 'Students showing recall decline' },
    { issue: 'Poor Accuracy', reason: 'Accuracy below 60% threshold' },
    { issue: 'High Drop-off', reason: 'More than 40% students disengaged' },
    { issue: 'Weak Fundamentals', reason: 'Conceptual gaps detected' },
  ]
  const idx = (nextId - 1) % issues.length
  return {
    id: uid(),
    topic: "Electrostatics - Gauss's Law",
    issue: issues[idx].issue,
    reason: issues[idx].reason,
    students_affected: 23 as unknown as bigint,
    ...overrides,
  }
}

export function buildContentDashboardAttentionResponse(
  count = 4,
  overrides?: Partial<Omit<ContentDashboardAttentionResponse, 'items'>>,
): ContentDashboardAttentionResponse {
  resetIdCounter()
  const topics = [
    "Electrostatics - Gauss's Law",
    'Thermodynamics - Carnot Engine',
    'Organic Chemistry - Reaction Mechanisms',
    'Calculus - Integration by Parts',
    'Kinematics - Projectile Motion',
    'Equilibrium - Acid-Base Titrations',
    'Optics - Lens Equations',
    "Electromagnetism - Faraday's Law",
  ]
  const issuesList = [
    { issue: 'Low Recall', reason: 'Students showing recall decline' },
    { issue: 'Poor Accuracy', reason: 'Accuracy below 60% threshold' },
    { issue: 'High Drop-off', reason: 'More than 40% students disengaged' },
    { issue: 'Weak Fundamentals', reason: 'Conceptual gaps detected' },
  ]
  return {
    total: count as unknown as bigint,
    items: Array.from({ length: count }, (_, i) =>
      buildContentDashboardAttentionItem({
        id: `attention-${i + 1}`,
        topic: topics[i % topics.length],
        issue: issuesList[i % issuesList.length].issue,
        reason: issuesList[i % issuesList.length].reason,
        students_affected: (25 - i * 3) as unknown as bigint,
      }),
    ),
    ...overrides,
  }
}

export function buildContentDashboardSubjectProgress(
  overrides?: Partial<ContentDashboardSubjectProgress>,
): ContentDashboardSubjectProgress {
  return {
    id: uid(),
    name: 'Physics',
    completion: 87,
    total_topics: 68 as unknown as bigint,
    published_topics: 59 as unknown as bigint,
    draft_topics: 9 as unknown as bigint,
    ...overrides,
  }
}

export function buildContentDashboardSubjectsResponse(
  count = 3,
): ContentDashboardSubjectProgress[] {
  resetIdCounter()
  const subjects = [
    { name: 'Physics', completion: 87, total: 68, published: 59, draft: 9 },
    { name: 'Chemistry', completion: 72, total: 54, published: 39, draft: 15 },
    {
      name: 'Mathematics',
      completion: 64,
      total: 82,
      published: 53,
      draft: 29,
    },
    { name: 'Biology', completion: 91, total: 46, published: 42, draft: 4 },
  ]
  return Array.from({ length: count }, (_, i) =>
    buildContentDashboardSubjectProgress({
      id: `subject-${i + 1}`,
      name: subjects[i % subjects.length].name,
      completion: subjects[i % subjects.length].completion,
      total_topics: subjects[i % subjects.length].total as unknown as bigint,
      published_topics: subjects[i % subjects.length]
        .published as unknown as bigint,
      draft_topics: subjects[i % subjects.length].draft as unknown as bigint,
    }),
  )
}

export function buildContentDashboardSignalItem(
  overrides?: Partial<ContentDashboardSignalItem>,
): ContentDashboardSignalItem {
  return {
    topic: 'Modern Physics - Photoelectric Effect',
    score: null as unknown as undefined,
    drop: null as unknown as undefined,
    ...overrides,
  }
}

export function buildContentDashboardSignalsResponse(): {
  highest_recall: ContentDashboardSignalItem[]
  fastest_decay: ContentDashboardSignalItem[]
} {
  resetIdCounter()
  return {
    highest_recall: [
      buildContentDashboardSignalItem({
        topic: 'Modern Physics - Photoelectric Effect',
        score: 84,
        drop: null as unknown as undefined,
      }),
      buildContentDashboardSignalItem({
        topic: 'Chemical Bonding - VSEPR Theory',
        score: 79,
        drop: null as unknown as undefined,
      }),
      buildContentDashboardSignalItem({
        topic: 'Calculus - Limits & Continuity',
        score: 76,
        drop: null as unknown as undefined,
      }),
    ],
    fastest_decay: [
      buildContentDashboardSignalItem({
        topic: "Electrostatics - Gauss's Law",
        score: null as unknown as undefined,
        drop: 28,
      }),
      buildContentDashboardSignalItem({
        topic: 'Thermodynamics - Entropy',
        score: null as unknown as undefined,
        drop: 31,
      }),
      buildContentDashboardSignalItem({
        topic: 'Organic Chemistry - Rearrangements',
        score: null as unknown as undefined,
        drop: 42,
      }),
    ],
  }
}
