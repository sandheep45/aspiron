import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InsightCard } from '@/features/topics-page/components/insight-card'

describe('InsightCard', () => {
  it('renders title and description', () => {
    render(
      <InsightCard
        type='positive'
        title='All topics fully equipped'
        description='Every topic has video and quizzes.'
      />,
    )
    expect(screen.getByText('All topics fully equipped')).toBeInTheDocument()
    expect(
      screen.getByText('Every topic has video and quizzes.'),
    ).toBeInTheDocument()
  })

  it('renders positive type', () => {
    render(<InsightCard type='positive' title='Good' description='All good' />)
    expect(screen.getByText('Good')).toBeInTheDocument()
  })

  it('renders warning type', () => {
    render(
      <InsightCard
        type='warning'
        title='Caution'
        description='Needs attention'
      />,
    )
    expect(screen.getByText('Caution')).toBeInTheDocument()
  })

  it('renders negative type', () => {
    render(
      <InsightCard
        type='negative'
        title='Critical'
        description='Immediate action'
      />,
    )
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('renders info type', () => {
    render(<InsightCard type='info' title='FYI' description='Just info' />)
    expect(screen.getByText('FYI')).toBeInTheDocument()
  })

  it('falls back to info for unknown type', () => {
    render(
      <InsightCard
        type='unknown'
        title='Fallback'
        description='Info styling'
      />,
    )
    expect(screen.getByText('Fallback')).toBeInTheDocument()
  })
})
