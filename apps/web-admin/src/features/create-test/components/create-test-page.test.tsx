import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render as customRender } from '@/test-utils'

const { mockUseQuestionsQuery, mockUseCreateTestMutation } = vi.hoisted(() => ({
  mockUseQuestionsQuery: vi.fn(),
  mockUseCreateTestMutation: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useQuestionsQuery: mockUseQuestionsQuery,
  useCreateTestMutation: mockUseCreateTestMutation,
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

import { CreateTestPage } from '@/features/create-test/components/create-test-page'

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
    {
      id: 'q-2',
      identifier: 'Q-0002',
      question: 'Solve for x?',
      question_type: 'Numerical',
      difficulty: 'Medium',
      correct_rate: 72,
      status: 'Active',
    },
  ],
  total: 2,
  page: 1,
  limit: 50,
  total_pages: 1,
}

describe('CreateTestPage', () => {
  const onBack = vi.fn()
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseQuestionsQuery.mockReturnValue({
      data: questionsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseCreateTestMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    })
  })

  it('renders page heading', () => {
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Create Topic Test')).toBeInTheDocument()
  })

  it('renders all section headings', () => {
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Test Settings')).toBeInTheDocument()
    expect(screen.getByText('Question Selection')).toBeInTheDocument()
    expect(screen.getByText('Test Builder')).toBeInTheDocument()
    expect(screen.getByText('Publishing Checklist')).toBeInTheDocument()
  })

  it('renders test settings fields', () => {
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    expect(
      screen.getByPlaceholderText('e.g., Quadratic Equations Assessment'),
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Brief description of the test'),
    ).toBeInTheDocument()
  })

  it('renders question selection area', () => {
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Q-0001')).toBeInTheDocument()
    expect(screen.getByText('Q-0002')).toBeInTheDocument()
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
  })

  it('renders no questions selected message', () => {
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('No questions selected yet')).toBeInTheDocument()
  })

  it('renders Search, Type filter, and Difficulty filter', () => {
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    expect(
      screen.getByPlaceholderText('Search questions...'),
    ).toBeInTheDocument()
    expect(screen.getByText('All Types')).toBeInTheDocument()
    expect(screen.getByText('All Difficulties')).toBeInTheDocument()
  })

  it('renders Save Draft button', () => {
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Save Draft')).toBeInTheDocument()
  })

  it('renders Cancel and Publish Test buttons', () => {
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Publish Test')).toBeInTheDocument()
  })

  it('renders Student Preview toggle button', () => {
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Student Preview')).toBeInTheDocument()
  })

  it('shows preview on toggle', async () => {
    const user = userEvent.setup()
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    await user.click(screen.getByText('Student Preview'))
    expect(screen.getByText('Hide Preview')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    await user.click(screen.getByText('Back to Practice & Tests'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onBack when Cancel is clicked', async () => {
    const user = userEvent.setup()
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    await user.click(screen.getByText('Cancel'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('renders loading spinner when questions load', () => {
    mockUseQuestionsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders error state for questions', () => {
    mockUseQuestionsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load'),
      refetch: vi.fn(),
    })
    customRender(<CreateTestPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })
})
