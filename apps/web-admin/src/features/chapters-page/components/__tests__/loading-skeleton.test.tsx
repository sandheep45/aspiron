import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingSkeleton } from '@/features/chapters-page/components/loading-skeleton'

describe('LoadingSkeleton', () => {
  it('renders summary variant with 4 skeleton items', () => {
    const { container } = render(<LoadingSkeleton variant='summary' />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThanOrEqual(4)
  })

  it('renders table variant with 5 skeleton rows', () => {
    const { container } = render(<LoadingSkeleton variant='table' />)
    const rows = container.querySelectorAll('.animate-pulse')
    expect(rows.length).toBeGreaterThanOrEqual(5)
  })

  it('renders insights variant with 3 skeleton cards', () => {
    const { container } = render(<LoadingSkeleton variant='insights' />)
    const cards = container.querySelectorAll('.animate-pulse')
    expect(cards.length).toBeGreaterThanOrEqual(3)
  })
})
