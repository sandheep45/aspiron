import { render, screen } from '@testing-library/react'
import { Brain } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { TopicHealthCard } from '@/features/topic-detail/components/topic-health-card'

describe('TopicHealthCard', () => {
  const defaultProps = {
    icon: Brain,
    title: 'Recall Strength',
    value: 'strong',
    supportingText: 'Memory retention accuracy',
  }

  it('renders title, value, and supporting text', () => {
    render(<TopicHealthCard {...defaultProps} />)
    expect(screen.getByText('Recall Strength')).toBeInTheDocument()
    expect(screen.getByText('Strong')).toBeInTheDocument()
    expect(screen.getByText('Memory retention accuracy')).toBeInTheDocument()
  })

  it('formats numeric values with percent sign', () => {
    render(<TopicHealthCard {...defaultProps} value={85} />)
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('renders skeleton when loading', () => {
    const { container } = render(<TopicHealthCard {...defaultProps} loading />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('does not render card content when loading', () => {
    render(<TopicHealthCard {...defaultProps} loading />)
    expect(screen.queryByText('Recall Strength')).not.toBeInTheDocument()
  })

  it('derives positive sentiment for strong recall', () => {
    const { container } = render(
      <TopicHealthCard
        icon={Brain}
        title='Recall Strength'
        value='strong'
        supportingText='Test'
      />,
    )
    expect(
      container.querySelector('.from-emerald-900\\/20'),
    ).toBeInTheDocument()
  })

  it('derives negative sentiment for weak recall', () => {
    const { container } = render(
      <TopicHealthCard
        icon={Brain}
        title='Recall Strength'
        value='weak'
        supportingText='Test'
      />,
    )
    expect(container.querySelector('.from-red-900\\/20')).toBeInTheDocument()
  })

  it('derives positive sentiment for accuracy above 70', () => {
    const { container } = render(
      <TopicHealthCard
        icon={Brain}
        title='Practice Accuracy'
        value={85}
        supportingText='Test'
      />,
    )
    expect(
      container.querySelector('.from-emerald-900\\/20'),
    ).toBeInTheDocument()
  })

  it('derives negative sentiment for accuracy below 50', () => {
    const { container } = render(
      <TopicHealthCard
        icon={Brain}
        title='Practice Accuracy'
        value={30}
        supportingText='Test'
      />,
    )
    expect(container.querySelector('.from-red-900\\/20')).toBeInTheDocument()
  })

  it('derives positive sentiment for low dropoff', () => {
    const { container } = render(
      <TopicHealthCard
        icon={Brain}
        title='Drop-off Indicator'
        value='low'
        supportingText='Test'
      />,
    )
    expect(
      container.querySelector('.from-emerald-900\\/20'),
    ).toBeInTheDocument()
  })

  it('derives positive sentiment for growing engagement', () => {
    const { container } = render(
      <TopicHealthCard
        icon={Brain}
        title='Engagement Trend'
        value='growing'
        supportingText='Test'
      />,
    )
    expect(
      container.querySelector('.from-emerald-900\\/20'),
    ).toBeInTheDocument()
  })

  it('uses explicit sentiment when provided', () => {
    const { container } = render(
      <TopicHealthCard {...defaultProps} sentiment='negative' />,
    )
    expect(container.querySelector('.from-red-900\\/20')).toBeInTheDocument()
  })
})
