import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { render as customRender } from '@/test-utils'

const {
  mockUseRecallOverviewQuery,
  mockUseMcqRecallQuery,
  mockUseFreeRecallQuery,
  mockUseMemoryGapMapQuery,
  mockUseSuggestedActionsQuery,
  mockUseRecallTrendsQuery,
} = vi.hoisted(() => ({
  mockUseRecallOverviewQuery: vi.fn(),
  mockUseMcqRecallQuery: vi.fn(),
  mockUseFreeRecallQuery: vi.fn(),
  mockUseMemoryGapMapQuery: vi.fn(),
  mockUseSuggestedActionsQuery: vi.fn(),
  mockUseRecallTrendsQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useRecallOverviewQuery: mockUseRecallOverviewQuery,
  useMcqRecallQuery: mockUseMcqRecallQuery,
  useFreeRecallQuery: mockUseFreeRecallQuery,
  useMemoryGapMapQuery: mockUseMemoryGapMapQuery,
  useSuggestedActionsQuery: mockUseSuggestedActionsQuery,
  useRecallTrendsQuery: mockUseRecallTrendsQuery,
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const overviewData = {
  avg_recall_score: 80.0,
  completion_rate: 85.0,
  memory_decay: 'degrading',
  last_recall_run: '2 hours ago',
}

const mcqData = {
  overall_accuracy: 50.0,
  total_questions_attempted: 12 as unknown as bigint,
  difficulty_breakdown: [
    { difficulty: 'Easy', accuracy: 92.0, count: 4 as unknown as bigint },
    { difficulty: 'Medium', accuracy: 75.0, count: 5 as unknown as bigint },
    { difficulty: 'Hard', accuracy: 55.0, count: 3 as unknown as bigint },
  ],
  questions: [
    {
      question_number: 'Q-0001',
      concept: "Gauss's Law Statement",
      difficulty: 'Easy',
      recall_accuracy: 100.0,
      attempts: 1 as unknown as bigint,
    },
  ],
}

const freeRecallData = {
  participation_rate: 60.0,
  ai_clarity_score: 72.5,
  average_response_length: 85 as unknown as bigint,
  missing_concepts: [
    {
      concept: 'Spherical Symmetry',
      percentage_missing: 62.0,
      ai_summary: 'Students consistently omit the derivation steps.',
    },
  ],
}

const memoryGapData = {
  items: [
    {
      concept: "Gauss's Law Statement",
      recall_status: 'remembered' as const,
      confidence: 0.85,
      correctness: 90.0,
    },
    {
      concept: 'Flux Calculation',
      recall_status: 'partial' as const,
      confidence: 0.6,
      correctness: 50.0,
    },
  ],
}

const actionsData = [
  {
    id: 'spherical-symmetry',
    icon: 'alert-triangle',
    detected_issue: 'Students struggle with spherical symmetry calculations',
    explanation: '62% of students missed this concept.',
    suggested_fix: 'Review derivation video.',
    primary_cta: 'Review Video',
  },
]

const trendsData = {
  recall_trend: [
    { date: '2026-01-01', value: 85.0 },
    { date: '2026-01-08', value: 72.0 },
  ],
  memory_decay_curve: [
    { date: '2026-01-01', value: 100.0 },
    { date: '2026-01-08', value: 86.0 },
  ],
  recall_by_difficulty: [{ date: '2026-01-01', value: 65.0 }],
  retention_distribution: [{ date: '2026-01-01', value: 40.0 }],
}

function defaultMocks() {
  mockUseRecallOverviewQuery.mockReturnValue({
    data: overviewData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseMcqRecallQuery.mockReturnValue({
    data: mcqData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseFreeRecallQuery.mockReturnValue({
    data: freeRecallData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseMemoryGapMapQuery.mockReturnValue({
    data: memoryGapData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseSuggestedActionsQuery.mockReturnValue({
    data: actionsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseRecallTrendsQuery.mockReturnValue({
    data: trendsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
}

import { RecallInsightsPage } from '@/features/recall-insights/components/recall-insights-page'

describe('RecallInsightsPage', () => {
  const onBack = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders page heading', () => {
    defaultMocks()
    customRender(<RecallInsightsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Recall Insights')).toBeInTheDocument()
  })

  it('renders back button', () => {
    defaultMocks()
    customRender(<RecallInsightsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Back to Topic Detail')).toBeInTheDocument()
  })

  it('renders all 6 sections', () => {
    defaultMocks()
    customRender(<RecallInsightsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('MCQ Recall Performance')).toBeInTheDocument()
    expect(screen.getByText('Free Recall Analysis')).toBeInTheDocument()
    expect(screen.getByText('Memory Gap Map')).toBeInTheDocument()
    expect(screen.getByText('Recall Trend Analytics')).toBeInTheDocument()
    expect(screen.getByText('Suggested Actions')).toBeInTheDocument()
  })

  it('renders key insight when derived from data', () => {
    defaultMocks()
    customRender(<RecallInsightsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Key Insight')).toBeInTheDocument()
  })

  it('renders overview data in status badge', () => {
    defaultMocks()
    customRender(<RecallInsightsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Strong Recall')).toBeInTheDocument()
  })

  it('renders MCQ section with data', () => {
    defaultMocks()
    customRender(<RecallInsightsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('12 Total Attempted')).toBeInTheDocument()
  })

  it('renders free recall section', () => {
    defaultMocks()
    customRender(<RecallInsightsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Participation Rate')).toBeInTheDocument()
  })

  it('renders memory gap section', () => {
    defaultMocks()
    customRender(<RecallInsightsPage topicId='test-topic' onBack={onBack} />)
    const items = screen.getAllByText("Gauss's Law Statement")
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('renders suggested actions', () => {
    defaultMocks()
    customRender(<RecallInsightsPage topicId='test-topic' onBack={onBack} />)
    expect(
      screen.getByText(
        'Students struggle with spherical symmetry calculations',
      ),
    ).toBeInTheDocument()
  })

  it('renders skeleton while loading', () => {
    mockUseRecallOverviewQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseMcqRecallQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseFreeRecallQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseMemoryGapMapQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseSuggestedActionsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseRecallTrendsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = customRender(
      <RecallInsightsPage topicId='test-topic' onBack={onBack} />,
    )
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThanOrEqual(4)
  })

  it('renders error state for MCQ section', () => {
    mockUseRecallOverviewQuery.mockReturnValue({
      data: overviewData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseMcqRecallQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load MCQ data'),
      refetch: vi.fn(),
    })
    mockUseFreeRecallQuery.mockReturnValue({
      data: freeRecallData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseMemoryGapMapQuery.mockReturnValue({
      data: memoryGapData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseSuggestedActionsQuery.mockReturnValue({
      data: actionsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseRecallTrendsQuery.mockReturnValue({
      data: trendsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    customRender(<RecallInsightsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Failed to load MCQ data')).toBeInTheDocument()
  })

  it('renders empty state for MCQ when data is null', () => {
    mockUseRecallOverviewQuery.mockReturnValue({
      data: overviewData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseMcqRecallQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseFreeRecallQuery.mockReturnValue({
      data: freeRecallData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseMemoryGapMapQuery.mockReturnValue({
      data: memoryGapData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseSuggestedActionsQuery.mockReturnValue({
      data: actionsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseRecallTrendsQuery.mockReturnValue({
      data: trendsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    customRender(<RecallInsightsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('No MCQ recall data')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    defaultMocks()
    const user = userEvent.setup()
    customRender(<RecallInsightsPage topicId='test-topic' onBack={onBack} />)
    await user.click(screen.getByText('Back to Topic Detail'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls refetch on refresh button click', async () => {
    const refetch = vi.fn()
    mockUseRecallOverviewQuery.mockReturnValue({
      data: overviewData,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    })
    mockUseMcqRecallQuery.mockReturnValue({
      data: mcqData,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    })
    mockUseFreeRecallQuery.mockReturnValue({
      data: freeRecallData,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    })
    mockUseMemoryGapMapQuery.mockReturnValue({
      data: memoryGapData,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    })
    mockUseSuggestedActionsQuery.mockReturnValue({
      data: actionsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    })
    mockUseRecallTrendsQuery.mockReturnValue({
      data: trendsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    })
    const user = userEvent.setup()
    customRender(<RecallInsightsPage topicId='test-topic' onBack={onBack} />)
    const refreshButton = screen.getByRole('button', { name: '' })
    await user.click(refreshButton)
    expect(refetch).toHaveBeenCalled()
  })
})
