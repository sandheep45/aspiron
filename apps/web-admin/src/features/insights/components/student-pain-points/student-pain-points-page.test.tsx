import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StudentPainPointsPage } from './student-pain-points-page'

const {
  mockUseCriticalIssuesQuery,
  mockUsePainPointsQuery,
  mockUsePatternInsightsQuery,
  mockUseTopicDetailQuery,
} = vi.hoisted(() => ({
  mockUseCriticalIssuesQuery: vi.fn(),
  mockUsePainPointsQuery: vi.fn(),
  mockUsePatternInsightsQuery: vi.fn(),
  mockUseTopicDetailQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useCriticalIssuesQuery: mockUseCriticalIssuesQuery,
  usePainPointsQuery: mockUsePainPointsQuery,
  usePatternInsightsQuery: mockUsePatternInsightsQuery,
  useTopicDetailQuery: mockUseTopicDetailQuery,
}))

const criticalIssuesData = {
  total_urgent: 2 as unknown as bigint,
  issues: [
    {
      id: '1',
      topic: 'Quadratic Equations',
      description: 'Students struggle with quadratic formula application',
      severity: 'critical' as const,
      students_affected: 18 as unknown as bigint,
      action_label: 'View Topic',
    },
    {
      id: '2',
      topic: 'Photosynthesis',
      description: 'Students struggle with light-dependent reactions',
      severity: 'high' as const,
      students_affected: 14 as unknown as bigint,
      action_label: 'View Topic',
    },
  ],
}

const painPointsData = {
  total: 25 as unknown as bigint,
  items: Array.from({ length: 10 }, (_, i) => ({
    id: `${i + 1}`,
    topic: `Topic ${i + 1}`,
    recall_strength: (['weak', 'medium', 'strong'] as const)[i % 3],
    accuracy: (100 - i * 8) / 100,
    common_mistake: 'Incorrect recall or calculation',
    last_activity: 'recently',
    status: (['degrading', 'stable', 'improving'] as const)[i % 3],
    students: (20 - i) as unknown as bigint,
  })),
}

const patternInsightsData = {
  insights: [
    {
      id: '1',
      title: 'Numerical-heavy topics show faster recall decay',
      metric: 'Affects 60%',
    },
    {
      id: '2',
      title: 'Students skip spaced repetition on weak topics',
      metric: '45 students',
    },
    {
      id: '3',
      title: 'Concept gaps compound across related chapters',
      metric: '3/12 topics',
    },
    {
      id: '4',
      title: 'Passive learning without practice leads to 40% accuracy drop',
      metric: '52% average',
    },
  ],
}

const topicDetailData = {
  topic: 'Quadratic Equations',
  accuracy: 0.32,
  students_affected: 18 as unknown as bigint,
  trend: 'degrading',
  common_mistakes: ['Incorrect application of quadratic formula'],
  weak_questions: ['Solve 2x² + 5x - 3 = 0'],
  recommendations: ['Review quadratic formula derivation'],
}

function mockAllQueries(overrides?: {
  criticalIssues?: Partial<ReturnType<typeof mockUseCriticalIssuesQuery>>
  painPoints?: Partial<ReturnType<typeof mockUsePainPointsQuery>>
  patternInsights?: Partial<ReturnType<typeof mockUsePatternInsightsQuery>>
  topicDetail?: Partial<ReturnType<typeof mockUseTopicDetailQuery>>
}) {
  mockUseCriticalIssuesQuery.mockReturnValue({
    data: criticalIssuesData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides?.criticalIssues,
  })
  mockUsePainPointsQuery.mockReturnValue({
    data: painPointsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides?.painPoints,
  })
  mockUsePatternInsightsQuery.mockReturnValue({
    data: patternInsightsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides?.patternInsights,
  })
  mockUseTopicDetailQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides?.topicDetail,
  })
}

describe('StudentPainPointsPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders page heading', () => {
    mockAllQueries()
    render(<StudentPainPointsPage />)
    expect(screen.getByText('Student Pain Points')).toBeInTheDocument()
  })

  it('renders critical issues section heading', () => {
    mockAllQueries()
    render(<StudentPainPointsPage />)
    expect(screen.getByText('Critical Issues')).toBeInTheDocument()
  })

  it('renders critical issue topic names', () => {
    mockAllQueries()
    render(<StudentPainPointsPage />)
    expect(screen.getByText('Quadratic Equations')).toBeInTheDocument()
  })

  it('renders pattern insights section heading', () => {
    mockAllQueries()
    render(<StudentPainPointsPage />)
    expect(screen.getByText('Pattern Insights')).toBeInTheDocument()
  })

  it('renders pain points table with topic names', () => {
    mockAllQueries()
    render(<StudentPainPointsPage />)
    expect(screen.getByText('Topic 1')).toBeInTheDocument()
    expect(screen.getByText('Topic 10')).toBeInTheDocument()
  })

  it('renders page count info', () => {
    mockAllQueries()
    render(<StudentPainPointsPage />)
    expect(screen.getByText(/25 topics identified/)).toBeInTheDocument()
  })

  it('opens topic detail drawer on view topic click', async () => {
    mockAllQueries({
      topicDetail: { data: topicDetailData, isLoading: false },
    })
    const user = userEvent.setup()
    render(<StudentPainPointsPage />)

    await user.click(screen.getAllByText('View Topic')[0])
    const topicNames = screen.getAllByText('Quadratic Equations')
    expect(topicNames).toHaveLength(2) // one in card, one in drawer title
  })

  it('renders skeleton while critical issues load', () => {
    mockAllQueries({
      criticalIssues: { data: undefined, isLoading: true, isError: false },
    })
    const { container } = render(<StudentPainPointsPage />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders error state when critical issues fail', () => {
    mockAllQueries({
      criticalIssues: {
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load critical issues'),
      },
    })
    render(<StudentPainPointsPage />)
    expect(
      screen.getByText('Failed to load critical issues'),
    ).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('renders empty state when no critical issues', () => {
    mockAllQueries({
      criticalIssues: {
        data: { total_urgent: 0 as unknown as bigint, issues: [] },
        isLoading: false,
        isError: false,
      },
    })
    render(<StudentPainPointsPage />)
    expect(screen.getByText('No Critical Issues')).toBeInTheDocument()
  })

  it('renders empty state when no pain points', () => {
    mockAllQueries({
      painPoints: {
        data: { total: 0 as unknown as bigint, items: [] },
        isLoading: false,
        isError: false,
      },
    })
    render(<StudentPainPointsPage />)
    expect(screen.getByText('No pain points found')).toBeInTheDocument()
  })

  it('renders empty state when no pattern insights', () => {
    mockAllQueries({
      patternInsights: {
        data: { insights: [] },
        isLoading: false,
        isError: false,
      },
    })
    render(<StudentPainPointsPage />)
    expect(screen.getByText('No patterns detected yet')).toBeInTheDocument()
  })

  it('handles pagination previous and next buttons', async () => {
    mockAllQueries()
    const user = userEvent.setup()
    render(<StudentPainPointsPage />)

    expect(screen.getByText('Previous')).toBeDisabled()
    expect(screen.getByText('Next')).not.toBeDisabled()

    await user.click(screen.getByText('Next'))
    expect(mockUsePainPointsQuery).toHaveBeenCalled()
  })

  it('refetches all queries on refresh button click', async () => {
    const refetchCritical = vi.fn()
    const refetchPainPoints = vi.fn()
    const refetchPattern = vi.fn()
    mockAllQueries({
      criticalIssues: { refetch: refetchCritical },
      painPoints: { refetch: refetchPainPoints },
      patternInsights: { refetch: refetchPattern },
    })
    const user = userEvent.setup()
    render(<StudentPainPointsPage />)

    const refreshButton = screen.getByRole('button', { name: '' })
    await user.click(refreshButton)
    expect(refetchCritical).toHaveBeenCalled()
    expect(refetchPainPoints).toHaveBeenCalled()
    expect(refetchPattern).toHaveBeenCalled()
  })
})
