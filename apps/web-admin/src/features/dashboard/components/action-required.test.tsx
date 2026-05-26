import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ActionRequired } from '@/features/dashboard/components/action-required'

const { mockUseInsightQuery } = vi.hoisted(() => ({
  mockUseInsightQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useInsightQuery: mockUseInsightQuery,
  useGetTopicByIdQuery: () => ({ data: null, isLoading: false }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const successData = {
  time_window: {
    start: '2025-01-01T00:00:00Z',
    end: '2025-01-31T00:00:00Z',
  },
  insights: [
    {
      id: '1',
      insight_type: 'quiz_review_pending',
      severity: 'danger',
      title: 'Quizzes Pending Review',
      description: '5 quizzes need your attention',
      metadata: { quiz_id: 'quiz-1', count: 5 },
      detected_at: new Date('2025-01-15T10:00:00Z'),
    },
    {
      id: '2',
      insight_type: 'low_attendance',
      severity: 'warning',
      title: 'Low Attendance',
      description: 'Class attendance dropped to 60%',
      metadata: { session_id: 'session-1', attendance_rate: 60 },
      detected_at: new Date('2025-01-15T11:00:00Z'),
    },
    {
      id: '3',
      insight_type: 'low_engagement',
      severity: 'info',
      title: 'Low Engagement',
      description: 'Students not completing assignments',
      metadata: { topic_id: 'topic-1', engagement_rate: 45 },
      detected_at: new Date('2025-01-15T12:00:00Z'),
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
  pagination: { page: 1, limit: 10, total: 3 },
}

describe('ActionRequired', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders section heading in success state', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<ActionRequired />)
    expect(screen.getByText('Action Required')).toBeInTheDocument()
  })

  it('renders insight cards from mocked data', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<ActionRequired />)
    expect(screen.getByText('Quizzes Pending Review')).toBeInTheDocument()
    expect(screen.getByText('Low Attendance')).toBeInTheDocument()
    expect(screen.getByText('Low Engagement')).toBeInTheDocument()
  })

  it('renders insight descriptions', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<ActionRequired />)
    expect(
      screen.getByText('5 quizzes need your attention'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Class attendance dropped to 60%'),
    ).toBeInTheDocument()
  })

  it('renders skeleton while loading', () => {
    mockUseInsightQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<ActionRequired />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('Quizzes Pending Review')).not.toBeInTheDocument()
  })

  it('renders empty state when no insights', () => {
    mockUseInsightQuery.mockReturnValue({
      data: { ...successData, insights: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<ActionRequired />)
    expect(
      screen.getByText('No items need attention right now'),
    ).toBeInTheDocument()
    expect(screen.getByText('Everything looks healthy.')).toBeInTheDocument()
  })

  it('renders error state with retry button', async () => {
    const refetch = vi.fn()
    mockUseInsightQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch insights'),
      refetch,
    })
    const user = userEvent.setup()

    render(<ActionRequired />)

    expect(screen.getByTestId('module-error')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch insights')).toBeInTheDocument()

    await user.click(screen.getByTestId('retry-button'))
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
