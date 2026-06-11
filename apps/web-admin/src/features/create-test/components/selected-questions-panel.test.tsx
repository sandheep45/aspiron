import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectedQuestionsPanel } from '@/features/create-test/components/selected-questions-panel'

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => children,
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

const mockQuestion = {
  id: 'q-1',
  identifier: 'Q-0001',
  question: 'What is 2+2?',
  question_type: 'MCQ',
  difficulty: 'Easy',
  correct_rate: 95,
  points: 2,
}

describe('SelectedQuestionsPanel', () => {
  it('renders question details', () => {
    render(
      <SelectedQuestionsPanel
        question={mockQuestion}
        index={0}
        onRemove={vi.fn()}
        onPointsChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Q-0001')).toBeInTheDocument()
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
    expect(screen.getByText('Easy')).toBeInTheDocument()
  })

  it('renders position number', () => {
    render(
      <SelectedQuestionsPanel
        question={mockQuestion}
        index={2}
        onRemove={vi.fn()}
        onPointsChange={vi.fn()}
      />,
    )
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders points input with correct value', () => {
    render(
      <SelectedQuestionsPanel
        question={mockQuestion}
        index={0}
        onRemove={vi.fn()}
        onPointsChange={vi.fn()}
      />,
    )
    const input = screen.getByDisplayValue('2')
    expect(input).toBeInTheDocument()
  })

  it('calls onRemove when delete button is clicked', async () => {
    const onRemove = vi.fn()
    const user = userEvent.setup()
    render(
      <SelectedQuestionsPanel
        question={mockQuestion}
        index={0}
        onRemove={onRemove}
        onPointsChange={vi.fn()}
      />,
    )
    const deleteButton = screen
      .getAllByRole('button')
      .find((b) => b.querySelector('.lucide-trash-2'))
    if (deleteButton) {
      await user.click(deleteButton)
      expect(onRemove).toHaveBeenCalledWith('q-1')
    }
  })

  it('calls onPointsChange when points input changes', async () => {
    const onPointsChange = vi.fn()
    const user = userEvent.setup()
    render(
      <SelectedQuestionsPanel
        question={mockQuestion}
        index={0}
        onRemove={vi.fn()}
        onPointsChange={onPointsChange}
      />,
    )
    const input = screen.getByDisplayValue('2')
    await user.clear(input)
    await user.type(input, '5')
    expect(onPointsChange).toHaveBeenCalledWith('q-1', expect.any(Number))
  })
})
