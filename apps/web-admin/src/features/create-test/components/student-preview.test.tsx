import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StudentPreview } from '@/features/create-test/components/student-preview'

const mockQuestions = [
  {
    id: 'q-1',
    identifier: 'Q-0001',
    question: 'What is 2+2?',
    question_type: 'MCQ',
    difficulty: 'Easy',
    points: 1,
  },
  {
    id: 'q-2',
    identifier: 'Q-0002',
    question: 'Solve for x: x² - 4 = 0',
    question_type: 'MCQ',
    difficulty: 'Medium',
    points: 2,
  },
  {
    id: 'q-3',
    identifier: 'Q-0003',
    question: 'Integrate sin(x) dx',
    question_type: 'MCQ',
    difficulty: 'Hard',
    points: 3,
  },
]

describe('StudentPreview', () => {
  it('renders empty state when no questions', () => {
    render(<StudentPreview questions={[]} duration={30} />)
    expect(screen.getByText('No questions in test yet')).toBeInTheDocument()
  })

  it('renders test header with duration and question count', () => {
    render(<StudentPreview questions={mockQuestions} duration={30} />)
    expect(screen.getByText('Practice Test')).toBeInTheDocument()
    expect(screen.getByText('30 min')).toBeInTheDocument()
    expect(screen.getByText('3 Questions')).toBeInTheDocument()
  })

  it('renders question items', () => {
    render(<StudentPreview questions={mockQuestions} duration={30} />)
    expect(screen.getByText('Q-0001')).toBeInTheDocument()
    expect(screen.getByText('Q-0002')).toBeInTheDocument()
    expect(screen.getByText('Q-0003')).toBeInTheDocument()
  })

  it('renders total points', () => {
    render(<StudentPreview questions={mockQuestions} duration={30} />)
    expect(screen.getByText('6 Points')).toBeInTheDocument()
  })

  it('renders navigation dots for up to 8 questions', () => {
    const { container } = render(
      <StudentPreview questions={mockQuestions} duration={30} />,
    )
    const navDot1 = container.querySelector('[class*="bg-sky-500/20"]')
    expect(navDot1).toBeInTheDocument()
  })

  it('renders submit button (disabled)', () => {
    render(<StudentPreview questions={mockQuestions} duration={30} />)
    const submitBtn = screen.getByText('Submit')
    expect(submitBtn).toBeInTheDocument()
    expect(submitBtn).toBeDisabled()
  })

  it('renders question id badges', () => {
    render(<StudentPreview questions={mockQuestions} duration={30} />)
    expect(screen.getByText('Q-0001')).toBeInTheDocument()
  })

  it('renders difficulty labels', () => {
    render(<StudentPreview questions={mockQuestions} duration={30} />)
    expect(screen.getByText('Easy')).toBeInTheDocument()
    expect(screen.getByText('Hard')).toBeInTheDocument()
  })
})
