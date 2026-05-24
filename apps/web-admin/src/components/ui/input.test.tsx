import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<Input placeholder='Enter name' />)
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    render(<Input data-testid='input' />)
    const input = screen.getByTestId('input')
    expect(input.className).toContain('rounded-md')
  })

  it('applies form variant classes', () => {
    render(<Input variant='form' data-testid='input' />)
    const input = screen.getByTestId('input')
    expect(input.className).toContain('rounded-lg')
  })

  it('renders with type text by default', () => {
    render(<Input data-testid='input' />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'text')
  })

  it('renders with custom type', () => {
    render(<Input type='email' data-testid='input' />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Input disabled data-testid='input' />)
    expect(screen.getByTestId('input')).toBeDisabled()
  })
})
