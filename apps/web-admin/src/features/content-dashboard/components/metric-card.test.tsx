import { render, screen } from '@testing-library/react'
import { BookOpen } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { MetricCard } from '@/features/content-dashboard/components/metric-card'

describe('MetricCard', () => {
  it('renders title and value', () => {
    render(
      <MetricCard
        icon={BookOpen}
        title='Subjects'
        value={5}
        supportingText='Total subjects'
      />,
    )
    expect(screen.getByText('Subjects')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Total subjects')).toBeInTheDocument()
  })

  it('renders skeleton when loading', () => {
    const { container } = render(
      <MetricCard
        icon={BookOpen}
        title='Subjects'
        value={5}
        supportingText='x'
        loading
      />,
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
