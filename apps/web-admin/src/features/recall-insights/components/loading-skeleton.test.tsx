import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  ActionCardSkeleton,
  DifficultyBreakdownSkeleton,
  MemoryGapTableSkeleton,
  MissingConceptSkeleton,
  QuestionTableSkeleton,
  RecallOverviewSkeleton,
  TrendsChartsSkeleton,
} from '@/features/recall-insights/components/loading-skeleton'

describe('LoadingSkeleton', () => {
  it('renders RecallOverviewSkeleton with 4 skeleton items', () => {
    const { container } = render(<RecallOverviewSkeleton />)
    const items = container.querySelectorAll('.animate-pulse')
    expect(items.length).toBeGreaterThanOrEqual(4)
  })

  it('renders DifficultyBreakdownSkeleton with 3 skeleton items', () => {
    const { container } = render(<DifficultyBreakdownSkeleton />)
    const items = container.querySelectorAll('.animate-pulse')
    expect(items.length).toBeGreaterThanOrEqual(3)
  })

  it('renders QuestionTableSkeleton with filter and rows', () => {
    const { container } = render(<QuestionTableSkeleton />)
    const items = container.querySelectorAll('.animate-pulse')
    expect(items.length).toBeGreaterThanOrEqual(6)
  })

  it('renders MissingConceptSkeleton with 3 items', () => {
    const { container } = render(<MissingConceptSkeleton />)
    const items = container.querySelectorAll('.animate-pulse')
    expect(items.length).toBeGreaterThanOrEqual(3)
  })

  it('renders MemoryGapTableSkeleton with header and rows', () => {
    const { container } = render(<MemoryGapTableSkeleton />)
    const items = container.querySelectorAll('.animate-pulse')
    expect(items.length).toBeGreaterThanOrEqual(7)
  })

  it('renders ActionCardSkeleton', () => {
    const { container } = render(<ActionCardSkeleton />)
    const items = container.querySelectorAll('.animate-pulse')
    expect(items.length).toBeGreaterThanOrEqual(5)
  })

  it('renders TrendsChartsSkeleton with 4 chart cards', () => {
    const { container } = render(<TrendsChartsSkeleton />)
    const items = container.querySelectorAll('.animate-pulse')
    expect(items.length).toBeGreaterThanOrEqual(4)
  })
})
