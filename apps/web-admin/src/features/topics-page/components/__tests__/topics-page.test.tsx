import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const { mockUseSummaryQuery, mockUseTopicsQuery, mockUseInsightsQuery } =
  vi.hoisted(() => ({
    mockUseSummaryQuery: vi.fn(),
    mockUseTopicsQuery: vi.fn(),
    mockUseInsightsQuery: vi.fn(),
  }))

vi.mock('@aspiron/tanstack-client', () => ({
  useTopicSummaryQuery: mockUseSummaryQuery,
  useChapterTopicsQuery: mockUseTopicsQuery,
  useChapterInsightsQuery: mockUseInsightsQuery,
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ chapterId: 'ch-1' }),
}))

import { TopicsPage } from '@/features/topics-page/components/topics-page'

const summaryData = {
  chapter_name: 'Electrostatics',
  total_topics: 8 as unknown as bigint,
  published_topics: 6 as unknown as bigint,
  draft_topics: 2 as unknown as bigint,
  weak_topics: 1 as unknown as bigint,
}

const topicsData = [
  {
    id: 'topic-1',
    name: "Coulomb's Law",
    content_status: 'published',
    video_available: true,
    recall_strength: 'strong',
    practice_accuracy: 90,
    last_activity: '2 hours ago',
    status: 'healthy' as const,
  },
]

const insightsData = [
  {
    id: 'ins-1',
    type: 'positive' as const,
    title: 'All topics equipped',
    description: 'All topics have videos and quizzes.',
  },
]

function mockAllSuccess() {
  mockUseSummaryQuery.mockReturnValue({
    data: summaryData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseTopicsQuery.mockReturnValue({
    data: topicsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseInsightsQuery.mockReturnValue({
    data: insightsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
}

describe('TopicsPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading skeletons', () => {
    mockUseSummaryQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseInsightsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<TopicsPage />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders full content', () => {
    mockAllSuccess()
    render(<TopicsPage />)
    expect(screen.getByText('Electrostatics')).toBeInTheDocument()
    expect(screen.getByText("Coulomb's Law")).toBeInTheDocument()
    expect(screen.getByText('All topics equipped')).toBeInTheDocument()
  })

  it('renders error state with retry', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    mockUseSummaryQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load'),
      refetch,
    })
    mockUseTopicsQuery.mockReturnValue({
      data: topicsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseInsightsQuery.mockReturnValue({
      data: insightsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<TopicsPage />)
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('renders empty topics and insights state', () => {
    mockUseSummaryQuery.mockReturnValue({
      data: summaryData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseInsightsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<TopicsPage />)
    expect(screen.getByText('No topics yet')).toBeInTheDocument()
  })

  it('calls refetch on all 3 queries when refresh is clicked', async () => {
    const refetchSummary = vi.fn()
    const refetchTopics = vi.fn()
    const refetchInsights = vi.fn()
    mockUseSummaryQuery.mockReturnValue({
      data: summaryData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchSummary,
    })
    mockUseTopicsQuery.mockReturnValue({
      data: topicsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchTopics,
    })
    mockUseInsightsQuery.mockReturnValue({
      data: insightsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchInsights,
    })
    const user = userEvent.setup()
    render(<TopicsPage />)
    await user.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(refetchSummary).toHaveBeenCalledTimes(1)
    expect(refetchTopics).toHaveBeenCalledTimes(1)
    expect(refetchInsights).toHaveBeenCalledTimes(1)
  })

  it('calls onBack when Back to Chapters is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    mockAllSuccess()
    render(<TopicsPage onBack={onBack} />)
    await user.click(screen.getByText('Back to Chapters'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onViewTopic when View Topic is clicked', async () => {
    const user = userEvent.setup()
    const onViewTopic = vi.fn()
    mockAllSuccess()
    render(<TopicsPage onViewTopic={onViewTopic} />)
    await user.click(screen.getAllByRole('button', { name: /view topic/i })[0])
    expect(onViewTopic).toHaveBeenCalledWith('topic-1')
  })
})
