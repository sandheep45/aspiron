import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RecallBadge } from '@/features/topics-page/components/recall-badge'

describe('RecallBadge', () => {
  it('renders strong recall', () => {
    render(<RecallBadge value='strong' />)
    expect(screen.getByText('Strong')).toBeInTheDocument()
  })

  it('renders medium recall', () => {
    render(<RecallBadge value='medium' />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders weak recall', () => {
    render(<RecallBadge value='weak' />)
    expect(screen.getByText('Weak')).toBeInTheDocument()
  })

  it('renders unknown recall value', () => {
    render(<RecallBadge value='unknown' />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })
})
