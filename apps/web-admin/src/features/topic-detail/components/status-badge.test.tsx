import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from '@/features/topic-detail/components/status-badge'

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status='Healthy' />)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })

  it('renders healthy with emerald dot', () => {
    const { container } = render(<StatusBadge status='healthy' />)
    expect(container.querySelector('.bg-emerald-500')).toBeInTheDocument()
  })

  it('renders needs attention with amber dot', () => {
    const { container } = render(<StatusBadge status='needs attention' />)
    expect(container.querySelector('.bg-amber-500')).toBeInTheDocument()
  })

  it('renders critical with red dot', () => {
    const { container } = render(<StatusBadge status='critical' />)
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument()
  })

  it('falls back to slate for unknown status', () => {
    const { container } = render(<StatusBadge status='unknown' />)
    expect(container.querySelector('.bg-slate-500')).toBeInTheDocument()
  })

  it('renders as a span', () => {
    render(<StatusBadge status='healthy' />)
    expect(screen.getByText('healthy').tagName).toBe('SPAN')
  })
})
