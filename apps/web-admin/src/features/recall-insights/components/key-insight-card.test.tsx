import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KeyInsightCard } from '@/features/recall-insights/components/key-insight-card'

describe('KeyInsightCard', () => {
  it('renders insight text', () => {
    render(<KeyInsightCard insight='Overall recall is below 50%.' />)
    expect(screen.getByText('Key Insight')).toBeInTheDocument()
    expect(screen.getByText('Overall recall is below 50%.')).toBeInTheDocument()
  })

  it('returns null when insight is empty string', () => {
    const { container } = render(<KeyInsightCard insight='' />)
    expect(container.innerHTML).toBe('')
  })

  it('returns null when insight is empty after trim', () => {
    const { container } = render(<KeyInsightCard insight='   ' />)
    expect(container.innerHTML).not.toBe('')
  })
})
