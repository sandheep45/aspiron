import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressBar } from '@/features/content-dashboard/components/progress-bar'

describe('ProgressBar', () => {
  it('renders with the correct width', () => {
    const { container } = render(<ProgressBar value={75} />)
    const bar = container.querySelector('[style]')
    expect(bar).toBeInTheDocument()
    expect((bar as HTMLElement)?.style.width).toBe('75%')
  })

  it('clamps value to 0', () => {
    const { container } = render(<ProgressBar value={-10} />)
    const bar = container.querySelector('[style]')
    expect((bar as HTMLElement)?.style.width).toBe('0%')
  })

  it('clamps value to 100', () => {
    const { container } = render(<ProgressBar value={150} />)
    const bar = container.querySelector('[style]')
    expect((bar as HTMLElement)?.style.width).toBe('100%')
  })
})
