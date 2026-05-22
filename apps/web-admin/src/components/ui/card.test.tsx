import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with default variant', () => {
    render(<Card data-testid='card'>Test</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('bg-card')
  })

  it('renders with elevated variant', () => {
    render(
      <Card variant='elevated' data-testid='card'>
        Elevated
      </Card>,
    )
    const card = screen.getByTestId('card')
    expect(card.className).toContain('rounded-2xl')
  })

  it('renders CardHeader, CardTitle, CardContent, CardFooter composition', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('shows spinner when loading', () => {
    render(<Card loading>Content</Card>)
    const card = screen.getByText('Content')
    expect(card.className).toContain('opacity-50')
  })
})
