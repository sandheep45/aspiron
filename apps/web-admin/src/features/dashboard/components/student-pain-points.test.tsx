import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StudentPainPoints } from '@/features/dashboard/components/student-pain-points'

const { mockUseTopicPerformanceQuery } = vi.hoisted(() => ({
  mockUseTopicPerformanceQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useTopicPerformanceQuery: mockUseTopicPerformanceQuery,
}))

const baseTopic = {
  topic_id: '1',
  topic_name: 'Quadratic Equations',
  chapter_name: 'Algebra',
  subject_name: 'Mathematics',
  recall_strength_mcq: 0.65,
  recall_strength_reflection: 0.55,
  practice_accuracy: 0.48,
  students_affected: 12 as unknown as bigint,
  total_students: 30 as unknown as bigint,
}

const successData = {
  topics: [
    {
      ...baseTopic,
      topic_id: '1',
      topic_name: 'Quadratic Equations',
      practice_accuracy: 0.32,
      students_affected: 18 as unknown as bigint,
    },
    {
      ...baseTopic,
      topic_id: '2',
      topic_name: 'Photosynthesis',
      practice_accuracy: 0.45,
      students_affected: 14 as unknown as bigint,
    },
    {
      ...baseTopic,
      topic_id: '3',
      topic_name: "Newton's Laws",
      practice_accuracy: 0.52,
      students_affected: 10 as unknown as bigint,
    },
    {
      ...baseTopic,
      topic_id: '4',
      topic_name: 'Chemical Bonding',
      practice_accuracy: 0.61,
      students_affected: 8 as unknown as bigint,
    },
    {
      ...baseTopic,
      topic_id: '5',
      topic_name: 'Thermodynamics',
      practice_accuracy: 0.73,
      students_affected: 5 as unknown as bigint,
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 5 as unknown as bigint,
    filtered_total: 5 as unknown as bigint,
    total_pages: 1,
  },
}

describe('StudentPainPoints', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders section heading', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<StudentPainPoints />)
    expect(screen.getByText('Student Pain Points')).toBeInTheDocument()
  })

  it('renders topic rows with names', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<StudentPainPoints />)
    expect(screen.getByText('Quadratic Equations')).toBeInTheDocument()
    expect(screen.getByText('Photosynthesis')).toBeInTheDocument()
    expect(screen.getByText("Newton's Laws")).toBeInTheDocument()
  })

  it('renders chapter and subject info', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<StudentPainPoints />)
    expect(screen.getAllByText(/Algebra.*Mathematics/).length).toBeGreaterThan(
      0,
    )
  })

  it('renders status badges with correct labels', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<StudentPainPoints />)
    const badges = screen.getAllByText(/Weak|Medium|Strong/)
    expect(badges).toHaveLength(5)
    expect(badges[0]).toHaveTextContent('Weak')
    expect(badges[4]).toHaveTextContent('Strong')
  })

  it('renders accuracy percentages', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<StudentPainPoints />)
    expect(screen.getByText('32%')).toBeInTheDocument()
    expect(screen.getByText('73%')).toBeInTheDocument()
  })

  it('renders skeleton while loading', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<StudentPainPoints />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('Quadratic Equations')).not.toBeInTheDocument()
  })

  it('renders empty state when no topics', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: { ...successData, topics: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<StudentPainPoints />)
    expect(screen.getByText('No topic data available yet')).toBeInTheDocument()
  })

  it('renders error state with retry button', async () => {
    const refetch = vi.fn()
    const user = userEvent.setup()
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load topics'),
      refetch,
    })
    render(<StudentPainPoints />)
    expect(screen.getByTestId('module-error')).toBeInTheDocument()
    expect(screen.getByText('Failed to load topics')).toBeInTheDocument()
    await user.click(screen.getByTestId('retry-button'))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('sets data-dashboard-section attribute', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<StudentPainPoints />)
    expect(
      container.querySelector('[data-dashboard-section="pain-points"]'),
    ).toBeInTheDocument()
  })
})
