import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LearningIssueCard } from '@/features/topic-detail/components/learning-issue-card'

describe('LearningIssueCard', () => {
  const defaultProps = {
    title: 'Weak Recall',
    severity: 'high',
    description: 'Students are struggling to recall this topic.',
    recommendation: 'Schedule more practice sessions.',
    actionLabel: 'Review',
  }

  it('renders title, description, and recommendation', () => {
    render(<LearningIssueCard {...defaultProps} />)
    expect(screen.getByText('Weak Recall')).toBeInTheDocument()
    expect(
      screen.getByText('Students are struggling to recall this topic.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Schedule more practice sessions/),
    ).toBeInTheDocument()
  })

  it('renders severity badge', () => {
    render(<LearningIssueCard {...defaultProps} />)
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('renders action button', () => {
    render(<LearningIssueCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Review' })).toBeInTheDocument()
  })

  it('renders success variant with check icon', () => {
    const { container } = render(
      <LearningIssueCard {...defaultProps} variant='success' />,
    )
    expect(container.querySelector('.text-emerald-400')).toBeInTheDocument()
  })

  it('renders success variant with brand button', () => {
    render(<LearningIssueCard {...defaultProps} variant='success' />)
    expect(screen.getByRole('button', { name: 'Review' })).toBeInTheDocument()
  })

  it('renders default variant with left border for severity', () => {
    const { container } = render(
      <LearningIssueCard {...defaultProps} severity='critical' />,
    )
    expect(container.querySelector('.border-l-red-500')).toBeInTheDocument()
  })

  it('renders correct icon for each severity', () => {
    const severities = ['critical', 'high', 'medium', 'low']
    for (const severity of severities) {
      const { unmount } = render(
        <LearningIssueCard {...defaultProps} severity={severity} />,
      )
      expect(screen.getByText(severity)).toBeInTheDocument()
      unmount()
    }
  })
})
