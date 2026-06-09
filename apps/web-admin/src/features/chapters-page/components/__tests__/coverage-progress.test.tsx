import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressBar } from '@/components/ui/progress-bar'

describe('CoverageProgress', () => {
  it('renders percentage text', () => {
    render(<ProgressBar value={75} showLabel />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('clamps value above 100', () => {
    render(<ProgressBar value={150} showLabel />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('clamps value below 0', () => {
    render(<ProgressBar value={-20} showLabel />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('renders 0%', () => {
    render(<ProgressBar value={0} showLabel />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('renders 100%', () => {
    render(<ProgressBar value={100} showLabel />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('rounds decimal values', () => {
    render(<ProgressBar value={74.7} showLabel />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('renders fractional values at boundaries', () => {
    render(<ProgressBar value={99.5} showLabel />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })
})
