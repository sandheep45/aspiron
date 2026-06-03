import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  PatternInsightsEmptyState,
  PatternInsightsSection,
} from './pattern-insights-section'

const mockInsights = [
  {
    id: '1',
    title: 'Numerical-heavy topics show faster recall decay',
    metric: 'Affects 60% of struggling students',
  },
  {
    id: '2',
    title: 'Students skip spaced repetition on weak topics',
    metric: '45 students have incomplete recall sessions',
  },
  {
    id: '3',
    title: 'Concept gaps compound across related chapters',
    metric: '3/12 topics show cascading failures',
  },
  {
    id: '4',
    title: 'Passive learning without practice leads to 40% accuracy drop',
    metric: '52% average accuracy on first recall',
  },
]

describe('PatternInsightsSection', () => {
  it('renders section heading and description', () => {
    render(<PatternInsightsSection insights={mockInsights} />)
    expect(screen.getByText('Pattern Insights')).toBeInTheDocument()
    expect(
      screen.getByText('Recurring trends detected across struggling students.'),
    ).toBeInTheDocument()
  })

  it('renders all insight cards with titles', () => {
    render(<PatternInsightsSection insights={mockInsights} />)
    expect(
      screen.getByText('Numerical-heavy topics show faster recall decay'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Students skip spaced repetition on weak topics'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Concept gaps compound across related chapters'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Passive learning without practice leads to 40% accuracy drop',
      ),
    ).toBeInTheDocument()
  })

  it('renders metric values for each insight', () => {
    render(<PatternInsightsSection insights={mockInsights} />)
    expect(
      screen.getByText('Affects 60% of struggling students'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('45 students have incomplete recall sessions'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('3/12 topics show cascading failures'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('52% average accuracy on first recall'),
    ).toBeInTheDocument()
  })
})

describe('PatternInsightsEmptyState', () => {
  it('renders empty state message', () => {
    render(<PatternInsightsEmptyState />)
    expect(screen.getByText('No patterns detected yet')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Insights will appear once sufficient student data is collected.',
      ),
    ).toBeInTheDocument()
  })
})
