import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuestionPreview } from '@/features/create-question/components/question-preview'

const jsonContent = (text: string) =>
  JSON.stringify({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  })

describe('QuestionPreview', () => {
  it('renders placeholder when question is empty', () => {
    render(<QuestionPreview question='' questionType='MCQ' />)
    expect(
      screen.getByText(
        'Preview will appear once you start writing the question.',
      ),
    ).toBeInTheDocument()
  })

  it('renders question content', () => {
    render(
      <QuestionPreview
        question={jsonContent('What is 2+2?')}
        questionType='MCQ'
      />,
    )
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
  })

  it('renders student preview heading', () => {
    render(
      <QuestionPreview
        question={jsonContent('Test question')}
        questionType='MCQ'
      />,
    )
    expect(screen.getByText('Student Preview')).toBeInTheDocument()
  })

  it('renders choices when provided', () => {
    render(
      <QuestionPreview
        question={jsonContent('Test')}
        questionType='MCQ'
        choices={['Option A', 'Option B', 'Option C', 'Option D']}
      />,
    )
    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option D')).toBeInTheDocument()
  })

  it('renders assertion reason when provided', () => {
    render(
      <QuestionPreview
        question={jsonContent('Test')}
        questionType='Assertion Reason'
        assertionReason={{
          assertion: 'Statement is true',
          reason: 'Because...',
        }}
      />,
    )
    expect(screen.getByText('Statement is true')).toBeInTheDocument()
    expect(screen.getByText('Because...')).toBeInTheDocument()
  })

  it('renders type label for MCQ', () => {
    render(
      <QuestionPreview question={jsonContent('Test')} questionType='MCQ' />,
    )
    expect(screen.getByText('Multiple Choice')).toBeInTheDocument()
  })

  it('renders type label for Numerical', () => {
    render(
      <QuestionPreview
        question={jsonContent('Test')}
        questionType='Numerical'
      />,
    )
    const els = screen.getAllByText('Numerical')
    expect(els.length).toBeGreaterThanOrEqual(1)
  })

  it('renders type label for Subjective', () => {
    render(
      <QuestionPreview
        question={jsonContent('Test')}
        questionType='Subjective'
      />,
    )
    const els = screen.getAllByText('Subjective')
    expect(els.length).toBeGreaterThanOrEqual(1)
  })
})
