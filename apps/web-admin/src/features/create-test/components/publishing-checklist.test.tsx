import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PublishingChecklist } from '@/features/create-test/components/publishing-checklist'

describe('PublishingChecklist', () => {
  const passedChecks = [
    { label: 'At least 3 questions', pass: true, message: '' },
    { label: 'Test name provided', pass: true, message: '' },
  ]

  const failedChecks = [
    {
      label: 'At least 3 questions',
      pass: false,
      message: 'Select at least 3',
    },
  ]

  it('renders heading', () => {
    render(<PublishingChecklist checks={passedChecks} />)
    expect(screen.getByText('Publishing Checklist')).toBeInTheDocument()
  })

  it('shows passed count', () => {
    render(<PublishingChecklist checks={passedChecks} />)
    expect(screen.getByText('2/2 passed')).toBeInTheDocument()
  })

  it('shows failed count', () => {
    render(<PublishingChecklist checks={failedChecks} />)
    expect(screen.getByText('0/1 passed')).toBeInTheDocument()
  })

  it('renders check labels', () => {
    render(<PublishingChecklist checks={failedChecks} />)
    expect(screen.getByText('At least 3 questions')).toBeInTheDocument()
  })

  it('shows error message for failed checks', () => {
    render(<PublishingChecklist checks={failedChecks} />)
    expect(screen.getByText('Select at least 3')).toBeInTheDocument()
  })

  it('renders mixed checks correctly', () => {
    const mixed = [
      { label: 'Passing', pass: true, message: '' },
      { label: 'Failing', pass: false, message: 'Fix this' },
    ]
    render(<PublishingChecklist checks={mixed} />)
    expect(screen.getByText('1/2 passed')).toBeInTheDocument()
    expect(screen.getByText('Fix this')).toBeInTheDocument()
  })
})
