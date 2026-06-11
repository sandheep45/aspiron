import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FreeRecallSection } from '@/features/recall-insights/components/free-recall-section'

const mockData = {
  participation_rate: 60.0,
  ai_clarity_score: 72.5,
  average_response_length: 85 as unknown as bigint,
  missing_concepts: [
    {
      concept: 'Spherical Symmetry',
      percentage_missing: 62.0,
      ai_summary: 'Students consistently omit the derivation steps.',
    },
    {
      concept: 'Sign Conventions',
      percentage_missing: 48.0,
      ai_summary: 'Positive and negative charge signs misapplied.',
    },
  ],
}

describe('FreeRecallSection', () => {
  it('renders skeleton while loading', () => {
    const { container } = render(<FreeRecallSection data={undefined} loading />)
    expect(
      container.querySelectorAll('.animate-pulse').length,
    ).toBeGreaterThanOrEqual(3)
  })

  it('returns null when data is undefined and not loading', () => {
    const { container } = render(
      <FreeRecallSection data={undefined} loading={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders 3 metric cards', () => {
    render(<FreeRecallSection data={mockData} />)
    expect(screen.getByText('Participation Rate')).toBeInTheDocument()
    expect(screen.getByText('AI Clarity Score')).toBeInTheDocument()
    expect(screen.getByText('Avg Response Length')).toBeInTheDocument()
  })

  it('renders metric values', () => {
    render(<FreeRecallSection data={mockData} />)
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('73%')).toBeInTheDocument()
    expect(screen.getByText('85 chars')).toBeInTheDocument()
  })

  it('renders missing concept cards', () => {
    render(<FreeRecallSection data={mockData} />)
    expect(screen.getByText('Common Missing Concepts')).toBeInTheDocument()
    expect(screen.getByText('Spherical Symmetry')).toBeInTheDocument()
    expect(screen.getByText('Sign Conventions')).toBeInTheDocument()
  })

  it('does not render missing concepts section when empty', () => {
    const emptyData = { ...mockData, missing_concepts: [] }
    render(<FreeRecallSection data={emptyData} />)
    expect(
      screen.queryByText('Common Missing Concepts'),
    ).not.toBeInTheDocument()
  })
})
