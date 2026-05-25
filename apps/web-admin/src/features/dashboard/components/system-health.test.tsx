import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SystemHealth } from '@/features/dashboard/components/system-health'

const { mockUseInsightQuery } = vi.hoisted(() => ({
  mockUseInsightQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useInsightQuery: mockUseInsightQuery,
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

describe('SystemHealth', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders section heading', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<SystemHealth />)
    expect(screen.getByText('System Health')).toBeInTheDocument()
  })

  it('renders 4 metric cards with labels', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<SystemHealth />)
    expect(screen.getByText('Active Students')).toBeInTheDocument()
    expect(screen.getByText('Tests Conducted')).toBeInTheDocument()
    expect(screen.getByText('Content Published')).toBeInTheDocument()
    expect(screen.getByText('Average Attendance')).toBeInTheDocument()
  })

  it('renders numeric values for each metric', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<SystemHealth />)
    const values = screen.getAllByText(/^[0-9]+%?$/)
    expect(values).toHaveLength(4)
  })

  it('renders skeleton while loading', () => {
    mockUseInsightQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<SystemHealth />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('Active Students')).not.toBeInTheDocument()
  })

  it('renders error state with retry button', async () => {
    const refetch = vi.fn()
    const user = userEvent.setup()
    mockUseInsightQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load metrics'),
      refetch,
    })
    render(<SystemHealth />)
    expect(screen.getByTestId('module-error')).toBeInTheDocument()
    expect(screen.getByText('Failed to load metrics')).toBeInTheDocument()
    await user.click(screen.getByTestId('retry-button'))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when insights array is empty', () => {
    mockUseInsightQuery.mockReturnValue({
      data: {
        ...successData,
        insights: [],
        summary: { ...successData.summary, total: 0 },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<SystemHealth />)
    expect(screen.getByText('No metrics available')).toBeInTheDocument()
  })

  it('sets data-dashboard-section attribute', () => {
    mockUseInsightQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<SystemHealth />)
    expect(
      container.querySelector('[data-dashboard-section="system-health"]'),
    ).toBeInTheDocument()
  })
})
