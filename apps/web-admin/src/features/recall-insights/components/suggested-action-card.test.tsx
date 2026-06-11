import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SuggestedActionCard } from '@/features/recall-insights/components/suggested-action-card'

describe('SuggestedActionCard', () => {
  const action = {
    id: 'spherical-symmetry',
    icon: 'alert-triangle',
    detected_issue: 'Students struggle with spherical symmetry calculations',
    explanation:
      '62% of students missed mathematical derivation for spherical symmetry.',
    suggested_fix: 'Review derivation video at 7:20.',
    primary_cta: 'Review Video',
  }

  it('renders detected issue', () => {
    render(<SuggestedActionCard action={action} />)
    expect(
      screen.getByText(
        'Students struggle with spherical symmetry calculations',
      ),
    ).toBeInTheDocument()
  })

  it('renders explanation', () => {
    render(<SuggestedActionCard action={action} />)
    expect(
      screen.getByText(
        '62% of students missed mathematical derivation for spherical symmetry.',
      ),
    ).toBeInTheDocument()
  })

  it('renders suggested fix', () => {
    render(<SuggestedActionCard action={action} />)
    expect(
      screen.getByText('Review derivation video at 7:20.'),
    ).toBeInTheDocument()
  })

  it('renders primary CTA button', () => {
    render(<SuggestedActionCard action={action} />)
    expect(screen.getByText('Review Video')).toBeInTheDocument()
  })

  it('renders with bar-chart icon', () => {
    const chartAction = { ...action, icon: 'bar-chart' }
    render(<SuggestedActionCard action={chartAction} />)
    expect(
      screen.getByText(
        'Students struggle with spherical symmetry calculations',
      ),
    ).toBeInTheDocument()
  })

  it('renders with unknown icon', () => {
    const unknownAction = { ...action, icon: 'unknown-icon' }
    render(<SuggestedActionCard action={unknownAction} />)
    expect(
      screen.getByText(
        'Students struggle with spherical symmetry calculations',
      ),
    ).toBeInTheDocument()
  })
})
