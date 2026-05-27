import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LiveClassesPage } from '@/features/live-classes/components/live-classes-page'

const { mockUseUpcomingClassesQuery } = vi.hoisted(() => ({
  mockUseUpcomingClassesQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useUpcomingClassesQuery: mockUseUpcomingClassesQuery,
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
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
  scheduled_at: makeDate(0, 0),
  duration_min: 45,
  provider: 'Zoom',
  join_url: 'https://zoom.us/j/101',
}

const successData = {
  classes: [
    {
      ...baseClass,
      id: '1',
      provider: 'Zoom',
      scheduled_at: makeDate(0, 0, -20),
      duration_min: 60,
    },
    {
      ...baseClass,
      id: '2',
      provider: 'Google Meet',
      scheduled_at: makeDate(0, 4),
      duration_min: 45,
    },
    {
      ...baseClass,
      id: '3',
      provider: 'Microsoft Teams',
      scheduled_at: makeDate(1, 0),
      duration_min: 30,
    },
  ],
  pagination: {
    page: 1,
    limit: 9,
    total: 3,
    total_pages: 1,
    filtered_total: 3n,
  },
}

describe('LiveClassesPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders heading', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<LiveClassesPage />)
    expect(screen.getByText('Live Classes')).toBeInTheDocument()
  })

  it('renders skeleton while loading', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<LiveClassesPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  it('renders error state with retry that refetches', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load'),
      refetch,
    })
    render(<LiveClassesPage />)
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when no classes', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: {
        classes: [],
        pagination: {
          page: 1,
          limit: 9,
          total: 0,
          total_pages: 0,
          filtered_total: 0n,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<LiveClassesPage />)
    expect(
      screen.getByText('No upcoming classes scheduled'),
    ).toBeInTheDocument()
  })

  it('renders class cards with provider names', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<LiveClassesPage />)
    const cards = screen.getAllByTestId('class-card')
    expect(cards).toHaveLength(3)
    expect(screen.getByText('Zoom')).toBeInTheDocument()
    expect(screen.getByText('Google Meet')).toBeInTheDocument()
  })

  it('renders duration for each class', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<LiveClassesPage />)
    expect(screen.getByText('60 min')).toBeInTheDocument()
    expect(screen.getByText('45 min')).toBeInTheDocument()
    expect(screen.getByText('30 min')).toBeInTheDocument()
  })

  it('renders CTA button on each card', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<LiveClassesPage />)
    const ctas = screen.getAllByRole('button', { name: /Launch|View/ })
    expect(ctas).toHaveLength(3)
  })

  it('renders status badges', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<LiveClassesPage />)
    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getAllByText('Upcoming')).toHaveLength(2)
  })

  it('shows pagination info', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<LiveClassesPage />)
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument()
  })

  it('disables both pagination buttons on single page', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<LiveClassesPage />)
    expect(screen.getByRole('button', { name: /Previous/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Next/ })).toBeDisabled()
  })

  it('handles null data gracefully', () => {
    mockUseUpcomingClassesQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<LiveClassesPage />)
    expect(
      screen.getByText('No upcoming classes scheduled'),
    ).toBeInTheDocument()
  })
})
