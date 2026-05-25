import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { UpcomingClasses } from '@/features/dashboard/components/upcoming-classes'

const { mockUseUpcomingClassesQuery } = vi.hoisted(() => ({
  mockUseUpcomingClassesQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useUpcomingClassesQuery: mockUseUpcomingClassesQuery,
}))

function makeDate(daysOffset: number, hoursOffset = 0, minsOffset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  d.setHours(d.getHours() + hoursOffset)
  d.setMinutes(d.getMinutes() + minsOffset)
  return d as unknown as Date
}

const baseClass = {
  id: '1',
  topic_id: 'topic-1',
  scheduled_at: makeDate(0, 0, 90),
  duration_min: 45,
  provider: 'Quadratic Equations Review',
  join_url: 'https://zoom.us/j/101',
}

const successData = [
  {
    ...baseClass,
    id: '1',
    provider: 'Quadratic Equations Review',
    scheduled_at: makeDate(0, 0, -20),
    duration_min: 60,
    join_url: 'https://zoom.us/j/101',
  },
  {
    ...baseClass,
    id: '2',
    provider: 'Photosynthesis Deep Dive',
    scheduled_at: makeDate(0, 0, 90),
    duration_min: 45,
    join_url: 'https://zoom.us/j/102',
  },
  {
    ...baseClass,
    id: '3',
    provider: "Newton's Laws Workshop",
    scheduled_at: makeDate(1, 0, 0),
    duration_min: 30,
    join_url: 'https://zoom.us/j/103',
  },
]

describe('UpcomingClasses', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders section heading', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<UpcomingClasses />)
    expect(screen.getByText('Upcoming Classes')).toBeInTheDocument()
  })

  it('renders class cards with titles', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<UpcomingClasses />)
    const cards = screen.getAllByTestId('class-card')
    expect(cards).toHaveLength(3)
    expect(screen.getByText('Quadratic Equations Review')).toBeInTheDocument()
    expect(screen.getByText('Photosynthesis Deep Dive')).toBeInTheDocument()
  })

  it('renders status labels for each class', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<UpcomingClasses />)
    const labels = screen.getAllByTestId('status-label')
    expect(labels).toHaveLength(3)
  })

  it('renders duration info', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<UpcomingClasses />)
    expect(screen.getByText('60 min')).toBeInTheDocument()
    expect(screen.getByText('45 min')).toBeInTheDocument()
    expect(screen.getByText('30 min')).toBeInTheDocument()
  })

  it('renders skeleton while loading', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<UpcomingClasses />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(
      screen.queryByText('Quadratic Equations Review'),
    ).not.toBeInTheDocument()
  })

  it('renders empty state when no classes', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<UpcomingClasses />)
    expect(
      screen.getByText('No upcoming classes scheduled'),
    ).toBeInTheDocument()
    expect(screen.getByText('Schedule a Class')).toBeInTheDocument()
  })

  it('renders error state with retry button', async () => {
    const refetch = vi.fn()
    const user = userEvent.setup()
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load classes'),
      refetch,
    })
    render(<UpcomingClasses />)
    expect(screen.getByTestId('module-error')).toBeInTheDocument()
    expect(screen.getByText('Failed to load classes')).toBeInTheDocument()
    await user.click(screen.getByTestId('retry-button'))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('sets data-dashboard-section attribute', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<UpcomingClasses />)
    expect(
      container.querySelector('[data-dashboard-section="upcoming-classes"]'),
    ).toBeInTheDocument()
  })

  it('renders CTA button on each card', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<UpcomingClasses />)
    const buttons = screen.getAllByRole('button', { name: /Launch|View/ })
    expect(buttons).toHaveLength(3)
  })
})
