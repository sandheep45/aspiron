import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InsightsPage } from '@/features/insights/components/insights-page'

const { mockUseInsightQuery } = vi.hoisted(() => ({
  mockUseInsightQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useInsightQuery: mockUseInsightQuery,
}))

const now = new Date()

const successData = {
  time_window: { start: new Date(), end: new Date() },
  insights: [
    {
      id: '1',
      insight_type: 'low_attendance' as const,
      severity: 'danger' as const,
      title: 'Low Attendance',
      description: 'Math class had 40% attendance',
      metadata: {},
      detected_at: now,
    },
    {
      id: '2',
      insight_type: 'topic_difficulty' as const,
      severity: 'warning' as const,
      title: 'Tough Topic',
      description: 'Students struggling with algebra',
      metadata: {},
      detected_at: now,
    },
    {
      id: '3',
      insight_type: 'quiz_review_pending' as const,
      severity: 'info' as const,
      title: 'Quiz Pending',
      description: '5 quizzes need review',
      metadata: {},
      detected_at: now,
    },
  ],
  summary: {
    total: 3,
    filtered_item: null,
    filtered_item_count: 0,
    danger: 1,
    success: 0,
    neutral: 0,
    warning: 1,
    info: 1,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 3n,
    filtered_total: 3n,
    total_pages: 1,
  },
}

describe('InsightsPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders heading', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
    })
    render(<InsightsPage />)
    expect(screen.getByText('All Insights')).toBeInTheDocument()
  })

  it('renders skeleton while loading', () => {
    mockUseInsightQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    })
    const { container } = render(<InsightsPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  it('renders error state', () => {
    mockUseInsightQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('API error'),
    })
    render(<InsightsPage />)
    expect(screen.getByText('API error')).toBeInTheDocument()
  })

  it('renders empty state when no insights', () => {
    mockUseInsightQuery.mockReturnValue({
      data: { ...successData, insights: [] },
      isLoading: false,
      isError: false,
      error: null,
    })
    render(<InsightsPage />)
    expect(screen.getByText('No insights found')).toBeInTheDocument()
  })

  it('renders insight table with titles', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
    })
    render(<InsightsPage />)
    expect(screen.getByText('Low Attendance')).toBeInTheDocument()
    expect(screen.getByText('Tough Topic')).toBeInTheDocument()
    expect(screen.getByText('Quiz Pending')).toBeInTheDocument()
  })

  it('renders severity badges', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
    })
    render(<InsightsPage />)
    expect(screen.getByText('danger')).toBeInTheDocument()
    expect(screen.getByText('warning')).toBeInTheDocument()
    expect(screen.getByText('info')).toBeInTheDocument()
  })

  it('renders type labels', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
    })
    render(<InsightsPage />)
    expect(screen.getByText('Attendance')).toBeInTheDocument()
    expect(screen.getByText('Difficulty')).toBeInTheDocument()
    expect(screen.getByText('Quiz Review')).toBeInTheDocument()
  })

  it('renders filter selects', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
    })
    render(<InsightsPage />)
    expect(screen.getByText('All Severities')).toBeInTheDocument()
    expect(screen.getByText('All Types')).toBeInTheDocument()
  })

  it('shows pagination info', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
    })
    render(<InsightsPage />)
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument()
  })

  it('handles null data gracefully', () => {
    mockUseInsightQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    })
    render(<InsightsPage />)
    expect(screen.getByText('No insights found')).toBeInTheDocument()
  })
})
