import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TopicTestCard } from '@/features/practice-tests/components/topic-test-card'

const mockTest = {
  id: 'test-001',
  title: 'Quadratic Equations Assessment',
  status: 'Published',
  questions_count: 10,
  difficulty_mix: 'Balanced',
  average_score: 72.5,
  attempts: 15,
}

describe('TopicTestCard', () => {
  it('renders title and metrics', () => {
    render(<TopicTestCard test={mockTest} />)
    expect(
      screen.getByText('Quadratic Equations Assessment'),
    ).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(
      screen.getByText((content) => content.includes('73')),
    ).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('renders difficulty mix', () => {
    render(<TopicTestCard test={mockTest} />)
    expect(screen.getByText('Balanced')).toBeInTheDocument()
  })

  it('renders draft status styling', () => {
    render(<TopicTestCard test={{ ...mockTest, status: 'Draft' }} />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders archived status', () => {
    render(<TopicTestCard test={{ ...mockTest, status: 'Archived' }} />)
    expect(screen.getByText('Archived')).toBeInTheDocument()
  })

  it('renders dash for null average_score', () => {
    render(<TopicTestCard test={{ ...mockTest, average_score: null }} />)
    expect(screen.getByText('\u2014')).toBeInTheDocument()
  })

  it('renders 4 action buttons', () => {
    const { container } = render(<TopicTestCard test={mockTest} />)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBe(4)
  })
})
