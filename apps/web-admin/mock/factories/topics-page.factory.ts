let nextId = 1

export function uid(): string {
  const id = nextId
  nextId++
  return `topic-${id}`
}

export function resetIdCounter(): void {
  nextId = 1
}

export function buildTopicSummary(
  overrides?: Partial<{
    chapter_name: string
    total_topics: bigint
    published_topics: bigint
    draft_topics: bigint
    weak_topics: bigint
  }>,
) {
  return {
    chapter_name: 'Electrostatics',
    total_topics: 8 as unknown as bigint,
    published_topics: 6 as unknown as bigint,
    draft_topics: 2 as unknown as bigint,
    weak_topics: 2 as unknown as bigint,
    ...overrides,
  }
}

export function buildTopicItem(
  overrides?: Partial<{
    id: string
    name: string
    content_status: string
    video_available: boolean
    recall_strength: string
    practice_accuracy: number
    last_activity: string
    status: string
  }>,
) {
  const id = overrides?.id ?? uid()
  return {
    id,
    name: `Topic ${id}`,
    content_status: 'published',
    video_available: true,
    recall_strength: 'medium',
    practice_accuracy: 65,
    last_activity: '2 hours ago',
    status: 'needs_attention',
    ...overrides,
  }
}

const insightTypes = ['positive', 'warning', 'negative', 'info'] as const

export function buildInsightItem(
  overrides?: Partial<{
    id: string
    type: string
    title: string
    description: string
  }>,
) {
  return {
    id: overrides?.id ?? uid(),
    type: 'info',
    title: 'Sample insight',
    description: 'This is a sample insight description for testing purposes.',
    ...overrides,
  }
}

export function buildTopicItemList(
  count: number,
  overrides?: Partial<{
    content_status: string
    video_available: boolean
    recall_strength: string
    practice_accuracy: number
    status: string
  }>,
) {
  resetIdCounter()
  return Array.from({ length: count }, () => buildTopicItem(overrides))
}

export function buildInsightItemList(count: number) {
  return Array.from({ length: count }, (_, i) =>
    buildInsightItem({
      id: `insight-${i + 1}`,
      type: insightTypes[i % insightTypes.length],
      title: `Insight ${i + 1}`,
      description: `Description for insight ${i + 1}`,
    }),
  )
}
