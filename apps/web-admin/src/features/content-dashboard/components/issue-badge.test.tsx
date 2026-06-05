import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IssueBadge } from '@/features/content-dashboard/components/issue-badge'

describe('IssueBadge', () => {
  it('renders the issue text', () => {
    render(<IssueBadge issue='Low Recall' />)
    expect(screen.getByText('Low Recall')).toBeInTheDocument()
  })

  it('renders a badge element', () => {
    render(<IssueBadge issue='Poor Accuracy' />)
    const badge = screen.getByText('Poor Accuracy')
    expect(badge.tagName).toBe('SPAN')
  })
})
