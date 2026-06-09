import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

describe('LoadingSkeleton', () => {
  it('renders summary variant with pulse elements', () => {
    const { container } = render(<LoadingSkeleton variant='summary' />)
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThan(0)
  })

  it('renders table variant with pulse elements', () => {
    const { container } = render(<LoadingSkeleton variant='table' />)
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThan(0)
  })

  it('renders insights variant with pulse elements', () => {
    const { container } = render(<LoadingSkeleton variant='insights' />)
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThan(0)
  })
})
