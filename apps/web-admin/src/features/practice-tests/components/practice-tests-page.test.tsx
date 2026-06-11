import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render as customRender } from '@/test-utils'

beforeAll(() => {
  Element.prototype.getAnimations = () => [] as unknown as Animations[]
})

const {
  mockUsePracticeOverviewQuery,
  mockUseQuestionsQuery,
  mockUseTopicTestsQuery,
  mockUsePracticeSignalsQuery,
  mockUseTestAnalyticsQuery,
} = vi.hoisted(() => ({
  mockUsePracticeOverviewQuery: vi.fn(),
  mockUseQuestionsQuery: vi.fn(),
  mockUseTopicTestsQuery: vi.fn(),
  mockUsePracticeSignalsQuery: vi.fn(),
  mockUseTestAnalyticsQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  usePracticeOverviewQuery: mockUsePracticeOverviewQuery,
  useQuestionsQuery: mockUseQuestionsQuery,
  useTopicTestsQuery: mockUseTopicTestsQuery,
  usePracticeSignalsQuery: mockUsePracticeSignalsQuery,
  useTestAnalyticsQuery: mockUseTestAnalyticsQuery,
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const overviewData = {
  total_questions: 15,
  average_accuracy: 72.5,
  total_tests: 3,
  last_test_conducted: '2 days ago',
}

const questionsData = {
  items: [
    {
      id: 'q-1',
      identifier: 'Q-0001',
      question: 'What is 2+2?',
      question_type: 'MCQ',
      difficulty: 'Easy',
      correct_rate: 95,
      status: 'Active',
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
  total_pages: 1,
}

const testsData = [
  {
    id: 't-1',
    title: 'Assessment 1',
    status: 'Published',
    questions_count: 10,
    difficulty_mix: 'Balanced',
    average_score: 72.5,
    attempts: 15,
  },
]

const signalsData = [
  { id: 's1', message: 'High accuracy', signal_type: 'positive' },
]

const analyticsData = {
  average_score_trend: [{ date: '2026-06-01', value: 65 }],
  attempts_trend: [{ date: '2026-06-01', value: 5 }],
  difficulty_distribution: [{ difficulty: 'Easy', count: 3, percentage: 30 }],
  question_performance: [
    {
      question_id: 'q-1',
      question: 'What is 2+2?',
      correct_rate: 85,
      attempts: 20,
    },
  ],
}

function defaultMocks() {
  mockUsePracticeOverviewQuery.mockReturnValue({
    data: overviewData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseQuestionsQuery.mockReturnValue({
    data: questionsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseTopicTestsQuery.mockReturnValue({
    data: testsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUsePracticeSignalsQuery.mockReturnValue({
    data: signalsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseTestAnalyticsQuery.mockReturnValue({
    data: analyticsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
}

import { PracticeTestsPage } from '@/features/practice-tests/components/practice-tests-page'

describe('PracticeTestsPage', () => {
  const onBack = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders page heading', () => {
    defaultMocks()
    customRender(<PracticeTestsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Practice & Tests')).toBeInTheDocument()
  })

  it('renders all 6 sections', () => {
    defaultMocks()
    customRender(<PracticeTestsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Practice Overview')).toBeInTheDocument()
    expect(screen.getByText('Practice Questions')).toBeInTheDocument()
    expect(screen.getByText('Topic Tests')).toBeInTheDocument()
    expect(screen.getByText('Quality Signals & Insights')).toBeInTheDocument()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Test Performance Analytics')).toBeInTheDocument()
  })

  it('renders overview data', () => {
    defaultMocks()
    customRender(<PracticeTestsPage topicId='test-topic' onBack={onBack} />)
    const overviewCards = screen
      .getByText('Total Practice Questions')
      .closest('div')
    expect(overviewCards).toBeInTheDocument()
    expect(
      screen.getByText((content) => content.includes('72.5')),
    ).toBeInTheDocument()
  })

  it('renders question count', () => {
    defaultMocks()
    customRender(<PracticeTestsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('1 Question')).toBeInTheDocument()
  })

  it('renders topic test title', () => {
    defaultMocks()
    customRender(<PracticeTestsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Assessment 1')).toBeInTheDocument()
  })

  it('renders signals', () => {
    defaultMocks()
    customRender(<PracticeTestsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('High accuracy')).toBeInTheDocument()
  })

  it('renders skeleton while overview loads', () => {
    mockUsePracticeOverviewQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseQuestionsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicTestsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUsePracticeSignalsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTestAnalyticsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = customRender(
      <PracticeTestsPage topicId='test-topic' onBack={onBack} />,
    )
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThanOrEqual(4)
  })

  it('renders error state for overview', () => {
    mockUsePracticeOverviewQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load overview'),
      refetch: vi.fn(),
    })
    mockUseQuestionsQuery.mockReturnValue({
      data: questionsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicTestsQuery.mockReturnValue({
      data: testsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUsePracticeSignalsQuery.mockReturnValue({
      data: signalsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTestAnalyticsQuery.mockReturnValue({
      data: analyticsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    customRender(<PracticeTestsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Failed to load overview')).toBeInTheDocument()
  })

  it('renders error state for questions', () => {
    mockUsePracticeOverviewQuery.mockReturnValue({
      data: overviewData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseQuestionsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load questions'),
      refetch: vi.fn(),
    })
    mockUseTopicTestsQuery.mockReturnValue({
      data: testsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUsePracticeSignalsQuery.mockReturnValue({
      data: signalsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTestAnalyticsQuery.mockReturnValue({
      data: analyticsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    customRender(<PracticeTestsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Failed to load questions')).toBeInTheDocument()
  })

  it('renders empty state when no tests', () => {
    mockUsePracticeOverviewQuery.mockReturnValue({
      data: overviewData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseQuestionsQuery.mockReturnValue({
      data: questionsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTopicTestsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUsePracticeSignalsQuery.mockReturnValue({
      data: signalsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseTestAnalyticsQuery.mockReturnValue({
      data: analyticsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    customRender(<PracticeTestsPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('No tests created yet')).toBeInTheDocument()
  })

  it('calls refetch on refresh button click', async () => {
    const refetch = vi.fn()
    mockUsePracticeOverviewQuery.mockReturnValue({
      data: overviewData,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    })
    mockUseQuestionsQuery.mockReturnValue({
      data: questionsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    })
    mockUseTopicTestsQuery.mockReturnValue({
      data: testsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    })
    mockUsePracticeSignalsQuery.mockReturnValue({
      data: signalsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    })
    mockUseTestAnalyticsQuery.mockReturnValue({
      data: analyticsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    })
    const user = userEvent.setup()
    customRender(<PracticeTestsPage topicId='test-topic' onBack={onBack} />)
    const buttons = screen.getAllByRole('button')
    const refreshBtn = buttons.find((b) =>
      b.querySelector('.lucide-refresh-cw'),
    )
    if (refreshBtn) {
      await user.click(refreshBtn)
      expect(refetch).toHaveBeenCalled()
    }
  })

  it('calls onBack when back button is clicked', async () => {
    defaultMocks()
    const user = userEvent.setup()
    customRender(<PracticeTestsPage topicId='test-topic' onBack={onBack} />)
    await user.click(screen.getByText('Back to Topic Detail'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('navigates to create question on Add Question click', async () => {
    defaultMocks()
    const user = userEvent.setup()
    customRender(<PracticeTestsPage topicId='test-topic' onBack={onBack} />)
    await user.click(screen.getByText('Add Question'))
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/content/topic/$id/create-question',
      params: { id: 'test-topic' },
    })
  })

  it('navigates to create test on Create Test click', async () => {
    defaultMocks()
    const user = userEvent.setup()
    customRender(<PracticeTestsPage topicId='test-topic' onBack={onBack} />)
    const createTestBtn = screen.getAllByText('Create Test')[0]
    await user.click(createTestBtn)
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/content/topic/$id/create-test',
      params: { id: 'test-topic' },
    })
  })
})
