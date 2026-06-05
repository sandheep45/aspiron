import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RecallBadge } from '@/features/subjects-page/components/recall-badge'

describe('RecallBadge', () => {
  it('renders Strong for 0.8+', () => {
    render(<RecallBadge value={0.9} />)
    expect(screen.getByText('Strong')).toBeInTheDocument()
  })

  it('renders Medium for >=0.5 and <0.8', () => {
    render(<RecallBadge value={0.65} />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders Weak for <0.5', () => {
    render(<RecallBadge value={0.3} />)
    expect(screen.getByText('Weak')).toBeInTheDocument()
  })

  it('renders em dash for null', () => {
    render(<RecallBadge value={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders em dash for undefined', () => {
    render(<RecallBadge value={undefined} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
