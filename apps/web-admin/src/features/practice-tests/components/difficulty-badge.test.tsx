import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DifficultyBadge } from '@/features/practice-tests/components/difficulty-badge'

describe('DifficultyBadge', () => {
  it('renders with easy difficulty', () => {
    render(<DifficultyBadge difficulty='Easy' />)
    expect(screen.getByText('Easy')).toBeInTheDocument()
  })

  it('renders with medium difficulty', () => {
    render(<DifficultyBadge difficulty='Medium' />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders with hard difficulty', () => {
    render(<DifficultyBadge difficulty='Hard' />)
    expect(screen.getByText('Hard')).toBeInTheDocument()
  })

  it('handles lowercase input', () => {
    render(<DifficultyBadge difficulty='easy' />)
    expect(screen.getByText('easy')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <DifficultyBadge difficulty='Medium' className='custom-class' />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
