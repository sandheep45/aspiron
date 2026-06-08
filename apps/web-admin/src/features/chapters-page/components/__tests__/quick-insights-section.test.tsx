import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuickInsightsSection } from '@/features/chapters-page/components/quick-insights-section'

describe('QuickInsightsSection', () => {
  it('renders insight cards', () => {
    const insights = [
      {
        id: 'ins-1',
        type: 'positive' as const,
        title: 'Strong Recall',
        description: 'Students show strong recall in Mechanics',
      },
      {
        id: 'ins-2',
        type: 'warning' as const,
        title: 'Low Coverage',
        description: 'Thermodynamics has low coverage',
      },
    ]
    render(<QuickInsightsSection insights={insights} />)
    expect(screen.getByText('Strong Recall')).toBeInTheDocument()
    expect(screen.getByText('Low Coverage')).toBeInTheDocument()
    expect(
      screen.getByText('Students show strong recall in Mechanics'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Thermodynamics has low coverage'),
    ).toBeInTheDocument()
  })

  it('renders null when empty', () => {
    const { container } = render(<QuickInsightsSection insights={[]} />)
    expect(container.innerHTML).toBe('')
  })
})
