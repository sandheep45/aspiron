import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuickActionsBar } from '@/features/topic-detail/components/quick-actions-bar'

describe('QuickActionsBar', () => {
  const mockActions = [
    {
      id: '1',
      label: 'Preview as Student',
      description: 'View topic as student',
      icon: 'eye',
    },
    {
      id: '2',
      label: 'Schedule Revision',
      description: 'Schedule revision session',
      icon: 'calendar',
    },
    {
      id: '3',
      label: 'Review Questions',
      description: 'Review practice questions',
      icon: 'book',
    },
  ]

  it('renders all action buttons', () => {
    render(<QuickActionsBar actions={mockActions} />)
    expect(screen.getByText('Preview as Student')).toBeInTheDocument()
    expect(screen.getByText('Schedule Revision')).toBeInTheDocument()
    expect(screen.getByText('Review Questions')).toBeInTheDocument()
  })

  it('renders buttons for each action', () => {
    render(<QuickActionsBar actions={mockActions} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })

  it('renders skeleton when loading', () => {
    const { container } = render(
      <QuickActionsBar actions={mockActions} loading />,
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('does not render action buttons when loading', () => {
    render(<QuickActionsBar actions={mockActions} loading />)
    expect(screen.queryByText('Preview as Student')).not.toBeInTheDocument()
  })

  it('renders empty container when no actions', () => {
    const { container } = render(<QuickActionsBar actions={[]} />)
    expect(container.querySelector('.flex-wrap')).toBeInTheDocument()
  })

  it('handles actions with unknown icon', () => {
    const actions = [
      {
        id: '4',
        label: 'Custom Action',
        description: 'Custom',
        icon: 'unknown-icon',
      },
    ]
    render(<QuickActionsBar actions={actions} />)
    expect(screen.getByText('Custom Action')).toBeInTheDocument()
  })
})
