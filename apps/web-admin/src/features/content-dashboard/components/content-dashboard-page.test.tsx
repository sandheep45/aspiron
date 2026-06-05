import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render as customRender } from '@/test-utils'

beforeAll(() => {
  Element.prototype.getAnimations = () => [] as unknown as Animations[]
})

const {
  mockUseContentSummaryQuery,
  mockUseSubjectProgressQuery,
  mockUseContentSignalsQuery,
  mockUseAttentionItemsQuery,
} = vi.hoisted(() => ({
  mockUseContentSummaryQuery: vi.fn(),
  mockUseSubjectProgressQuery: vi.fn(),
  mockUseContentSignalsQuery: vi.fn(),
  mockUseAttentionItemsQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useContentSummaryQuery: mockUseContentSummaryQuery,
  useSubjectProgressQuery: mockUseSubjectProgressQuery,
  useContentSignalsQuery: mockUseContentSignalsQuery,
  useAttentionItemsQuery: mockUseAttentionItemsQuery,
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const summaryData = {
  subjects_covered: 3 as unknown as bigint,
  topics_published: 147 as unknown as bigint,
  topics_in_draft: 23 as unknown as bigint,
  topics_flagged: 12 as unknown as bigint,
}

const subjectsData = [
  {
    id: '1',
    name: 'Physics',
    completion: 87,
    total_topics: 68 as unknown as bigint,
    published_topics: 59 as unknown as bigint,
    draft_topics: 9 as unknown as bigint,
  },
  {
    id: '2',
    name: 'Chemistry',
    completion: 72,
    total_topics: 54 as unknown as bigint,
    published_topics: 39 as unknown as bigint,
    draft_topics: 15 as unknown as bigint,
  },
]

const signalsData = {
  highest_recall: [
    { topic: 'Physics', score: 84, drop: null as unknown as undefined },
  ],
  fastest_decay: [
    { topic: 'Chemistry', score: null as unknown as undefined, drop: 28 },
  ],
}

const attentionData = {
  total: 2 as unknown as bigint,
  items: [
    {
      id: '1',
      topic: 'Physics',
      issue: 'Low Recall',
      reason: 'Recall decline',
      students_affected: 23 as unknown as bigint,
    },
    {
      id: '2',
      topic: 'Chemistry',
      issue: 'Poor Accuracy',
      reason: 'Accuracy below 60%',
      students_affected: 15 as unknown as bigint,
    },
  ],
}

function defaultMocks() {
  mockUseContentSummaryQuery.mockReturnValue({
    data: summaryData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseSubjectProgressQuery.mockReturnValue({
    data: subjectsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseContentSignalsQuery.mockReturnValue({
    data: signalsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseAttentionItemsQuery.mockReturnValue({
    data: attentionData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
}

import { ContentDashboardPage } from '@/features/content-dashboard/components/content-dashboard-page'

describe('ContentDashboardPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders page heading', () => {
    defaultMocks()
    customRender(<ContentDashboardPage />)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders all 4 sections', () => {
    defaultMocks()
    customRender(<ContentDashboardPage />)
    expect(screen.getByText('Content Health Snapshot')).toBeInTheDocument()
    expect(screen.getByText('Content Needing Attention')).toBeInTheDocument()
    expect(screen.getByText('Subject Entry Points')).toBeInTheDocument()
    expect(screen.getByText('Content Quality Signals')).toBeInTheDocument()
  })

  it('renders metric cards with summary data', () => {
    defaultMocks()
    customRender(<ContentDashboardPage />)
    expect(screen.getByText('Subjects Covered')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders subject cards', () => {
    defaultMocks()
    customRender(<ContentDashboardPage />)
    expect(screen.getByText('87%')).toBeInTheDocument()
    expect(screen.getByText('72%')).toBeInTheDocument()
  })

  it('renders signal sections', () => {
    defaultMocks()
    customRender(<ContentDashboardPage />)
    expect(screen.getByText('Topics With Highest Recall')).toBeInTheDocument()
  })

  it('renders skeleton while summary loads', () => {
    mockUseContentSummaryQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseSubjectProgressQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseContentSignalsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseAttentionItemsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = customRender(<ContentDashboardPage />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThanOrEqual(4)
  })

  it('renders error state for summary', () => {
    mockUseContentSummaryQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load content summary'),
      refetch: vi.fn(),
    })
    mockUseSubjectProgressQuery.mockReturnValue({
      data: subjectsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseContentSignalsQuery.mockReturnValue({
      data: signalsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseAttentionItemsQuery.mockReturnValue({
      data: attentionData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    customRender(<ContentDashboardPage />)
    expect(
      screen.getByText('Failed to load content summary'),
    ).toBeInTheDocument()
  })

  it('renders empty state when no subjects', () => {
    mockUseContentSummaryQuery.mockReturnValue({
      data: summaryData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseSubjectProgressQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseContentSignalsQuery.mockReturnValue({
      data: signalsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseAttentionItemsQuery.mockReturnValue({
      data: attentionData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    customRender(<ContentDashboardPage />)
    expect(screen.getByText('No subjects found')).toBeInTheDocument()
  })

  it('calls refetch on refresh button click', async () => {
    const refetchSummary = vi.fn()
    const refetchAttention = vi.fn()
    const refetchSubjects = vi.fn()
    const refetchSignals = vi.fn()
    mockUseContentSummaryQuery.mockReturnValue({
      data: summaryData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchSummary,
    })
    mockUseAttentionItemsQuery.mockReturnValue({
      data: attentionData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchAttention,
    })
    mockUseSubjectProgressQuery.mockReturnValue({
      data: subjectsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchSubjects,
    })
    mockUseContentSignalsQuery.mockReturnValue({
      data: signalsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchSignals,
    })
    const user = userEvent.setup()
    customRender(<ContentDashboardPage />)
    const refreshButton = screen.getByRole('button', { name: '' })
    await user.click(refreshButton)
    expect(refetchSummary).toHaveBeenCalledTimes(1)
    expect(refetchAttention).toHaveBeenCalledTimes(1)
    expect(refetchSubjects).toHaveBeenCalledTimes(1)
    expect(refetchSignals).toHaveBeenCalledTimes(1)
  })
})
