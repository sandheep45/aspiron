import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('renders as span by default', () => {
    render(<Badge data-testid='badge'>Tag</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge.tagName).toBe('SPAN')
  })

  it('applies default variant classes', () => {
    render(<Badge data-testid='badge'>Default</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge.className).toContain('bg-primary')
  })

  it('applies secondary variant classes', () => {
    render(
      <Badge variant='secondary' data-testid='badge'>
        Secondary
      </Badge>,
    )
    const badge = screen.getByTestId('badge')
    expect(badge.className).toContain('bg-secondary')
  })
})
