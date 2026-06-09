import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeverityBadge } from '@/features/topic-detail/components/severity-badge'

describe('SeverityBadge', () => {
  it('renders the severity text uppercase', () => {
    render(<SeverityBadge severity='critical' />)
    const badge = screen.getByText('critical')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('uppercase')
  })

  it('renders critical severity', () => {
    render(<SeverityBadge severity='critical' />)
    const badge = screen.getByText('critical')
    expect(badge.className).toContain('bg-red-500')
    expect(badge.className).toContain('text-red-400')
    expect(badge.className).toContain('border-red-500')
  })

  it('renders high severity', () => {
    render(<SeverityBadge severity='high' />)
    const badge = screen.getByText('high')
    expect(badge.className).toContain('bg-orange-500')
    expect(badge.className).toContain('text-orange-400')
  })

  it('renders medium severity', () => {
    render(<SeverityBadge severity='medium' />)
    const badge = screen.getByText('medium')
    expect(badge.className).toContain('bg-amber-500')
    expect(badge.className).toContain('text-amber-400')
  })

  it('renders low severity', () => {
    render(<SeverityBadge severity='low' />)
    const badge = screen.getByText('low')
    expect(badge.className).toContain('bg-emerald-500')
    expect(badge.className).toContain('text-emerald-400')
  })

  it('falls back to slate for unknown severity', () => {
    render(<SeverityBadge severity='unknown' />)
    const badge = screen.getByText('unknown')
    expect(badge.className).toContain('bg-slate-500')
  })
})
