import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  ContentComponentCardSkeleton,
  LearningIssueCardSkeleton,
  QuickActionsSkeleton,
  TopicHealthCardSkeleton,
  TrendsSkeleton,
} from '@/features/topic-detail/components/loading-skeleton'

describe('LoadingSkeleton', () => {
  it('TopicHealthCardSkeleton renders with pulse animation', () => {
    const { container } = render(<TopicHealthCardSkeleton />)
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThanOrEqual(3)
  })

  it('LearningIssueCardSkeleton renders with pulse animation', () => {
    const { container } = render(<LearningIssueCardSkeleton />)
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThanOrEqual(3)
  })

  it('ContentComponentCardSkeleton renders with pulse animation', () => {
    const { container } = render(<ContentComponentCardSkeleton />)
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThanOrEqual(3)
  })

  it('QuickActionsSkeleton renders 4 skeleton buttons', () => {
    const { container } = render(<QuickActionsSkeleton />)
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses).toHaveLength(4)
  })

  it('TrendsSkeleton renders 4 chart skeletons in grid', () => {
    const { container } = render(<TrendsSkeleton />)
    expect(container.querySelector('.md\\:grid-cols-2')).toBeInTheDocument()
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThanOrEqual(4)
  })
})
