import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuickActionsBar } from '@/features/practice-tests/components/quick-actions-bar'

describe('QuickActionsBar', () => {
  it('renders all 5 action buttons', () => {
    render(<QuickActionsBar />)
    expect(screen.getByText('Preview As Student')).toBeInTheDocument()
    expect(screen.getByText('Mark Practice As Reviewed')).toBeInTheDocument()
    expect(screen.getByText('Generate More Questions')).toBeInTheDocument()
    expect(screen.getByText('Create Revision Test')).toBeInTheDocument()
    expect(screen.getByText('Export Question Bank')).toBeInTheDocument()
  })

  it('renders skeleton when loading', () => {
    const { container } = render(<QuickActionsBar loading />)
    expect(
      container.querySelectorAll('.animate-pulse').length,
    ).toBeGreaterThanOrEqual(5)
  })

  it('applies custom className', () => {
    const { container } = render(<QuickActionsBar className='custom-class' />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
