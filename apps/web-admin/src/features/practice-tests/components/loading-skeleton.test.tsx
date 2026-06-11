import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  OverviewSkeleton,
  QuestionsTableSkeleton,
  QuickActionsSkeleton,
  SignalsSkeleton,
  TopicTestCardSkeleton,
} from '@/features/practice-tests/components/loading-skeleton'

describe('LoadingSkeleton', () => {
  it('renders OverviewSkeleton with 4 skeleton items', () => {
    const { container } = render(<OverviewSkeleton />)
    const items = container.querySelectorAll('.animate-pulse')
    expect(items.length).toBeGreaterThanOrEqual(4)
  })

  it('renders QuestionsTableSkeleton with filter bars and rows', () => {
    const { container } = render(<QuestionsTableSkeleton />)
    const items = container.querySelectorAll('.animate-pulse')
    expect(items.length).toBeGreaterThanOrEqual(6)
  })

  it('renders TopicTestCardSkeleton', () => {
    const { container } = render(<TopicTestCardSkeleton />)
    const items = container.querySelectorAll('.animate-pulse')
    expect(items.length).toBeGreaterThanOrEqual(4)
  })

  it('renders SignalsSkeleton with 4 items', () => {
    const { container } = render(<SignalsSkeleton />)
    const items = container.querySelectorAll('.animate-pulse')
    expect(items.length).toBeGreaterThanOrEqual(4)
  })

  it('renders QuickActionsSkeleton with 5 items', () => {
    const { container } = render(<QuickActionsSkeleton />)
    const items = container.querySelectorAll('.animate-pulse')
    expect(items.length).toBeGreaterThanOrEqual(5)
  })
})
