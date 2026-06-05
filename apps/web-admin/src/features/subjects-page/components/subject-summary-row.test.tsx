import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubjectSummaryRow } from '@/features/subjects-page/components/subject-summary-row'

describe('SubjectSummaryRow', () => {
  const summary = {
    total_subjects: 4 as unknown as bigint,
    total_topics: 250 as unknown as bigint,
    published_topics: 193 as unknown as bigint,
    topics_needing_attention: 18 as unknown as bigint,
    descriptions: [
      'Physics, Chemistry, Mathematics, Biology',
      '250 topics across 4 subjects',
      '193 topics published and available',
      '18 topics with low recall or accuracy',
    ],
  }

  it('renders all 4 metric cards with labels', () => {
    render(<SubjectSummaryRow summary={summary} />)
    expect(screen.getByText('Total Subjects')).toBeInTheDocument()
    expect(screen.getByText('Total Topics')).toBeInTheDocument()
    expect(screen.getByText('Published Topics')).toBeInTheDocument()
    expect(screen.getByText('Topics Needing Attention')).toBeInTheDocument()
  })

  it('renders correct values', () => {
    render(<SubjectSummaryRow summary={summary} />)
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('250')).toBeInTheDocument()
    expect(screen.getByText('193')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
  })

  it('description has title tooltip', () => {
    render(<SubjectSummaryRow summary={summary} />)
    const descEl = screen.getByText('Physics, Chemistry, Mathematics, Biology')
    expect(descEl).toHaveAttribute(
      'title',
      'Physics, Chemistry, Mathematics, Biology',
    )
  })

  it('handles missing descriptions gracefully', () => {
    const emptySummary = {
      total_subjects: 0 as unknown as bigint,
      total_topics: 0 as unknown as bigint,
      published_topics: 0 as unknown as bigint,
      topics_needing_attention: 0 as unknown as bigint,
      descriptions: [] as string[],
    }
    const { container } = render(<SubjectSummaryRow summary={emptySummary} />)
    expect(container.querySelectorAll('.truncate')).toHaveLength(4)
  })
})
