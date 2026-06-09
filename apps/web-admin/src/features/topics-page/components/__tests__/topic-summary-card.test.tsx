import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TopicSummaryCard } from '@/features/topics-page/components/topic-summary-card'

describe('TopicSummaryCard', () => {
  it('renders all 4 metrics', () => {
    const summary = {
      chapter_name: 'Electrostatics',
      total_topics: 8 as unknown as bigint,
      published_topics: 6 as unknown as bigint,
      draft_topics: 2 as unknown as bigint,
      weak_topics: 1 as unknown as bigint,
    }
    render(<TopicSummaryCard summary={summary} />)
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('Total Topics')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('Topics Published')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Topics In Draft')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Topics Flagged As Weak')).toBeInTheDocument()
  })

  it('renders zero values', () => {
    const summary = {
      chapter_name: 'Empty',
      total_topics: 0 as unknown as bigint,
      published_topics: 0 as unknown as bigint,
      draft_topics: 0 as unknown as bigint,
      weak_topics: 0 as unknown as bigint,
    }
    render(<TopicSummaryCard summary={summary} />)
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
  })

  it('renders large numbers', () => {
    const summary = {
      chapter_name: 'Math',
      total_topics: 150 as unknown as bigint,
      published_topics: 120 as unknown as bigint,
      draft_topics: 30 as unknown as bigint,
      weak_topics: 15 as unknown as bigint,
    }
    render(<TopicSummaryCard summary={summary} />)
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })
})
