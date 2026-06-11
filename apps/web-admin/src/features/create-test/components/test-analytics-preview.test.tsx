import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TestAnalyticsPreview } from '@/features/create-test/components/test-analytics-preview'

const mockData = {
  easy: 3,
  medium: 4,
  hard: 2,
  totalTime: 18,
  coverageScore: 75,
  predictedDifficulty: 'Medium',
  total: 9,
}

const mockQuestions = [
  {
    id: 'q-1',
    identifier: 'Q-0001',
    question: 'Q1',
    question_type: 'MCQ',
    difficulty: 'Easy',
    points: 1,
  },
  {
    id: 'q-2',
    identifier: 'Q-0002',
    question: 'Q2',
    question_type: 'MCQ',
    difficulty: 'Medium',
    points: 2,
  },
  {
    id: 'q-3',
    identifier: 'Q-0003',
    question: 'Q3',
    question_type: 'Numerical',
    difficulty: 'Hard',
    points: 3,
  },
]

describe('TestAnalyticsPreview', () => {
  it('renders metric cards', () => {
    render(<TestAnalyticsPreview data={mockData} questions={mockQuestions} />)
    expect(screen.getByText('Total Questions')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('Est. Time')).toBeInTheDocument()
    expect(screen.getByText('18m')).toBeInTheDocument()
    expect(screen.getByText('Coverage Score')).toBeInTheDocument()
    expect(screen.getByText('Predicted Difficulty')).toBeInTheDocument()
  })

  it('renders predicted difficulty', () => {
    render(<TestAnalyticsPreview data={mockData} questions={mockQuestions} />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders type counts', () => {
    render(<TestAnalyticsPreview data={mockData} questions={mockQuestions} />)
    expect(screen.getByText('MCQ')).toBeInTheDocument()
    expect(screen.getByText('Numerical')).toBeInTheDocument()
  })

  it('renders chart headings', () => {
    render(<TestAnalyticsPreview data={mockData} questions={mockQuestions} />)
    expect(screen.getByText('Difficulty Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Coverage Breakdown')).toBeInTheDocument()
  })
})
