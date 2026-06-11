import type { McqQuestionItem } from '@aspiron/api-client'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { QuestionPerformanceTable } from '@/features/recall-insights/components/question-performance-table'

const items: McqQuestionItem[] = [
  {
    question_number: 'Q-0001',
    concept: "Gauss's Law Statement",
    difficulty: 'Easy',
    recall_accuracy: 100.0,
    attempts: 1 as unknown as bigint,
  },
  {
    question_number: 'Q-0002',
    concept: 'Flux Calculation',
    difficulty: 'Medium',
    recall_accuracy: 50.0,
    attempts: 2 as unknown as bigint,
  },
  {
    question_number: 'Q-0003',
    concept: 'Spherical Symmetry',
    difficulty: 'Hard',
    recall_accuracy: 0.0,
    attempts: 3 as unknown as bigint,
  },
]

describe('QuestionPerformanceTable', () => {
  it('renders skeleton while loading', () => {
    const { container } = render(
      <QuestionPerformanceTable items={undefined} loading />,
    )
    expect(
      container.querySelectorAll('.animate-pulse').length,
    ).toBeGreaterThanOrEqual(6)
  })

  it('returns null when items is undefined and not loading', () => {
    const { container } = render(
      <QuestionPerformanceTable items={undefined} loading={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('returns null when items is empty', () => {
    const { container } = render(<QuestionPerformanceTable items={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders table headers', () => {
    render(<QuestionPerformanceTable items={items} />)
    expect(screen.getByText('Question #')).toBeInTheDocument()
    expect(screen.getByText('Concept')).toBeInTheDocument()
    expect(screen.getByText('Difficulty')).toBeInTheDocument()
    expect(screen.getByText('Recall Accuracy')).toBeInTheDocument()
    expect(screen.getByText('Attempts')).toBeInTheDocument()
  })

  it('renders all question rows', () => {
    render(<QuestionPerformanceTable items={items} />)
    expect(screen.getByText('Q-0001')).toBeInTheDocument()
    expect(screen.getByText('Q-0002')).toBeInTheDocument()
    expect(screen.getByText('Q-0003')).toBeInTheDocument()
    expect(screen.getByText("Gauss's Law Statement")).toBeInTheDocument()
    expect(screen.getByText('Flux Calculation')).toBeInTheDocument()
    expect(screen.getByText('Spherical Symmetry')).toBeInTheDocument()
  })

  it('renders difficulty badges', () => {
    render(<QuestionPerformanceTable items={items} />)
    expect(screen.getByText('Easy')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Hard')).toBeInTheDocument()
  })

  it('filters by search query', async () => {
    const user = userEvent.setup()
    render(<QuestionPerformanceTable items={items} />)
    const searchInput = screen.getByPlaceholderText('Search questions...')
    await user.type(searchInput, 'Flux')
    expect(screen.getByText('Flux Calculation')).toBeInTheDocument()
    expect(screen.queryByText("Gauss's Law Statement")).not.toBeInTheDocument()
    expect(screen.queryByText('Spherical Symmetry')).not.toBeInTheDocument()
  })

  it('sorts by recall accuracy when header clicked', async () => {
    const user = userEvent.setup()
    render(<QuestionPerformanceTable items={items} />)

    // Get initial order
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Q-0001')

    // Click Recall Accuracy header to sort asc
    await user.click(screen.getByText('Recall Accuracy'))
    // After asc sort: Q-0003 (0%), Q-0002 (50%), Q-0001 (100%)
    const rowsAsc = screen.getAllByRole('row')
    expect(rowsAsc[1]).toHaveTextContent('Q-0003')

    // Click again to sort desc
    await user.click(screen.getByText('Recall Accuracy'))
    const rowsDesc = screen.getAllByRole('row')
    expect(rowsDesc[1]).toHaveTextContent('Q-0001')
  })

  it('shows pagination when more than 10 items', () => {
    const manyItems: McqQuestionItem[] = Array.from({ length: 15 }, (_, i) => ({
      question_number: `Q-${String(i + 1).padStart(4, '0')}`,
      concept: `Concept ${i + 1}`,
      difficulty: 'Easy',
      recall_accuracy: 50.0,
      attempts: 1 as unknown as bigint,
    }))
    render(<QuestionPerformanceTable items={manyItems} />)
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('does not show pagination when 10 or fewer items', () => {
    render(<QuestionPerformanceTable items={items} />)
    expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument()
  })
})
