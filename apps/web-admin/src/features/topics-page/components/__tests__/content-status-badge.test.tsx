import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ContentStatusBadge } from '@/features/topics-page/components/content-status-badge'

describe('ContentStatusBadge', () => {
  it('renders published status', () => {
    render(<ContentStatusBadge status='published' />)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('renders draft status', () => {
    render(<ContentStatusBadge status='draft' />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders review_pending status', () => {
    render(<ContentStatusBadge status='review_pending' />)
    expect(screen.getByText('Review Pending')).toBeInTheDocument()
  })

  it('renders archived status', () => {
    render(<ContentStatusBadge status='archived' />)
    expect(screen.getByText('Archived')).toBeInTheDocument()
  })

  it('renders unknown status', () => {
    render(<ContentStatusBadge status='unknown' />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })
})
