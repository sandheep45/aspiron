import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAppForm } from '@/components/forms/form-core'
import { QuestionPreview } from '@/features/create-question/components/question-preview'

function createFormWrapper(questionText: string) {
  return function FormWrapper({ children }: { children: React.ReactNode }) {
    const form = useAppForm({
      defaultValues: { question_text: questionText },
    })
    return <form.AppForm>{children}</form.AppForm>
  }
}

describe('QuestionPreview', () => {
  it('renders placeholder when question is empty', () => {
    const Wrapper = createFormWrapper('')
    render(
      <Wrapper>
        <QuestionPreview questionType='MCQ' />
      </Wrapper>,
    )
    expect(
      screen.getByText(
        'Preview will appear once you start writing the question.',
      ),
    ).toBeInTheDocument()
  })

  it('renders student preview heading', () => {
    const Wrapper = createFormWrapper('What is 2+2?')
    render(
      <Wrapper>
        <QuestionPreview questionType='MCQ' />
      </Wrapper>,
    )
    expect(screen.getByText('Student Preview')).toBeInTheDocument()
  })

  it('renders choices when provided', () => {
    const Wrapper = createFormWrapper('Test question')
    render(
      <Wrapper>
        <QuestionPreview
          questionType='MCQ'
          choices={['Option A', 'Option B', 'Option C', 'Option D']}
        />
      </Wrapper>,
    )
    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option D')).toBeInTheDocument()
  })

  it('renders assertion reason when provided', () => {
    const Wrapper = createFormWrapper('Test')
    render(
      <Wrapper>
        <QuestionPreview
          questionType='Assertion Reason'
          assertionReason={{
            assertion: 'Statement is true',
            reason: 'Because...',
          }}
        />
      </Wrapper>,
    )
    expect(screen.getByText('Statement is true')).toBeInTheDocument()
    expect(screen.getByText('Because...')).toBeInTheDocument()
  })

  it('renders type label for MCQ', () => {
    const Wrapper = createFormWrapper('Test')
    render(
      <Wrapper>
        <QuestionPreview questionType='MCQ' />
      </Wrapper>,
    )
    expect(screen.getByText('Multiple Choice')).toBeInTheDocument()
  })

  it('renders type label for Numerical', () => {
    const Wrapper = createFormWrapper('Test')
    render(
      <Wrapper>
        <QuestionPreview questionType='Numerical' />
      </Wrapper>,
    )
    const els = screen.getAllByText('Numerical')
    expect(els.length).toBeGreaterThanOrEqual(1)
  })

  it('renders type label for Subjective', () => {
    const Wrapper = createFormWrapper('Test')
    render(
      <Wrapper>
        <QuestionPreview questionType='Subjective' />
      </Wrapper>,
    )
    const els = screen.getAllByText('Subjective')
    expect(els.length).toBeGreaterThanOrEqual(1)
  })
})
