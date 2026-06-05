import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubjectSignals } from '@/features/subjects-page/components/subject-signals'

describe('SubjectSignals', () => {
  it('renders section heading', () => {
    render(
      <SubjectSignals
        signals={[
          { subject_name: 'Physics', message: 'test', signal_type: 'positive' },
        ]}
      />,
    )
    expect(screen.getByText('Subject Signals')).toBeInTheDocument()
  })

  it('renders signal cards with messages', () => {
    render(
      <SubjectSignals
        signals={[
          {
            subject_name: 'Physics',
            message: 'Physics has fastest recall decay',
            signal_type: 'negative',
          },
          {
            subject_name: 'Chemistry',
            message: 'Chemistry has highest accuracy',
            signal_type: 'positive',
          },
        ]}
      />,
    )
    expect(
      screen.getByText('Physics has fastest recall decay'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Chemistry has highest accuracy'),
    ).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(<SubjectSignals signals={[]} />)
    expect(screen.getByText('No signals available yet.')).toBeInTheDocument()
  })

  it('renders subject name in card', () => {
    render(
      <SubjectSignals
        signals={[
          { subject_name: 'Physics', message: 'test', signal_type: 'positive' },
        ]}
      />,
    )
    expect(screen.getByText('Physics')).toBeInTheDocument()
  })
})
