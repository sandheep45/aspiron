import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { render as customRender } from '@/test-utils'

const {
  mockUseTopicOverviewQuery,
  mockUseTopicIssuesQuery,
  mockUseTopicComponentsQuery,
  mockUseTopicActionsQuery,
  mockUseTopicTrendsQuery,
} = vi.hoisted(() => ({
  mockUseTopicOverviewQuery: vi.fn(),
  mockUseTopicIssuesQuery: vi.fn(),
  mockUseTopicComponentsQuery: vi.fn(),
  mockUseTopicActionsQuery: vi.fn(),
  mockUseTopicTrendsQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useTopicOverviewQuery: mockUseTopicOverviewQuery,
  useTopicIssuesQuery: mockUseTopicIssuesQuery,
  useTopicComponentsQuery: mockUseTopicComponentsQuery,
  useTopicActionsQuery: mockUseTopicActionsQuery,
  useTopicTrendsQuery: mockUseTopicTrendsQuery,
}))

const overviewData = {
  recall_strength: 'strong',
  practice_accuracy: 85,
  dropoff_indicator: 'low',
  engagement_trend: 'growing',
}

const issuesData = [
  {
    id: 'recall-weak',
    title: 'Weak Recall',
    severity: 'high',
    description: 'Students have poor recall.',
    recommendation: 'More practice',
    action_label: 'Review',
  },
]

const componentsData = [
  {
    id: 'video',
    name: 'Video',
    status: 'published',
    performance: '10 completed',
    action: 'Manage',
  },
  {
    id: 'practice-questions',
    name: 'Questions',
    status: 'published',
    performance: '8 completed',
    action: 'Edit',
  },
]

const actionsData = [
  { id: 'preview', label: 'Preview', description: 'View topic', icon: 'eye' },
  {
    id: 'schedule',
    label: 'Schedule',
    description: 'Schedule session',
    icon: 'calendar',
  },
]

const trendsData = {
  recall_trend: [
    { date: '2026-01-01', value: 70 },
    { date: '2026-01-08', value: 85 },
  ],
  practice_accuracy_trend: [{ date: '2026-01-02', value: 75 }],
  engagement_trend: [{ date: '2026-01-01', value: 5 }],
  completion_trend: [{ date: '2026-01-02', value: 100 }],
}

function defaultMocks() {
  mockUseTopicOverviewQuery.mockReturnValue({
    data: overviewData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseTopicIssuesQuery.mockReturnValue({
    data: issuesData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseTopicComponentsQuery.mockReturnValue({
    data: componentsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseTopicActionsQuery.mockReturnValue({
    data: actionsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseTopicTrendsQuery.mockReturnValue({
    data: trendsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
}

import { TopicDetailPage } from '@/features/topic-detail/components/topic-detail-page'

const defaultProps = {
  topicId: 'test-topic',
  topicName: "Newton's Laws",
  onBack: vi.fn(),
}

describe('TopicDetailPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders page heading with topic name', () => {
    defaultMocks()
    customRender(<TopicDetailPage {...defaultProps} />)
    expect(screen.getByText("Newton's Laws")).toBeInTheDocument()
  })

  it('renders back navigation button', () => {
    defaultMocks()
    customRender(<TopicDetailPage {...defaultProps} />)
    expect(screen.getByText('Back to Topics')).toBeInTheDocument()
  })

  it('calls onBack when back button clicked', async () => {
    const onBack = vi.fn()
    defaultMocks()
    const user = userEvent.setup()
    customRender(<TopicDetailPage {...defaultProps} onBack={onBack} />)
    await user.click(screen.getByText('Back to Topics'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('renders all 4 health cards', () => {
    defaultMocks()
    customRender(<TopicDetailPage {...defaultProps} />)
    expect(screen.getByText('Recall Strength')).toBeInTheDocument()
    expect(screen.getByText('Practice Accuracy')).toBeInTheDocument()
    expect(screen.getByText('Drop-off Indicator')).toBeInTheDocument()
    expect(
      screen.getAllByText('Engagement Trend').length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders issues section with issue data', () => {
    defaultMocks()
    customRender(<TopicDetailPage {...defaultProps} />)
    expect(screen.getByText('Weak Recall')).toBeInTheDocument()
    expect(screen.getByText(/1 issue/)).toBeInTheDocument()
  })

  it('renders components section', () => {
    defaultMocks()
    customRender(<TopicDetailPage {...defaultProps} />)
    expect(screen.getByText('Video')).toBeInTheDocument()
    expect(screen.getByText('Questions')).toBeInTheDocument()
  })

  it('renders quick actions', () => {
    defaultMocks()
    customRender(<TopicDetailPage {...defaultProps} />)
    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
  })

  it('renders performance trends', () => {
    defaultMocks()
    customRender(<TopicDetailPage {...defaultProps} />)
    expect(screen.getByText('Recall Trend')).toBeInTheDocument()
    expect(screen.getByText('Practice Accuracy Trend')).toBeInTheDocument()
  })

  it('renders healthy status badge when all metrics positive', () => {
    defaultMocks()
    customRender(<TopicDetailPage {...defaultProps} />)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })

  it('renders critical status when 2+ metrics negative', () => {
    mockUseTopicOverviewQuery.mockReturnValue({
      data: {
        recall_strength: 'weak',
        practice_accuracy: 30,
        dropoff_indicator: 'high',
        engagement_trend: 'declining',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicIssuesQuery.mockReturnValue({
      data: issuesData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicComponentsQuery.mockReturnValue({
      data: componentsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicActionsQuery.mockReturnValue({
      data: actionsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicTrendsQuery.mockReturnValue({
      data: trendsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    customRender(<TopicDetailPage {...defaultProps} />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('renders skeleton while overview loads', () => {
    mockUseTopicOverviewQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicIssuesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicComponentsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicActionsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicTrendsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = customRender(<TopicDetailPage {...defaultProps} />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThanOrEqual(4)
  })

  it('renders error state for overview', () => {
    mockUseTopicOverviewQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load topic health'),
      refetch: vi.fn(),
    })
    mockUseTopicIssuesQuery.mockReturnValue({
      data: issuesData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicComponentsQuery.mockReturnValue({
      data: componentsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicActionsQuery.mockReturnValue({
      data: actionsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicTrendsQuery.mockReturnValue({
      data: trendsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    customRender(<TopicDetailPage {...defaultProps} />)
    expect(screen.getByText('Failed to load topic health')).toBeInTheDocument()
  })

  it('renders empty state when no issues', () => {
    mockUseTopicOverviewQuery.mockReturnValue({
      data: overviewData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicIssuesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicComponentsQuery.mockReturnValue({
      data: componentsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicActionsQuery.mockReturnValue({
      data: actionsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicTrendsQuery.mockReturnValue({
      data: trendsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    customRender(<TopicDetailPage {...defaultProps} />)
    expect(screen.getByText('No issues detected')).toBeInTheDocument()
  })

  it('hides trends section when trends data is null', () => {
    mockUseTopicOverviewQuery.mockReturnValue({
      data: overviewData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicIssuesQuery.mockReturnValue({
      data: issuesData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicComponentsQuery.mockReturnValue({
      data: componentsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicActionsQuery.mockReturnValue({
      data: actionsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicTrendsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    customRender(<TopicDetailPage {...defaultProps} />)
    expect(screen.queryByText('Performance Trends')).not.toBeInTheDocument()
  })

  it('calls refetch on refresh button click', async () => {
    const refetchOverview = vi.fn()
    const refetchIssues = vi.fn()
    const refetchComponents = vi.fn()
    const refetchActions = vi.fn()
    const refetchTrends = vi.fn()
    mockUseTopicOverviewQuery.mockReturnValue({
      data: overviewData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchOverview,
    })
    mockUseTopicIssuesQuery.mockReturnValue({
      data: issuesData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchIssues,
    })
    mockUseTopicComponentsQuery.mockReturnValue({
      data: componentsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchComponents,
    })
    mockUseTopicActionsQuery.mockReturnValue({
      data: actionsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchActions,
    })
    mockUseTopicTrendsQuery.mockReturnValue({
      data: trendsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchTrends,
    })
    const user = userEvent.setup()
    customRender(<TopicDetailPage {...defaultProps} />)
    const refreshButton = screen.getByRole('button', { name: '' })
    await user.click(refreshButton)
    expect(refetchOverview).toHaveBeenCalledTimes(1)
    expect(refetchIssues).toHaveBeenCalledTimes(1)
    expect(refetchComponents).toHaveBeenCalledTimes(1)
    expect(refetchActions).toHaveBeenCalledTimes(1)
    expect(refetchTrends).toHaveBeenCalledTimes(1)
  })
})
