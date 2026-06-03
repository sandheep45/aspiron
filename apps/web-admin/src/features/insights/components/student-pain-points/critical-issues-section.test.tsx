import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  CriticalIssuesEmptyState,
  CriticalIssuesSection,
} from './critical-issues-section'

const mockIssues = [
  {
    id: '1',
    topic: 'Quadratic Equations',
    description: 'Students struggle with quadratic formula application',
    severity: 'critical' as const,
    students_affected: 18 as unknown as bigint,
    action_label: 'View Topic',
  },
  {
    id: '2',
    topic: 'Photosynthesis',
    description: 'Students struggle with light-dependent reactions',
    severity: 'high' as const,
    students_affected: 14 as unknown as bigint,
    action_label: 'View Topic',
  },
]

describe('CriticalIssuesSection', () => {
  it('renders section heading and urgent badge', () => {
    render(
      <CriticalIssuesSection
        issues={mockIssues}
        totalUrgent={2}
        onViewTopic={vi.fn()}
      />,
    )
    expect(screen.getByText('Critical Issues')).toBeInTheDocument()
    expect(screen.getByText('2 urgent')).toBeInTheDocument()
  })

  it('renders all issue cards with topic names', () => {
    render(
      <CriticalIssuesSection
        issues={mockIssues}
        totalUrgent={2}
        onViewTopic={vi.fn()}
      />,
    )
    expect(screen.getByText('Quadratic Equations')).toBeInTheDocument()
    expect(screen.getByText('Photosynthesis')).toBeInTheDocument()
  })

  it('renders descriptions for each issue', () => {
    render(
      <CriticalIssuesSection
        issues={mockIssues}
        totalUrgent={2}
        onViewTopic={vi.fn()}
      />,
    )
    expect(
      screen.getByText('Students struggle with quadratic formula application'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Students struggle with light-dependent reactions'),
    ).toBeInTheDocument()
  })

  it('renders severity badges', () => {
    render(
      <CriticalIssuesSection
        issues={mockIssues}
        totalUrgent={2}
        onViewTopic={vi.fn()}
      />,
    )
    expect(screen.getByText('critical')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('renders students affected count', () => {
    render(
      <CriticalIssuesSection
        issues={mockIssues}
        totalUrgent={2}
        onViewTopic={vi.fn()}
      />,
    )
    expect(screen.getByText('18 students affected')).toBeInTheDocument()
    expect(screen.getByText('14 students affected')).toBeInTheDocument()
  })

  it('calls onViewTopic when view topic button is clicked', async () => {
    const onViewTopic = vi.fn()
    const user = userEvent.setup()
    render(
      <CriticalIssuesSection
        issues={mockIssues}
        totalUrgent={2}
        onViewTopic={onViewTopic}
      />,
    )
    await user.click(screen.getAllByText('View Topic')[0])
    expect(onViewTopic).toHaveBeenCalledWith('1')
  })
})

describe('CriticalIssuesEmptyState', () => {
  it('renders empty state message', () => {
    render(<CriticalIssuesEmptyState />)
    expect(screen.getByText('No Critical Issues')).toBeInTheDocument()
    expect(
      screen.getByText('No urgent learning bottlenecks detected.'),
    ).toBeInTheDocument()
  })
})
