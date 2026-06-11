import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuestionStatusBadge } from '@/features/practice-tests/components/question-status-badge'

describe('QuestionStatusBadge', () => {
  it('renders active status', () => {
    render(<QuestionStatusBadge status='Active' />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders draft status', () => {
    render(<QuestionStatusBadge status='Draft' />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders archived status', () => {
    render(<QuestionStatusBadge status='Archived' />)
    expect(screen.getByText('Archived')).toBeInTheDocument()
  })

  it('handles lowercase input', () => {
    render(<QuestionStatusBadge status='active' />)
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <QuestionStatusBadge status='Draft' className='custom-class' />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
