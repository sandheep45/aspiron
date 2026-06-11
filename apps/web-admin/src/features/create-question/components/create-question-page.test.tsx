import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render as customRender } from '@/test-utils'

const { mockUseCreateQuestionMutation } = vi.hoisted(() => ({
  mockUseCreateQuestionMutation: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useCreateQuestionMutation: mockUseCreateQuestionMutation,
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { CreateQuestionPage } from '@/features/create-question/components/create-question-page'

describe('CreateQuestionPage', () => {
  const onBack = vi.fn()
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCreateQuestionMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    })
  })

  it('renders page heading', () => {
    customRender(<CreateQuestionPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Create Practice Question')).toBeInTheDocument()
  })

  it('renders all section headings', () => {
    customRender(<CreateQuestionPage topicId='test-topic' onBack={onBack} />)
    const els = screen.getAllByText('Quality Checklist')
    expect(els.length).toBeGreaterThanOrEqual(1)
    expect(
      screen.getAllByText((content) => content.includes('Question Statement'))
        .length,
    ).toBeGreaterThanOrEqual(1)
    expect(
      screen.getAllByText((content) => content.includes('Question Metadata'))
        .length,
    ).toBeGreaterThanOrEqual(1)
    expect(
      screen.getAllByText((content) => content.includes('Answer Configuration'))
        .length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders question type select', () => {
    customRender(<CreateQuestionPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('MCQ')).toBeInTheDocument()
  })

  it('renders difficulty select', () => {
    customRender(<CreateQuestionPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders status select', () => {
    customRender(<CreateQuestionPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders learning objective input', () => {
    customRender(<CreateQuestionPage topicId='test-topic' onBack={onBack} />)
    expect(
      screen.getByPlaceholderText(
        'e.g., Understand quadratic equation factoring',
      ),
    ).toBeInTheDocument()
  })

  it('renders rich text editor for question statement', () => {
    customRender(<CreateQuestionPage topicId='test-topic' onBack={onBack} />)
    const toolbarBtns = screen.getAllByRole('button')
    const titles = toolbarBtns.map((b) => b.getAttribute('title'))
    expect(titles).toContain('Bold')
    expect(titles).toContain('Italic')
  })

  it('renders Cancel and Create Question buttons', () => {
    customRender(<CreateQuestionPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Create Question')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    customRender(<CreateQuestionPage topicId='test-topic' onBack={onBack} />)
    await user.click(screen.getByText('Back to Practice & Tests'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onBack when Cancel is clicked', async () => {
    const user = userEvent.setup()
    customRender(<CreateQuestionPage topicId='test-topic' onBack={onBack} />)
    await user.click(screen.getByText('Cancel'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('shows Preview button', () => {
    customRender(<CreateQuestionPage topicId='test-topic' onBack={onBack} />)
    expect(screen.getByText('Preview')).toBeInTheDocument()
  })

  it('toggles preview on button click', async () => {
    const user = userEvent.setup()
    customRender(<CreateQuestionPage topicId='test-topic' onBack={onBack} />)
    await user.click(screen.getByText('Preview'))
    expect(screen.getByText('Hide Preview')).toBeInTheDocument()
  })
})
