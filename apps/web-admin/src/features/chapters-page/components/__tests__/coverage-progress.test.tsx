import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CoverageProgress } from '@/features/chapters-page/components/coverage-progress'

describe('CoverageProgress', () => {
  it('renders percentage text', () => {
    render(<CoverageProgress value={75} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('clamps value above 100', () => {
    render(<CoverageProgress value={150} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('clamps value below 0', () => {
    render(<CoverageProgress value={-20} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('renders 0%', () => {
    render(<CoverageProgress value={0} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('renders 100%', () => {
    render(<CoverageProgress value={100} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('rounds decimal values', () => {
    render(<CoverageProgress value={74.7} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('renders fractional values at boundaries', () => {
    render(<CoverageProgress value={99.5} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })
})
