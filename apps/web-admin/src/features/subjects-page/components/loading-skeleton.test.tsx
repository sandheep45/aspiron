import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

describe('LoadingSkeleton', () => {
  it('renders summary variant', () => {
    const { container } = render(<LoadingSkeleton variant='summary' />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  it('renders table variant', () => {
    const { container } = render(<LoadingSkeleton variant='table' />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  it('renders signals variant', () => {
    const { container } = render(<LoadingSkeleton variant='signals' />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })
})
