import { render, screen } from '@testing-library/react'
import { TrendingUp } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { SignalCard } from '@/features/content-dashboard/components/signal-card'

describe('SignalCard', () => {
  it('renders title and description', () => {
    render(
      <SignalCard
        title='Highest Recall'
        description='Strongest retention'
        icon={TrendingUp}
        items={[]}
        valueKey='score'
      />,
    )
    expect(screen.getByText('Highest Recall')).toBeInTheDocument()
    expect(screen.getByText('Strongest retention')).toBeInTheDocument()
  })

  it('renders empty state when no items', () => {
    render(
      <SignalCard
        title='Highest Recall'
        description=''
        icon={TrendingUp}
        items={[]}
        valueKey='score'
      />,
    )
    expect(screen.getByText('No signals available.')).toBeInTheDocument()
  })

  it('renders signal items with score', () => {
    render(
      <SignalCard
        title='Highest Recall'
        description=''
        icon={TrendingUp}
        items={[
          { topic: 'Physics', score: 84, drop: null as unknown as undefined },
        ]}
        valueKey='score'
      />,
    )
    expect(screen.getByText('84% recall')).toBeInTheDocument()
    expect(screen.getByText('Physics')).toBeInTheDocument()
  })

  it('renders signal items with drop', () => {
    render(
      <SignalCard
        title='Fastest Decay'
        description=''
        icon={TrendingUp}
        items={[
          { topic: 'Chemistry', score: null as unknown as undefined, drop: 28 },
        ]}
        valueKey='drop'
      />,
    )
    expect(screen.getByText('28% drop')).toBeInTheDocument()
  })

  it('renders skeleton when loading', () => {
    const { container } = render(
      <SignalCard
        title='Highest Recall'
        description=''
        icon={TrendingUp}
        items={[]}
        valueKey='score'
        loading
      />,
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
