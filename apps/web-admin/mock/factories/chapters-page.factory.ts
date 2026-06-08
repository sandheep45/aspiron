import type {
  ChapterItem,
  ChapterSummary,
  InsightItem,
} from '@aspiron/api-client'

let nextId = 1

export function resetIdCounter() {
  nextId = 1
}

function uid() {
  return `chapter-${nextId++}`
}

export function buildChapterSummary(
  overrides?: Partial<ChapterSummary>,
): ChapterSummary {
  return {
    subject_name: 'Physics',
    total_chapters: 8 as unknown as bigint,
    published_topics: 45 as unknown as bigint,
    draft_topics: 12 as unknown as bigint,
    chapters_needing_attention: 2 as unknown as bigint,
    ...overrides,
  }
}

export function buildChapterItem(
  overrides?: Partial<ChapterItem>,
): ChapterItem {
  const names = [
    'Mechanics',
    'Thermodynamics',
    'Optics',
    'Electromagnetism',
    'Modern Physics',
    'Waves & Sound',
    'Kinematics',
    'Gravitation',
  ]
  const idx = (nextId - 1) % names.length
  const statuses = ['healthy', 'needs_attention', 'critical'] as const
  const status = statuses[idx % statuses.length]
  return {
    id: uid(),
    name: names[idx],
    published_topics: (10 - idx) as unknown as bigint,
    total_topics: 15 as unknown as bigint,
    coverage: 80 - idx * 10,
    avg_recall: idx < 2 ? 'strong' : idx < 5 ? 'medium' : 'weak',
    practice_accuracy: 85 - idx * 12,
    status,
    last_updated: `${idx + 1} days ago`,
    ...overrides,
  }
}

export function buildChapterItemList(
  count = 5,
  overrides?: Partial<ChapterItem>,
): ChapterItem[] {
  const list: ChapterItem[] = []
  resetIdCounter()
  for (let i = 0; i < count; i++) {
    list.push(buildChapterItem(overrides))
  }
  return list
}

export function buildInsightItem(
  overrides?: Partial<InsightItem>,
): InsightItem {
  const insights = [
    {
      type: 'positive' as const,
      title: 'Strong Recall',
      description: 'Mechanics maintains strong recall rates above 80%',
    },
    {
      type: 'warning' as const,
      title: 'Content Gaps',
      description: 'Thermodynamics has less than 50% topic coverage',
    },
    {
      type: 'negative' as const,
      title: 'Low Accuracy',
      description: 'Optics shows practice accuracy below 50%',
    },
    {
      type: 'info' as const,
      title: 'Steady Progress',
      description: 'All chapters show consistent improvement over last month',
    },
  ]
  const idx = (nextId - 1) % insights.length
  return {
    id: `insight-${nextId++}`,
    type: insights[idx].type,
    title: insights[idx].title,
    description: insights[idx].description,
    ...overrides,
  }
}

export function buildInsightItemList(
  count = 3,
  overrides?: Partial<InsightItem>,
): InsightItem[] {
  const list: InsightItem[] = []
  resetIdCounter()
  for (let i = 0; i < count; i++) {
    list.push(buildInsightItem(overrides))
  }
  return list
}
