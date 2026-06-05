import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from '@/features/subjects-page/components/status-badge'

describe('StatusBadge', () => {
  it('renders Healthy', () => {
    render(<StatusBadge status='Healthy' />)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })

  it('renders Needs Attention', () => {
    render(<StatusBadge status='Needs Attention' />)
    expect(screen.getByText('Needs Attention')).toBeInTheDocument()
  })

  it('renders Critical', () => {
    render(<StatusBadge status='Critical' />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('renders unknown status as-is', () => {
    render(<StatusBadge status='Unknown' />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })
})
