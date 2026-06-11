import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MissingConceptCard } from '@/features/recall-insights/components/missing-concept-card'

describe('MissingConceptCard', () => {
  const concept = {
    concept: 'Spherical Symmetry Derivation',
    percentage_missing: 62.0,
    ai_summary: 'Students consistently omit the derivation steps.',
  }

  it('renders concept name', () => {
    render(<MissingConceptCard concept={concept} rank={1} />)
    expect(
      screen.getByText('Spherical Symmetry Derivation'),
    ).toBeInTheDocument()
  })

  it('renders rank number', () => {
    render(<MissingConceptCard concept={concept} rank={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders percentage missing', () => {
    render(<MissingConceptCard concept={concept} rank={1} />)
    expect(screen.getByText('62% missing')).toBeInTheDocument()
  })

  it('renders AI summary', () => {
    render(<MissingConceptCard concept={concept} rank={1} />)
    expect(
      screen.getByText('Students consistently omit the derivation steps.'),
    ).toBeInTheDocument()
  })

  it('renders progress bar', () => {
    const { container } = render(
      <MissingConceptCard concept={concept} rank={1} />,
    )
    const bars = container.querySelectorAll('.bg-rose-500')
    expect(bars.length).toBeGreaterThanOrEqual(1)
  })

  it('clamps percentage to 100 for progress bar width', () => {
    const highConcept = { ...concept, percentage_missing: 150 }
    const { container } = render(
      <MissingConceptCard concept={highConcept} rank={1} />,
    )
    const bar = container.querySelector('.bg-rose-500') as HTMLElement
    expect(bar.style.width).toBe('100%')
  })
})
