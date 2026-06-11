import type { CreateQuestionRequest } from '@aspiron/api-client'
import { useCreateQuestionMutation } from '@aspiron/tanstack-client'
import { ArrowLeft, Eye, EyeOff, Plus, X } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAppForm } from '@/components/forms/form-core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { QuestionPreview } from '@/features/create-question/components/question-preview'
import { ValidationPanel } from '@/features/create-question/components/validation-panel'
import { createQuestionFormOption } from '@/features/create-question/form-option'

const QUESTION_TYPES = [
  'MCQ',
  'Multiple Select',
  'Numerical',
  'Assertion Reason',
  'Subjective',
]
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const STATUS_OPTIONS = ['Draft', 'Active', 'Archived']

interface CreateQuestionPageProps {
  topicId: string
  onBack: () => void
}

export function CreateQuestionPage({
  topicId,
  onBack,
}: CreateQuestionPageProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const mutation = useCreateQuestionMutation()

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setTagInput('')
  }, [tagInput, tags])

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const form = useAppForm({
    ...createQuestionFormOption,
    onSubmit: async ({ value, formApi }) => {
      const payload: CreateQuestionRequest = {
        question: value.question_text || value.correct_answer,
        question_type: value.question_type,
        difficulty: value.difficulty,
        correct_answer: value.correct_answer,
        status: value.status || 'Draft',
        explanation: value.explanation || undefined,
        common_mistakes: value.common_mistakes || undefined,
        hints: value.hints || undefined,
        learning_objective: value.learning_objective || undefined,
        estimated_time: value.estimated_time || undefined,
        tags: tags.length > 0 ? tags : undefined,
      }

      if (value.question_type === 'MCQ') {
        payload.choices = [
          value.choices_a,
          value.choices_b,
          value.choices_c,
          value.choices_d,
        ].filter(Boolean)
        payload.correct_answer = value.correct_answer
      } else if (value.question_type === 'Multiple Select') {
        payload.choices = [
          value.choices_a,
          value.choices_b,
          value.choices_c,
          value.choices_d,
        ].filter(Boolean)
        payload.correct_answer = value.multiple_select_answers || ''
      } else if (value.question_type === 'Numerical') {
        payload.correct_answer = value.correct_answer
        payload.tolerance = value.tolerance || undefined
        payload.unit = value.unit || undefined
      } else if (value.question_type === 'Assertion Reason') {
        payload.assertion_reason_assertion =
          value.assertion_reason_assertion || undefined
        payload.assertion_reason_reason =
          value.assertion_reason_reason || undefined
        payload.correct_answer = value.correct_answer
      } else if (value.question_type === 'Subjective') {
        payload.rubric = value.rubric || undefined
        payload.evaluation_criteria = value.evaluation_criteria || undefined
        payload.correct_answer = value.correct_answer
      }

      mutation.mutate(
        { ...payload, topicId },
        {
          onSuccess: (response) => {
            toast.success(`Question created: ${response.identifier}`)
            formApi.reset()
            setTags([])
            onBack()
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to create question')
          },
        },
      )
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }

  const questionType = form.getFieldValue('question_type')

  const qualityChecks = useMemo(() => {
    const checks: Array<{ label: string; pass: boolean; message: string }> = []
    checks.push({
      label: 'Question Statement',
      pass: !!form.getFieldValue('question_text'),
      message: 'Question statement must not be empty',
    })
    checks.push({
      label: 'Correct Answer',
      pass: !!form.getFieldValue('correct_answer'),
      message: 'Correct answer must be specified',
    })

    if (questionType === 'MCQ') {
      const ca = form.getFieldValue('choices_a')
      const cb = form.getFieldValue('choices_b')
      const cc = form.getFieldValue('choices_c')
      const cd = form.getFieldValue('choices_d')
      const allFilled = ca && cb && cc && cd
      checks.push({
        label: 'All Choices Filled',
        pass: !!allFilled,
        message: 'All four MCQ options (A-D) should be provided',
      })
    }

    if (questionType === 'Numerical') {
      checks.push({
        label: 'Tolerance Set',
        pass: !!form.getFieldValue('tolerance'),
        message: 'Tolerance is recommended for numerical questions',
      })
    }

    if (questionType === 'Subjective') {
      checks.push({
        label: 'Rubric Provided',
        pass: !!form.getFieldValue('rubric'),
        message: 'Rubric helps standardize grading',
      })
    }

    checks.push({
      label: 'Explanation',
      pass: !!form.getFieldValue('explanation'),
      message: 'Adding an explanation helps student understanding',
    })
    checks.push({
      label: 'Estimated Time',
      pass: (form.getFieldValue('estimated_time') ?? 0) >= 1,
      message: 'Estimated time should be at least 1 minute',
    })

    return checks
  }, [form, questionType])

  const allPass = useMemo(
    () => qualityChecks.every((c) => c.pass),
    [qualityChecks],
  )

  return (
    <div className='flex w-full flex-col gap-8 pb-10'>
      <button
        type='button'
        onClick={onBack}
        className='group flex w-fit items-center gap-1.5 text-slate-400 text-sm transition-colors hover:text-white'
      >
        <ArrowLeft className='size-4 transition-transform group-hover:-translate-x-0.5' />
        Back to Practice & Tests
      </button>

      <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex flex-col gap-2'>
          <h1 className='font-semibold text-2xl text-white'>
            Create Practice Question
          </h1>
          <p className='text-slate-400 text-sm'>
            Design a new question with rich text, answer configuration, and
            detailed explanations
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <EyeOff className='size-3.5' />
            ) : (
              <Eye className='size-3.5' />
            )}
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
        </div>
      </header>

      <form.AppForm>
        {showPreview && (
          <QuestionPreview
            questionType={questionType}
            choices={
              questionType === 'MCQ' || questionType === 'Multiple Select'
                ? [
                    form.getFieldValue('choices_a'),
                    form.getFieldValue('choices_b'),
                    form.getFieldValue('choices_c'),
                    form.getFieldValue('choices_d'),
                  ].filter(Boolean)
                : undefined
            }
            assertionReason={
              questionType === 'Assertion Reason'
                ? {
                    assertion:
                      form.getFieldValue('assertion_reason_assertion') || '',
                    reason: form.getFieldValue('assertion_reason_reason') || '',
                  }
                : undefined
            }
          />
        )}
        <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
          {/* Section 1: Question Metadata */}
          <section>
            <h2 className='mb-4 font-medium text-slate-300 text-sm uppercase tracking-wide'>
              Question Metadata
            </h2>
            <div className='grid gap-5 md:grid-cols-4'>
              <form.AppField name='question_type'>
                {(field) => (
                  <div className='flex flex-col gap-1.5'>
                    <span className='text-slate-400 text-xs'>
                      Type <span className='text-red-400'>*</span>
                    </span>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.AppField>

              <form.AppField name='difficulty'>
                {(field) => (
                  <div className='flex flex-col gap-1.5'>
                    <span className='text-slate-400 text-xs'>
                      Difficulty <span className='text-red-400'>*</span>
                    </span>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTIES.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.AppField>

              <form.AppField name='status'>
                {(field) => (
                  <div className='flex flex-col gap-1.5'>
                    <span className='text-slate-400 text-xs'>Status</span>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.AppField>

              <form.AppField name='estimated_time'>
                {(field) => (
                  <div className='flex flex-col gap-1.5'>
                    <span className='text-slate-400 text-xs'>
                      Est. Time (min)
                    </span>
                    <Input
                      type='number'
                      min={1}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value) || undefined)
                      }
                    />
                  </div>
                )}
              </form.AppField>
            </div>

            <div className='mt-4 grid gap-5 md:grid-cols-2'>
              <form.AppField name='learning_objective'>
                {(field) => (
                  <div className='flex flex-col gap-1.5'>
                    <span className='text-slate-400 text-xs'>
                      Learning Objective
                    </span>
                    <Input
                      placeholder='e.g., Understand quadratic equation factoring'
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.AppField>

              <div className='flex flex-col gap-1.5'>
                <span className='text-slate-400 text-xs'>Tags</span>
                <div className='flex flex-wrap items-center gap-2'>
                  <Input
                    placeholder='Type tag and press +'
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    className='flex-1'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='icon-sm'
                    onClick={addTag}
                  >
                    <Plus className='size-3.5' />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className='inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-sky-300 text-xs'
                      >
                        {tag}
                        <button
                          type='button'
                          onClick={() => removeTag(tag)}
                          className='text-sky-400 hover:text-sky-200'
                        >
                          <X className='size-3' />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 2: Question Statement */}
          <section>
            <h2 className='mb-4 font-medium text-slate-300 text-sm uppercase tracking-wide'>
              Question Statement <span className='text-red-400'>*</span>
            </h2>
            <form.AppField name='question_text'>
              {(field) => (
                <field.FormTiptapEditor
                  placeholder='Write the question statement here...'
                  minHeight={200}
                />
              )}
            </form.AppField>
            <p className='mt-1 text-slate-500 text-xs'>
              Use the rich editor above for formatted content
            </p>
          </section>

          {/* Section 3: Answer Configuration */}
          <section>
            <h2 className='mb-4 font-medium text-slate-300 text-sm uppercase tracking-wide'>
              Answer Configuration <span className='text-red-400'>*</span>
            </h2>

            <div className='flex flex-col gap-5 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
              {questionType === 'MCQ' && (
                <>
                  <p className='text-slate-500 text-xs'>
                    Provide four answer choices (A-D) and select the correct
                    one.
                  </p>
                  <div className='grid gap-3 md:grid-cols-2'>
                    {['A', 'B', 'C', 'D'].map((letter) => {
                      const fieldName =
                        `choices_${letter.toLowerCase()}` as const
                      return (
                        <form.AppField key={letter} name={fieldName}>
                          {(field) => (
                            <div className='flex items-center gap-2'>
                              <span className='flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-800 font-mono text-slate-400 text-xs'>
                                {letter}
                              </span>
                              <div className='flex-1'>
                                <Input
                                  placeholder={`Option ${letter}`}
                                  value={field.state.value}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </form.AppField>
                      )
                    })}
                  </div>
                  <form.AppField name='correct_answer'>
                    {(field) => (
                      <div className='flex flex-col gap-1.5'>
                        <span className='text-slate-400 text-xs'>
                          Correct Answer <span className='text-red-400'>*</span>
                        </span>
                        <Select
                          value={field.state.value}
                          onValueChange={(v) => field.handleChange(v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select correct answer' />
                          </SelectTrigger>
                          <SelectContent>
                            {['A', 'B', 'C', 'D'].map((letter) => {
                              const val = form.getFieldValue(
                                `choices_${letter.toLowerCase()}` as keyof typeof createQuestionFormOption.defaultValues,
                              )
                              return (
                                <SelectItem key={letter} value={val || letter}>
                                  {letter}. {val || `Option ${letter}`}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.AppField>
                </>
              )}

              {questionType === 'Multiple Select' && (
                <>
                  <p className='text-slate-500 text-xs'>
                    Provide answer choices and list all correct answer letters
                    (comma-separated).
                  </p>
                  <div className='grid gap-3 md:grid-cols-2'>
                    {['A', 'B', 'C', 'D'].map((letter) => {
                      const fieldName =
                        `choices_${letter.toLowerCase()}` as const
                      return (
                        <form.AppField key={letter} name={fieldName}>
                          {(field) => (
                            <div className='flex items-center gap-2'>
                              <span className='flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-800 font-mono text-slate-400 text-xs'>
                                {letter}
                              </span>
                              <div className='flex-1'>
                                <Input
                                  placeholder={`Option ${letter}`}
                                  value={field.state.value}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </form.AppField>
                      )
                    })}
                  </div>
                  <form.AppField name='multiple_select_answers'>
                    {(field) => (
                      <div className='flex flex-col gap-1.5'>
                        <span className='text-slate-400 text-xs'>
                          Correct Answers{' '}
                          <span className='text-red-400'>*</span>
                        </span>
                        <Input
                          placeholder='e.g., A, C, D (comma-separated)'
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <span className='text-slate-500 text-xs'>
                          Enter the letter(s) of all correct choices
                        </span>
                      </div>
                    )}
                  </form.AppField>
                </>
              )}

              {questionType === 'Numerical' && (
                <>
                  <p className='text-slate-500 text-xs'>
                    Specify the correct numeric value, tolerance range, and
                    optional unit.
                  </p>
                  <div className='grid gap-3 md:grid-cols-3'>
                    <form.AppField name='correct_answer'>
                      {(field) => (
                        <div className='flex flex-col gap-1.5'>
                          <span className='text-slate-400 text-xs'>
                            Correct Value{' '}
                            <span className='text-red-400'>*</span>
                          </span>
                          <Input
                            placeholder='e.g., 42'
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </div>
                      )}
                    </form.AppField>
                    <form.AppField name='tolerance'>
                      {(field) => (
                        <div className='flex flex-col gap-1.5'>
                          <span className='text-slate-400 text-xs'>
                            Tolerance
                          </span>
                          <Input
                            placeholder='e.g., 0.5'
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </div>
                      )}
                    </form.AppField>
                    <form.AppField name='unit'>
                      {(field) => (
                        <div className='flex flex-col gap-1.5'>
                          <span className='text-slate-400 text-xs'>Unit</span>
                          <Input
                            placeholder='e.g., cm'
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </div>
                      )}
                    </form.AppField>
                  </div>
                </>
              )}

              {questionType === 'Assertion Reason' && (
                <>
                  <p className='text-slate-500 text-xs'>
                    Provide an assertion statement and a reason statement.
                    Students determine if both are true and if the reason
                    correctly explains the assertion.
                  </p>
                  <form.AppField name='assertion_reason_assertion'>
                    {(field) => (
                      <div className='flex flex-col gap-1.5'>
                        <span className='text-slate-400 text-xs'>
                          Assertion (Statement){' '}
                          <span className='text-red-400'>*</span>
                        </span>
                        <Textarea
                          placeholder='Enter the assertion statement...'
                          className='min-h-[80px]'
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>
                    )}
                  </form.AppField>
                  <form.AppField name='assertion_reason_reason'>
                    {(field) => (
                      <div className='flex flex-col gap-1.5'>
                        <span className='text-slate-400 text-xs'>
                          Reason (Explanation){' '}
                          <span className='text-red-400'>*</span>
                        </span>
                        <Textarea
                          placeholder='Enter the reason statement...'
                          className='min-h-[80px]'
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>
                    )}
                  </form.AppField>
                  <form.AppField name='correct_answer'>
                    {(field) => (
                      <div className='flex flex-col gap-1.5'>
                        <span className='text-slate-400 text-xs'>
                          Correct Answer <span className='text-red-400'>*</span>
                        </span>
                        <Select
                          value={field.state.value}
                          onValueChange={(v) => field.handleChange(v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select correct evaluation' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Both A and R are true, and R is the correct explanation of A'>
                              Both A and R are true, and R is the correct
                              explanation of A
                            </SelectItem>
                            <SelectItem value='Both A and R are true, but R is NOT the correct explanation of A'>
                              Both A and R are true, but R is NOT the correct
                              explanation of A
                            </SelectItem>
                            <SelectItem value='A is true, but R is false'>
                              A is true, but R is false
                            </SelectItem>
                            <SelectItem value='A is false, but R is true'>
                              A is false, but R is true
                            </SelectItem>
                            <SelectItem value='Both A and R are false'>
                              Both A and R are false
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.AppField>
                </>
              )}

              {questionType === 'Subjective' && (
                <>
                  <p className='text-slate-500 text-xs'>
                    Provide a model answer, grading rubric, and evaluation
                    criteria for the subjective question.
                  </p>
                  <form.AppField name='correct_answer'>
                    {(field) => (
                      <div className='flex flex-col gap-1.5'>
                        <span className='text-slate-400 text-xs'>
                          Model Answer / Key Points{' '}
                          <span className='text-red-400'>*</span>
                        </span>
                        <Textarea
                          placeholder='Enter the expected key points or model answer...'
                          className='min-h-[100px]'
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>
                    )}
                  </form.AppField>
                  <form.AppField name='rubric'>
                    {(field) => (
                      <div className='flex flex-col gap-1.5'>
                        <span className='text-slate-400 text-xs'>
                          Grading Rubric
                        </span>
                        <Textarea
                          placeholder='Describe how marks should be allocated...'
                          className='min-h-[100px]'
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>
                    )}
                  </form.AppField>
                  <form.AppField name='evaluation_criteria'>
                    {(field) => (
                      <div className='flex flex-col gap-1.5'>
                        <span className='text-slate-400 text-xs'>
                          Evaluation Criteria
                        </span>
                        <Textarea
                          placeholder='Specify what constitutes full/partial/no credit...'
                          className='min-h-[100px]'
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>
                    )}
                  </form.AppField>
                </>
              )}
            </div>
          </section>

          {/* Section 4: Solution & Explanation */}
          <section>
            <h2 className='mb-4 font-medium text-slate-300 text-sm uppercase tracking-wide'>
              Solution &amp; Explanation
            </h2>
            <div className='flex flex-col gap-5'>
              <div className='flex flex-col gap-1.5'>
                <span className='text-slate-400 text-xs'>
                  Step-by-Step Explanation
                </span>
                <form.AppField name='explanation'>
                  {(field) => (
                    <field.FormTiptapEditor placeholder='Walk through the solution step by step...' />
                  )}
                </form.AppField>
              </div>

              <div className='grid gap-5 md:grid-cols-2'>
                <div className='flex flex-col gap-1.5'>
                  <span className='text-slate-400 text-xs'>
                    Common Mistakes
                  </span>
                  <form.AppField name='common_mistakes'>
                    {(field) => (
                      <field.FormTiptapEditor placeholder='Highlight typical errors students make...' />
                    )}
                  </form.AppField>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <span className='text-slate-400 text-xs'>Hints</span>
                  <form.AppField name='hints'>
                    {(field) => (
                      <field.FormTiptapEditor placeholder='Provide progressive hints...' />
                    )}
                  </form.AppField>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Validation */}
          <ValidationPanel checks={qualityChecks} />

          {/* Submit */}
          <div className='flex items-center justify-end gap-3 border-white/10 border-t pt-6'>
            <Button
              type='button'
              variant='ghost'
              onClick={onBack}
              className='text-slate-400'
            >
              Cancel
            </Button>
            <form.SubmitButton disabled={!allPass || mutation.isPending}>
              Create Question
            </form.SubmitButton>
          </div>
        </form>
      </form.AppForm>
    </div>
  )
}
