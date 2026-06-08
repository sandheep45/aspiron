import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from '@/features/chapters-page/components/status-badge'

describe('StatusBadge', () => {
  it('renders healthy status', () => {
    render(<StatusBadge status='healthy' />)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })

  it('renders needs_attention status', () => {
    render(<StatusBadge status='needs_attention' />)
    expect(screen.getByText('Needs Attention')).toBeInTheDocument()
  })

  it('renders critical status', () => {
    render(<StatusBadge status='critical' />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('renders unknown status as-is', () => {
    render(<StatusBadge status='unknown' />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })
})
