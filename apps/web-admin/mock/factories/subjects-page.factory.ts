import type {
  SubjectPageItem,
  SubjectSignal,
  SubjectSummary,
} from '@aspiron/api-client'

let nextId = 1

function resetIdCounter() {
  nextId = 1
}

function uid() {
  return `subject-page-${nextId++}`
}

const subjectNames = ['Physics', 'Chemistry', 'Mathematics', 'Biology']

export function buildSubjectPageItem(
  overrides?: Partial<SubjectPageItem>,
): SubjectPageItem {
  const idx = (nextId - 1) % subjectNames.length
  const subject = subjectList[idx]
  return {
    id: uid(),
    name: subject.name,
    chapters_count: subject.chapters as unknown as bigint,
    topics_published: subject.published as unknown as bigint,
    coverage: subject.coverage,
    average_recall: subject.recall,
    practice_accuracy: subject.accuracy,
    status: subject.status,
    ...overrides,
  }
}

const subjectList = [
  {
    name: 'Physics',
    chapters: 12,
    published: 59,
    coverage: 87,
    recall: 0.62,
    accuracy: 0.74,
    status: 'Needs Attention',
  },
  {
    name: 'Chemistry',
    chapters: 10,
    published: 39,
    coverage: 72,
    recall: 0.81,
    accuracy: 0.85,
    status: 'Healthy',
  },
  {
    name: 'Mathematics',
    chapters: 14,
    published: 53,
    coverage: 64,
    recall: 0.76,
    accuracy: 0.69,
    status: 'Needs Attention',
  },
  {
    name: 'Biology',
    chapters: 8,
    published: 42,
    coverage: 91,
    recall: 0.88,
    accuracy: 0.91,
    status: 'Healthy',
  },
]

export function buildSubjectPageItemsResponse(count = 4): SubjectPageItem[] {
  resetIdCounter()
  return Array.from({ length: count }, (_, i) =>
    buildSubjectPageItem({
      id: `subject-${i + 1}`,
      name: subjectList[i % subjectList.length].name,
    }),
  )
}

export function buildSubjectSummary(
  overrides?: Partial<SubjectSummary>,
): SubjectSummary {
  return {
    total_subjects: 4 as unknown as bigint,
    total_topics: 250 as unknown as bigint,
    published_topics: 193 as unknown as bigint,
    topics_needing_attention: 18 as unknown as bigint,
    descriptions: [
      'Physics, Chemistry, Mathematics, Biology',
      '250 topics across 4 subjects',
      '193 topics published and available',
      '18 topics with low recall or accuracy',
    ],
    ...overrides,
  }
}

export function buildSubjectSignal(
  overrides?: Partial<SubjectSignal>,
): SubjectSignal {
  const signals = [
    {
      subject_name: 'Physics',
      message: 'Physics has fastest recall decay',
      signal_type: 'negative',
    },
    {
      subject_name: 'Chemistry',
      message: 'Chemistry has highest practice accuracy',
      signal_type: 'positive',
    },
    {
      subject_name: 'Mathematics',
      message: 'Mathematics maintains most stable recall',
      signal_type: 'positive',
    },
    {
      subject_name: 'Biology',
      message: 'Content coverage improved significantly for Biology',
      signal_type: 'positive',
    },
  ]
  const idx = (nextId - 1) % signals.length
  return {
    ...signals[idx],
    ...overrides,
  }
}

export function buildSubjectSignalsResponse(count = 4): SubjectSignal[] {
  resetIdCounter()
  const allSignals = [
    {
      subject_name: 'Physics',
      message: 'Physics has fastest recall decay',
      signal_type: 'negative',
    },
    {
      subject_name: 'Chemistry',
      message: 'Chemistry has highest practice accuracy',
      signal_type: 'positive',
    },
    {
      subject_name: 'Mathematics',
      message: 'Mathematics maintains most stable recall',
      signal_type: 'positive',
    },
    {
      subject_name: 'Biology',
      message: 'Content coverage improved significantly for Biology',
      signal_type: 'positive',
    },
  ]
  return allSignals.slice(0, count)
}
