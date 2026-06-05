import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  AttentionTableSkeleton,
  MetricCardSkeleton,
  SignalsSectionSkeleton,
  SubjectProgressSkeleton,
} from '@/features/content-dashboard/components/loading-skeleton'

describe('LoadingSkeleton', () => {
  it('MetricCardSkeleton renders', () => {
    const { container } = render(<MetricCardSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('AttentionTableSkeleton renders', () => {
    const { container } = render(<AttentionTableSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('SubjectProgressSkeleton renders', () => {
    const { container } = render(<SubjectProgressSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('SignalsSectionSkeleton renders', () => {
    const { container } = render(<SignalsSectionSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
