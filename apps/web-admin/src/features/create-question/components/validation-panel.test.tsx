import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ValidationPanel } from '@/features/create-question/components/validation-panel'

describe('ValidationPanel', () => {
  const passedChecks = [
    { label: 'Question Statement', pass: true, message: '' },
    { label: 'Correct Answer', pass: true, message: '' },
  ]

  const failedChecks = [
    { label: 'Question Statement', pass: false, message: 'Must not be empty' },
    { label: 'Correct Answer', pass: false, message: 'Must be specified' },
  ]

  it('renders heading', () => {
    render(<ValidationPanel checks={passedChecks} />)
    expect(screen.getByText('Quality Checklist')).toBeInTheDocument()
  })

  it('shows passed count', () => {
    render(<ValidationPanel checks={passedChecks} />)
    expect(screen.getByText('2/2 passed')).toBeInTheDocument()
  })

  it('shows failed count', () => {
    render(<ValidationPanel checks={failedChecks} />)
    expect(screen.getByText('0/2 passed')).toBeInTheDocument()
  })

  it('renders check labels', () => {
    render(<ValidationPanel checks={failedChecks} />)
    expect(screen.getByText('Question Statement')).toBeInTheDocument()
    expect(screen.getByText('Correct Answer')).toBeInTheDocument()
  })

  it('shows error message for failed checks', () => {
    render(<ValidationPanel checks={failedChecks} />)
    expect(screen.getByText('Must not be empty')).toBeInTheDocument()
    expect(screen.getByText('Must be specified')).toBeInTheDocument()
  })

  it('does not show messages for passed checks', () => {
    render(<ValidationPanel checks={passedChecks} />)
    expect(screen.queryByText('Must not be empty')).not.toBeInTheDocument()
  })

  it('renders mixed checks correctly', () => {
    const mixed = [
      { label: 'Passing', pass: true, message: '' },
      { label: 'Failing', pass: false, message: 'Fix this' },
    ]
    render(<ValidationPanel checks={mixed} />)
    expect(screen.getByText('1/2 passed')).toBeInTheDocument()
    expect(screen.getByText('Fix this')).toBeInTheDocument()
  })
})
