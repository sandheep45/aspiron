import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InsightsSection } from '@/components/ui/insights-section'

describe('InsightsSection', () => {
  it('renders insight cards', () => {
    const insights = [
      {
        id: 'ins-1',
        type: 'positive' as const,
        title: 'All topics fully equipped',
        description: 'Every topic has video and quizzes.',
      },
      {
        id: 'ins-2',
        type: 'warning' as const,
        title: 'Low recall topics',
        description: 'Some topics have low recall rates.',
      },
    ]
    render(<InsightsSection insights={insights} />)
    expect(screen.getByText('All topics fully equipped')).toBeInTheDocument()
    expect(screen.getByText('Low recall topics')).toBeInTheDocument()
    expect(
      screen.getByText('Every topic has video and quizzes.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Some topics have low recall rates.'),
    ).toBeInTheDocument()
  })

  it('renders null when empty', () => {
    const { container } = render(<InsightsSection insights={[]} />)
    expect(container.innerHTML).toBe('')
  })
})
