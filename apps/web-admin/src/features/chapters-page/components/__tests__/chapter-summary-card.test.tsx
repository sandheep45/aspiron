import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChapterSummaryCard } from '@/features/chapters-page/components/chapter-summary-card'

describe('ChapterSummaryCard', () => {
  it('renders all 4 metrics', () => {
    const summary = {
      subject_name: 'Physics',
      total_chapters: 8 as unknown as bigint,
      published_topics: 45 as unknown as bigint,
      draft_topics: 12 as unknown as bigint,
      chapters_needing_attention: 2 as unknown as bigint,
    }
    render(<ChapterSummaryCard summary={summary} />)
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('Total Chapters')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('Topics Published')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Topics In Draft')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Chapters With Weak Recall')).toBeInTheDocument()
  })

  it('renders zero values', () => {
    const summary = {
      subject_name: 'Empty',
      total_chapters: 0 as unknown as bigint,
      published_topics: 0 as unknown as bigint,
      draft_topics: 0 as unknown as bigint,
      chapters_needing_attention: 0 as unknown as bigint,
    }
    render(<ChapterSummaryCard summary={summary} />)
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
  })

  it('renders large numbers', () => {
    const summary = {
      subject_name: 'Math',
      total_chapters: 150 as unknown as bigint,
      published_topics: 1200 as unknown as bigint,
      draft_topics: 300 as unknown as bigint,
      chapters_needing_attention: 15 as unknown as bigint,
    }
    render(<ChapterSummaryCard summary={summary} />)
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText('1200')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })
})
