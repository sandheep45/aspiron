import { render, screen } from '@testing-library/react'
import { IconContainer } from '@/components/ui/icon-container'

describe('IconContainer', () => {
  it('renders children', () => {
    render(
      <IconContainer>
        <span data-testid='child' />
      </IconContainer>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders with neutral variant by default', () => {
    render(
      <IconContainer data-testid='container'>
        <span />
      </IconContainer>,
    )
    const container = screen.getByTestId('container')
    expect(container.className).toContain('from-slate-500/10')
    expect(container.className).toContain('rounded-xl')
  })

  it('renders with danger variant', () => {
    render(
      <IconContainer variant='danger' data-testid='container'>
        <span />
      </IconContainer>,
    )
    const container = screen.getByTestId('container')
    expect(container.className).toContain('from-rose-500/10')
  })

  it('renders with success variant', () => {
    render(
      <IconContainer variant='success' data-testid='container'>
        <span />
      </IconContainer>,
    )
    const container = screen.getByTestId('container')
    expect(container.className).toContain('from-emerald-500/10')
  })

  it('renders with info variant', () => {
    render(
      <IconContainer variant='info' data-testid='container'>
        <span />
      </IconContainer>,
    )
    const container = screen.getByTestId('container')
    expect(container.className).toContain('from-blue-500/10')
  })

  it('renders with warning variant', () => {
    render(
      <IconContainer variant='warning' data-testid='container'>
        <span />
      </IconContainer>,
    )
    const container = screen.getByTestId('container')
    expect(container.className).toContain('from-amber-500/10')
  })

  it('applies custom className', () => {
    render(
      <IconContainer className='custom-class' data-testid='container'>
        <span />
      </IconContainer>,
    )
    expect(screen.getByTestId('container').className).toContain('custom-class')
  })
})
