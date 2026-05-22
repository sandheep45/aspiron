import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('renders as a button element', () => {
    render(<Button>Test</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    render(<Button>Default</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-primary')
  })

  it('applies brand variant classes', () => {
    render(<Button variant='brand'>Brand</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-gradient-to-r')
  })

  it('applies size classes', () => {
    render(<Button size='sm'>Small</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('h-6')
  })

  it('applies custom className', () => {
    render(<Button className='custom-class'>Custom</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-class')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
