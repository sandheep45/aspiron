import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuestionsTable } from '@/features/practice-tests/components/questions-table'

const mockItems = [
  {
    id: 'q-0001',
    identifier: 'Q-0001',
    question: 'What is the derivative of x²?',
    question_type: 'MCQ',
    difficulty: 'Medium',
    correct_rate: 75,
    status: 'Active',
  },
  {
    id: 'q-0002',
    identifier: 'Q-0002',
    question: 'What is 2+2?',
    question_type: 'MCQ',
    difficulty: 'Easy',
    correct_rate: 95,
    status: 'Active',
  },
]

describe('QuestionsTable', () => {
  const defaultProps = {
    items: mockItems,
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
    onParamsChange: vi.fn(),
  }

  it('renders question rows', () => {
    render(<QuestionsTable {...defaultProps} />)
    expect(screen.getByText('Q-0001')).toBeInTheDocument()
    expect(screen.getByText('Q-0002')).toBeInTheDocument()
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
  })

  it('renders header columns', () => {
    const { container } = render(<QuestionsTable {...defaultProps} />)
    const headers = container.querySelectorAll('th')
    const headerTexts = Array.from(headers).map((h) => h.textContent)
    expect(headerTexts).toContain('Identifier')
    expect(headerTexts).toContain('Question')
    expect(headerTexts).toContain('Difficulty')
    expect(headerTexts).toContain('Correct Rate')
    expect(headerTexts).toContain('Status')
    expect(headerTexts).toContain('Actions')
  })

  it('renders skeleton when loading', () => {
    const { container } = render(
      <QuestionsTable {...defaultProps} loading items={undefined} />,
    )
    expect(
      container.querySelectorAll('.animate-pulse').length,
    ).toBeGreaterThanOrEqual(6)
  })

  it('renders empty state when items is empty', () => {
    render(<QuestionsTable {...defaultProps} items={[]} total={0} />)
    expect(screen.getByText('No questions found')).toBeInTheDocument()
  })

  it('renders empty state when items is undefined', () => {
    render(<QuestionsTable {...defaultProps} items={undefined} total={0} />)
    expect(screen.getByText('No questions found')).toBeInTheDocument()
  })

  it('calls onParamsChange on search input', async () => {
    const onParamsChange = vi.fn()
    const user = userEvent.setup()
    render(<QuestionsTable {...defaultProps} onParamsChange={onParamsChange} />)
    const searchInput = screen.getByPlaceholderText('Search questions...')
    await user.type(searchInput, 'derivative')
    expect(onParamsChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'd' }),
    )
  })

  it('renders pagination when totalPages > 1', () => {
    render(<QuestionsTable {...defaultProps} totalPages={3} total={25} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not render pagination when totalPages is 1', () => {
    render(<QuestionsTable {...defaultProps} totalPages={1} />)
    expect(screen.queryByText('2')).not.toBeInTheDocument()
  })

  it('renders correct rate with color', () => {
    render(<QuestionsTable {...defaultProps} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument()
  })
})
