import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RecallBadge } from '@/components/ui/recall-badge'

describe('RecallBadge', () => {
  it('renders strong value', () => {
    render(<RecallBadge value='strong' />)
    expect(screen.getByText('Strong')).toBeInTheDocument()
  })

  it('renders medium value', () => {
    render(<RecallBadge value='medium' />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders weak value', () => {
    render(<RecallBadge value='weak' />)
    expect(screen.getByText('Weak')).toBeInTheDocument()
  })

  it('renders unknown value with default styling', () => {
    render(<RecallBadge value='unknown' />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('capitalizes the value text', () => {
    render(<RecallBadge value='medium' />)
    const badge = screen.getByText('Medium')
    expect(badge.className).toMatch(/capitalize/)
  })
})
