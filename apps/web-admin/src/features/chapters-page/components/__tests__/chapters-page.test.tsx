import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const { mockUseSummaryQuery, mockUseChaptersQuery, mockUseInsightsQuery } =
  vi.hoisted(() => ({
    mockUseSummaryQuery: vi.fn(),
    mockUseChaptersQuery: vi.fn(),
    mockUseInsightsQuery: vi.fn(),
  }))

vi.mock('@aspiron/tanstack-client', () => ({
  useSubjectSummaryQuery: mockUseSummaryQuery,
  useSubjectChaptersQuery: mockUseChaptersQuery,
  useSubjectInsightsQuery: mockUseInsightsQuery,
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ subjectId: 'subj-1' }),
}))

import { ChaptersPage } from '@/features/chapters-page/components/chapters-page'

const summaryData = {
  subject_name: 'Physics',
  total_chapters: 8 as unknown as bigint,
  published_topics: 45 as unknown as bigint,
  draft_topics: 12 as unknown as bigint,
  chapters_needing_attention: 2 as unknown as bigint,
}

const chaptersData = [
  {
    id: 'ch-1',
    name: 'Mechanics',
    published_topics: 12 as unknown as bigint,
    total_topics: 15 as unknown as bigint,
    coverage: 80,
    avg_recall: 'strong' as const,
    practice_accuracy: 74,
    status: 'healthy' as const,
    last_updated: '2 days ago',
  },
]

const insightsData = [
  {
    id: 'ins-1',
    type: 'positive' as const,
    title: 'Strong Recall',
    description: 'Mechanics maintains strong recall rates',
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
  mockUseChaptersQuery.mockReturnValue({
    data: chaptersData,
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

describe('ChaptersPage', () => {
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
    mockUseChaptersQuery.mockReturnValue({
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
    const { container } = render(<ChaptersPage />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders full content', () => {
    mockAllSuccess()
    render(<ChaptersPage />)
    expect(screen.getByText('Physics')).toBeInTheDocument()
    expect(screen.getByText('Mechanics')).toBeInTheDocument()
    expect(screen.getByText('Strong Recall')).toBeInTheDocument()
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
    mockUseChaptersQuery.mockReturnValue({
      data: chaptersData,
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
    render(<ChaptersPage />)
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('renders empty chapters and insights state', () => {
    mockUseSummaryQuery.mockReturnValue({
      data: summaryData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseChaptersQuery.mockReturnValue({
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
    render(<ChaptersPage />)
    expect(screen.getByText('No chapters found')).toBeInTheDocument()
    expect(screen.getByText('No insights available yet.')).toBeInTheDocument()
  })

  it('calls refetch on all 3 queries when refresh is clicked', async () => {
    const refetchSummary = vi.fn()
    const refetchChapters = vi.fn()
    const refetchInsights = vi.fn()
    mockUseSummaryQuery.mockReturnValue({
      data: summaryData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchSummary,
    })
    mockUseChaptersQuery.mockReturnValue({
      data: chaptersData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchChapters,
    })
    mockUseInsightsQuery.mockReturnValue({
      data: insightsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchInsights,
    })
    const user = userEvent.setup()
    render(<ChaptersPage />)
    await user.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(refetchSummary).toHaveBeenCalledTimes(1)
    expect(refetchChapters).toHaveBeenCalledTimes(1)
    expect(refetchInsights).toHaveBeenCalledTimes(1)
  })
})
