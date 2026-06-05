import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QualitySignalsSection } from '@/features/content-dashboard/components/quality-signals-section'

describe('QualitySignalsSection', () => {
  it('renders section header', () => {
    render(<QualitySignalsSection highestRecall={[]} fastestDecay={[]} />)
    expect(screen.getByText('Content Quality Signals')).toBeInTheDocument()
  })

  it('renders both signal cards', () => {
    render(<QualitySignalsSection highestRecall={[]} fastestDecay={[]} />)
    expect(screen.getByText('Topics With Highest Recall')).toBeInTheDocument()
    expect(
      screen.getByText('Topics With Fastest Recall Decay'),
    ).toBeInTheDocument()
  })
})
