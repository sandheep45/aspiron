import { screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { SubjectsPage } from '@/features/subjects-page/components/subjects-page'
import { render as customRender } from '@/test-utils'

beforeAll(() => {
  Element.prototype.getAnimations = () => [] as unknown as Animations[]
})

const {
  mockUseSubjectsPageSubjectsQuery,
  mockUseSubjectsPageSummaryQuery,
  mockUseSubjectsPageSignalsQuery,
} = vi.hoisted(() => ({
  mockUseSubjectsPageSubjectsQuery: vi.fn(),
  mockUseSubjectsPageSummaryQuery: vi.fn(),
  mockUseSubjectsPageSignalsQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useSubjectsPageSubjectsQuery: mockUseSubjectsPageSubjectsQuery,
  useSubjectsPageSummaryQuery: mockUseSubjectsPageSummaryQuery,
  useSubjectsPageSignalsQuery: mockUseSubjectsPageSignalsQuery,
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

const subjectsData = [
  {
    id: '1',
    name: 'Physics',
    chapters_count: 12 as unknown as bigint,
    topics_published: 59 as unknown as bigint,
    coverage: 87,
    average_recall: 0.62,
    practice_accuracy: 0.74,
    status: 'Needs Attention',
  },
  {
    id: '2',
    name: 'Chemistry',
    chapters_count: 10 as unknown as bigint,
    topics_published: 39 as unknown as bigint,
    coverage: 72,
    average_recall: 0.81,
    practice_accuracy: 0.85,
    status: 'Healthy',
  },
]

const summaryData = {
  total_subjects: 4 as unknown as bigint,
  total_topics: 250 as unknown as bigint,
  published_topics: 193 as unknown as bigint,
  topics_needing_attention: 18 as unknown as bigint,
  descriptions: [
    'Physics, Chemistry, Mathematics, Biology',
    '250 topics across 4 subjects',
    '193 topics published and available',
    '18 topics with low recall or accuracy',
  ],
}

const signalsData = [
  {
    subject_name: 'Physics',
    message: 'Physics has fastest recall decay',
    signal_type: 'negative',
  },
  {
    subject_name: 'Chemistry',
    message: 'Chemistry has highest practice accuracy',
    signal_type: 'positive',
  },
]

function setupMocks() {
  mockUseSubjectsPageSubjectsQuery.mockReturnValue({
    data: subjectsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseSubjectsPageSummaryQuery.mockReturnValue({
    data: summaryData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseSubjectsPageSignalsQuery.mockReturnValue({
    data: signalsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
}

describe('SubjectsPage', () => {
  it('renders the page header', () => {
    setupMocks()
    customRender(<SubjectsPage />)
    expect(
      screen.getByText(
        'Choose a subject to review content health, coverage, and performance before exploring chapters.',
      ),
    ).toBeInTheDocument()
  })

  it('renders summary metrics', () => {
    setupMocks()
    customRender(<SubjectsPage />)
    expect(screen.getByText('Total Subjects')).toBeInTheDocument()
    expect(screen.getByText('Total Topics')).toBeInTheDocument()
    expect(screen.getByText('Published Topics')).toBeInTheDocument()
    expect(screen.getByText('Topics Needing Attention')).toBeInTheDocument()
  })

  it('renders subject names in the table', () => {
    setupMocks()
    customRender(<SubjectsPage />)
    expect(screen.getAllByText('Physics').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Chemistry').length).toBeGreaterThanOrEqual(1)
  })

  it('renders signals section', () => {
    setupMocks()
    customRender(<SubjectsPage />)
    expect(screen.getByText('Subject Signals')).toBeInTheDocument()
    expect(
      screen.getByText('Physics has fastest recall decay'),
    ).toBeInTheDocument()
  })

  it('renders loading skeletons', () => {
    mockUseSubjectsPageSubjectsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseSubjectsPageSummaryQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseSubjectsPageSignalsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = customRender(<SubjectsPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  it('renders error states', () => {
    mockUseSubjectsPageSubjectsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load'),
      refetch: vi.fn(),
    })
    mockUseSubjectsPageSummaryQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load'),
      refetch: vi.fn(),
    })
    mockUseSubjectsPageSignalsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load'),
      refetch: vi.fn(),
    })
    customRender(<SubjectsPage />)
    expect(screen.getAllByText('Retry').length).toBeGreaterThan(0)
  })
})
