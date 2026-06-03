import type {
  CriticalIssue,
  CriticalIssuesResponse,
  PainPointItem,
  PainPointsResponse,
  PatternInsight,
  PatternInsightsResponse,
  TopicDetailResponse,
} from '@aspiron/api-client'

let nextId = 1

function resetIdCounter() {
  nextId = 1
}

function uid() {
  return `pain-point-${nextId++}`
}

export function buildCriticalIssue(
  overrides?: Partial<CriticalIssue>,
): CriticalIssue {
  return {
    id: uid(),
    topic: 'Quadratic Equations',
    description: 'Students struggle with quadratic formula application',
    severity: 'critical',
    students_affected: 18 as unknown as bigint,
    action_label: 'View Topic',
    ...overrides,
  }
}

export function buildCriticalIssuesResponse(
  count = 2,
  overrides?: Partial<Omit<CriticalIssuesResponse, 'issues'>>,
): CriticalIssuesResponse {
  resetIdCounter()
  return {
    total_urgent: count as unknown as bigint,
    issues: Array.from({ length: count }, (_, i) =>
      buildCriticalIssue({
        id: `${i + 1}`,
        students_affected: (count - i) as unknown as bigint,
      }),
    ),
    ...overrides,
  }
}

export function buildPainPointItem(
  overrides?: Partial<PainPointItem>,
): PainPointItem {
  return {
    id: uid(),
    topic: 'Quadratic Equations',
    recall_strength: 'weak',
    accuracy: 32.0,
    common_mistake: 'Incorrect recall or calculation',
    last_activity: 'recently',
    status: 'degrading',
    students: 18 as unknown as bigint,
    ...overrides,
  }
}

export function buildPainPointsResponse(
  count = 10,
  overrides?: Partial<Omit<PainPointsResponse, 'items'>>,
): PainPointsResponse {
  resetIdCounter()
  const severities = ['weak', 'medium', 'strong'] as const
  const statuses = ['degrading', 'stable', 'improving'] as const
  return {
    total: count as unknown as bigint,
    items: Array.from({ length: count }, (_, i) =>
      buildPainPointItem({
        id: `${i + 1}`,
        topic: `Topic ${i + 1}`,
        accuracy: 100 - i * 8,
        recall_strength: severities[i % 3],
        status: statuses[i % 3],
        students: (20 - i) as unknown as bigint,
      }),
    ),
    ...overrides,
  }
}

export function buildPatternInsight(
  overrides?: Partial<PatternInsight>,
): PatternInsight {
  return {
    id: uid(),
    title: 'Numerical-heavy topics show faster recall decay',
    metric: 'Affects 60% of struggling students',
    ...overrides,
  }
}

export function buildPatternInsightsResponse(
  overrides?: Partial<PatternInsightsResponse>,
): PatternInsightsResponse {
  resetIdCounter()
  return {
    insights: [
      buildPatternInsight({
        title: 'Numerical-heavy topics show faster recall decay',
        metric: 'Affects 60% of struggling students',
      }),
      buildPatternInsight({
        title: 'Students skip spaced repetition on weak topics',
        metric: '45 students have incomplete recall sessions',
      }),
      buildPatternInsight({
        title: 'Concept gaps compound across related chapters',
        metric: '3/12 topics show cascading failures',
      }),
      buildPatternInsight({
        title: 'Passive learning without practice leads to 40% accuracy drop',
        metric: '52% average accuracy on first recall',
      }),
    ],
    ...overrides,
  }
}

export function buildTopicDetailResponse(
  overrides?: Partial<TopicDetailResponse>,
): TopicDetailResponse {
  return {
    topic: 'Quadratic Equations',
    accuracy: 32.0,
    students_affected: 18 as unknown as bigint,
    trend: 'degrading',
    common_mistakes: [
      'Incorrect application of quadratic formula',
      'Sign errors in discriminant calculation',
    ],
    weak_questions: [
      'Solve 2x² + 5x - 3 = 0',
      'Find roots of x² - 7x + 12 = 0',
    ],
    recommendations: [
      'Review quadratic formula derivation',
      'Practice discriminant analysis',
      'Complete remedial worksheet set 3',
    ],
    ...overrides,
  }
}
