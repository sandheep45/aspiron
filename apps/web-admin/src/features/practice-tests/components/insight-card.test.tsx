import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InsightCard } from '@/features/practice-tests/components/insight-card'

describe('InsightCard', () => {
  it('renders the message', () => {
    render(<InsightCard message='Test insight' signalType='positive' />)
    expect(screen.getByText('Test insight')).toBeInTheDocument()
  })

  it('renders with positive type', () => {
    const { container } = render(
      <InsightCard message='Good' signalType='positive' />,
    )
    expect(container.firstChild).toHaveClass('from-emerald-900/10')
  })

  it('renders with warning type', () => {
    const { container } = render(
      <InsightCard message='Warning' signalType='warning' />,
    )
    expect(container.firstChild).toHaveClass('from-amber-900/10')
  })

  it('renders with negative type', () => {
    const { container } = render(
      <InsightCard message='Bad' signalType='negative' />,
    )
    expect(container.firstChild).toHaveClass('from-red-900/10')
  })

  it('renders with info type', () => {
    const { container } = render(
      <InsightCard message='Info' signalType='info' />,
    )
    expect(container.firstChild).toHaveClass('from-sky-900/10')
  })

  it('applies custom className', () => {
    const { container } = render(
      <InsightCard message='Test' signalType='info' className='custom-class' />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
