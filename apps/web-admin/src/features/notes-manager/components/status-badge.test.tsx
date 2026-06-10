import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from '@/features/notes-manager/components/status-badge'

describe('StatusBadge', () => {
  it('renders published with emerald dot', () => {
    const { container } = render(<StatusBadge status='published' />)
    expect(screen.getByText('published')).toBeInTheDocument()
    expect(container.querySelector('.bg-emerald-500')).toBeInTheDocument()
  })

  it('renders draft with slate dot', () => {
    const { container } = render(<StatusBadge status='draft' />)
    expect(screen.getByText('draft')).toBeInTheDocument()
    expect(container.querySelector('.bg-slate-500')).toBeInTheDocument()
  })

  it('renders pending_review with amber dot', () => {
    const { container } = render(<StatusBadge status='pending_review' />)
    expect(screen.getByText('pending_review')).toBeInTheDocument()
    expect(container.querySelector('.bg-amber-500')).toBeInTheDocument()
  })

  it('renders approved with emerald dot', () => {
    const { container } = render(<StatusBadge status='approved' />)
    expect(screen.getByText('approved')).toBeInTheDocument()
    expect(container.querySelector('.bg-emerald-500')).toBeInTheDocument()
  })

  it('renders archived with red dot', () => {
    const { container } = render(<StatusBadge status='archived' />)
    expect(screen.getByText('archived')).toBeInTheDocument()
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument()
  })

  it('renders none with slate-600 dot', () => {
    const { container } = render(<StatusBadge status='none' />)
    expect(screen.getByText('none')).toBeInTheDocument()
    expect(container.querySelector('.bg-slate-600')).toBeInTheDocument()
  })

  it('renders spaced status by replacing spaces with underscores', () => {
    const { container } = render(<StatusBadge status='needs attention' />)
    // 'needs attention' -> key is 'needs_attention' -> falls to default
    expect(container.querySelector('.bg-slate-500')).toBeInTheDocument()
  })

  it('falls back to slate-500 dot for unknown status', () => {
    const { container } = render(<StatusBadge status='unknown' />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
    expect(container.querySelector('.bg-slate-500')).toBeInTheDocument()
  })
})
