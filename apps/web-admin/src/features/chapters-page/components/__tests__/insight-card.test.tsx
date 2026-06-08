import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InsightCard } from '@/features/chapters-page/components/insight-card'

describe('InsightCard', () => {
  it('renders title and description', () => {
    render(
      <InsightCard
        type='positive'
        title='Strong Recall'
        description='Students show strong recall'
      />,
    )
    expect(screen.getByText('Strong Recall')).toBeInTheDocument()
    expect(screen.getByText('Students show strong recall')).toBeInTheDocument()
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
        description='Something needs attention'
      />,
    )
    expect(screen.getByText('Caution')).toBeInTheDocument()
  })

  it('renders negative type', () => {
    render(
      <InsightCard
        type='negative'
        title='Critical'
        description='Immediate action required'
      />,
    )
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('renders info type', () => {
    render(
      <InsightCard type='info' title='FYI' description='Just so you know' />,
    )
    expect(screen.getByText('FYI')).toBeInTheDocument()
  })

  it('falls back to info for unknown type', () => {
    render(
      <InsightCard
        type='unknown'
        title='Fallback'
        description='Should use info styling'
      />,
    )
    expect(screen.getByText('Fallback')).toBeInTheDocument()
  })
})
