import {
  useCreateTestMutation,
  useQuestionsQuery,
} from '@aspiron/tanstack-client'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ArrowLeft, Eye, EyeOff, Loader2, Plus } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAppForm } from '@/components/forms/form-core'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PublishingChecklist } from '@/features/create-test/components/publishing-checklist'
import { SelectedQuestionsPanel } from '@/features/create-test/components/selected-questions-panel'
import { StudentPreview } from '@/features/create-test/components/student-preview'
import { TestAnalyticsPreview } from '@/features/create-test/components/test-analytics-preview'
import { createTestFormOption } from '@/features/create-test/form-option'
import { cn } from '@/lib/utils'

interface CreateTestPageProps {
  topicId: string
  onBack: () => void
}

const QUESTION_TYPES = [
  'MCQ',
  'Multiple Select',
  'Numerical',
  'Assertion Reason',
  'Subjective',
]
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const VISIBILITY_OPTIONS = ['Visible', 'Hidden']
const STATUS_OPTIONS = ['Draft', 'Published', 'Archived']

export function CreateTestPage({ topicId, onBack }: CreateTestPageProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(
    new Set(),
  )
  const [testQuestions, setTestQuestions] = useState<
    Array<{
      id: string
      identifier: string
      question: string
      question_type: string
      difficulty: string
      correct_rate?: number
      points: number
    }>
  >([])
  const [page, setPage] = useState(1)
  const [saved, setSaved] = useState(false)

  const questions = useQuestionsQuery({
    args: {
      topicId,
      page,
      limit: 50,
      search: search || undefined,
      question_type: typeFilter || undefined,
      difficulty: difficultyFilter || undefined,
    },
  })

  const mutation = useCreateTestMutation()

  const form = useAppForm({
    ...createTestFormOption,
    onSubmit: async ({ value, formApi }) => {
      if (testQuestions.length < 3) {
        toast.error('Select at least 3 questions for the test')
        return
      }
      mutation.mutate(
        {
          topicId,
          title: value.title || 'Untitled Test',
          description: value.description || undefined,
          instructions: value.instructions || undefined,
          duration_minutes: value.duration_minutes || undefined,
          passing_score: value.passing_score || undefined,
          max_attempts: value.max_attempts || undefined,
          visibility: value.visibility || undefined,
          status: value.status || 'Draft',
          question_ids: testQuestions.map((q) => q.id),
        },
        {
          onSuccess: (response) => {
            toast.success(`Test created: ${response.title}`)
            formApi.reset()
            setTestQuestions([])
            setSelectedQuestionIds(new Set())
            onBack()
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to create test')
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

  const toggleSelectQuestion = useCallback(
    (q: {
      id: string
      identifier: string
      question: string
      question_type: string
      difficulty: string
      correct_rate?: number
    }) => {
      setSelectedQuestionIds((prev) => {
        const next = new Set(prev)
        if (next.has(q.id)) {
          next.delete(q.id)
          setTestQuestions((tq) => tq.filter((t) => t.id !== q.id))
        } else {
          next.add(q.id)
          setTestQuestions((tq) => [...tq, { ...q, points: 1 }])
        }
        return next
      })
    },
    [],
  )

  const removeQuestion = useCallback((id: string) => {
    setTestQuestions((prev) => prev.filter((q) => q.id !== id))
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const updatePoints = useCallback((id: string, points: number) => {
    setTestQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, points } : q)),
    )
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setTestQuestions((prev) => {
      const oldIndex = prev.findIndex((q) => q.id === active.id)
      const newIndex = prev.findIndex((q) => q.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      const result = [...prev]
      const [removed] = result.splice(oldIndex, 1)
      result.splice(newIndex, 0, removed)
      return result
    })
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const analytics = useMemo(() => {
    if (testQuestions.length === 0) return null
    const easy = testQuestions.filter((q) => q.difficulty === 'Easy').length
    const medium = testQuestions.filter((q) => q.difficulty === 'Medium').length
    const hard = testQuestions.filter((q) => q.difficulty === 'Hard').length
    const totalTime = testQuestions.length * 2
    const coverageScore = Math.min(100, testQuestions.length * 15)
    const predictedDifficulty =
      hard > medium ? 'Hard' : easy > medium ? 'Easy' : 'Medium'
    return {
      easy,
      medium,
      hard,
      totalTime,
      coverageScore,
      predictedDifficulty,
      total: testQuestions.length,
    }
  }, [testQuestions])

  const checklistChecks = useMemo(
    () => [
      {
        label: 'At least 3 questions',
        pass: testQuestions.length >= 3,
        message: 'Select at least 3 questions for a meaningful test',
      },
      {
        label: 'Test name provided',
        pass: !!form.getFieldValue('title'),
        message: 'Give the test a name',
      },
      {
        label: 'Duration configured',
        pass: (form.getFieldValue('duration_minutes') ?? 0) >= 1,
        message: 'Set a duration for the test',
      },
      {
        label: 'Passing score set',
        pass: (form.getFieldValue('passing_score') ?? 0) >= 1,
        message: 'Set a passing score threshold',
      },
      {
        label: 'Difficulty balanced',
        pass: analytics
          ? analytics.medium >= Math.min(2, testQuestions.length)
          : false,
        message: 'Include a mix of Easy, Medium, and Hard questions',
      },
    ],
    [testQuestions, analytics, form],
  )

  const allChecksPass = useMemo(
    () => checklistChecks.every((c) => c.pass),
    [checklistChecks],
  )

  const availableQuestions = useMemo(() => {
    if (!questions.data) return []
    return questions.data.items.filter((q) => !selectedQuestionIds.has(q.id))
  }, [questions.data, selectedQuestionIds])

  const totalPages = questions.data?.total_pages ?? 1

  return (
    <div className='flex w-full flex-col gap-8 pb-10'>
      {/* Back Navigation */}
      <button
        type='button'
        onClick={onBack}
        className='group flex w-fit items-center gap-1.5 text-slate-400 text-sm transition-colors hover:text-white'
      >
        <ArrowLeft className='size-4 transition-transform group-hover:-translate-x-0.5' />
        Back to Practice & Tests
      </button>

      {/* Page Header */}
      <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex flex-col gap-2'>
          <h1 className='font-semibold text-2xl text-white'>
            Create Topic Test
          </h1>
          <p className='text-slate-400 text-sm'>
            Build an assessment from existing practice questions
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
            {showPreview ? 'Hide Preview' : 'Student Preview'}
          </Button>
        </div>
      </header>

      {showPreview && (
        <StudentPreview
          questions={testQuestions}
          duration={form.getFieldValue('duration_minutes') ?? 30}
        />
      )}

      <form.AppForm>
        <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
          {/* Section 1: Test Settings */}
          <section>
            <h2 className='mb-4 font-medium text-slate-300 text-sm uppercase tracking-wide'>
              Test Settings
            </h2>
            <div className='flex flex-col gap-5 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
              <div className='grid gap-5 md:grid-cols-2'>
                <form.AppField name='title'>
                  {(field) => (
                    <div className='flex flex-col gap-1.5'>
                      <span className='text-slate-400 text-xs'>
                        Test Name <span className='text-red-400'>*</span>
                      </span>
                      <Input
                        placeholder='e.g., Quadratic Equations Assessment'
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.AppField>
                <form.AppField name='visibility'>
                  {(field) => (
                    <div className='flex flex-col gap-1.5'>
                      <span className='text-slate-400 text-xs'>Visibility</span>
                      <Select
                        value={field.state.value}
                        onValueChange={(v) => field.handleChange(v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VISIBILITY_OPTIONS.map((v) => (
                            <SelectItem key={v} value={v}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.AppField>
              </div>

              <form.AppField name='description'>
                {(field) => (
                  <div className='flex flex-col gap-1.5'>
                    <span className='text-slate-400 text-xs'>Description</span>
                    <Input
                      placeholder='Brief description of the test'
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.AppField>

              <form.AppField name='instructions'>
                {(field) => (
                  <div className='flex flex-col gap-1.5'>
                    <span className='text-slate-400 text-xs'>Instructions</span>
                    <textarea
                      placeholder='Instructions for students taking the test...'
                      className='min-h-[80px] w-full resize-none rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20'
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.AppField>

              <div className='grid gap-5 md:grid-cols-4'>
                <form.AppField name='duration_minutes'>
                  {(field) => (
                    <div className='flex flex-col gap-1.5'>
                      <span className='text-slate-400 text-xs'>
                        Duration (min) <span className='text-red-400'>*</span>
                      </span>
                      <Input
                        type='number'
                        min={1}
                        placeholder='30'
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(
                            Number(e.target.value) || undefined,
                          )
                        }
                      />
                    </div>
                  )}
                </form.AppField>
                <form.AppField name='passing_score'>
                  {(field) => (
                    <div className='flex flex-col gap-1.5'>
                      <span className='text-slate-400 text-xs'>
                        Passing Score (%)
                      </span>
                      <Input
                        type='number'
                        min={0}
                        max={100}
                        placeholder='40'
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(
                            Number(e.target.value) || undefined,
                          )
                        }
                      />
                    </div>
                  )}
                </form.AppField>
                <form.AppField name='max_attempts'>
                  {(field) => (
                    <div className='flex flex-col gap-1.5'>
                      <span className='text-slate-400 text-xs'>
                        Max Attempts
                      </span>
                      <Input
                        type='number'
                        min={1}
                        placeholder='3'
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(
                            Number(e.target.value) || undefined,
                          )
                        }
                      />
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
              </div>

              <div className='flex items-center gap-3 border-white/5 border-t pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    saved
                      ? toast.info('Already saved')
                      : toast.success('Draft saved')
                    setSaved(true)
                  }}
                >
                  Save Draft
                </Button>
              </div>
            </div>
          </section>

          {/* Section 2: Question Selection */}
          <section>
            <h2 className='mb-4 font-medium text-slate-300 text-sm uppercase tracking-wide'>
              Question Selection
            </h2>
            <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
              <div className='flex flex-wrap items-center gap-3'>
                <div className='flex-1'>
                  <Input
                    placeholder='Search questions...'
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                  />
                </div>
                <Select
                  value={typeFilter}
                  onValueChange={(v) => {
                    setTypeFilter(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className='w-[150px]'>
                    <SelectValue placeholder='All Types' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=''>All Types</SelectItem>
                    {QUESTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={difficultyFilter}
                  onValueChange={(v) => {
                    setDifficultyFilter(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className='w-[150px]'>
                    <SelectValue placeholder='All Difficulties' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=''>All Difficulties</SelectItem>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className='text-slate-500 text-xs'>
                  {questions.data?.total ?? 0} available
                </span>
              </div>

              {questions.isLoading ? (
                <div className='flex items-center justify-center py-12'>
                  <Loader2 className='size-6 animate-spin text-slate-500' />
                </div>
              ) : questions.isError ? (
                <div className='flex flex-col items-center gap-3 py-12 text-center'>
                  <p className='text-red-300 text-sm'>
                    {questions.error?.message || 'Failed to load questions'}
                  </p>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => questions.refetch()}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-xs'>
                      <thead>
                        <tr className='border-white/5 border-b text-[0.6rem] text-slate-500 uppercase'>
                          <th className='w-8 py-2 pr-2 text-left font-medium' />
                          <th className='py-2 pr-2 text-left font-medium'>
                            Question
                          </th>
                          <th className='px-2 py-2 text-left font-medium'>
                            Type
                          </th>
                          <th className='px-2 py-2 text-left font-medium'>
                            Difficulty
                          </th>
                          <th className='px-2 py-2 text-right font-medium'>
                            Rate
                          </th>
                          <th className='w-16 py-2 pl-2 text-right font-medium'>
                            Select
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableQuestions.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className='py-12 text-center text-slate-500'
                            >
                              {search || typeFilter || difficultyFilter
                                ? 'No questions match your filters'
                                : 'No questions available. Create questions first.'}
                            </td>
                          </tr>
                        ) : (
                          availableQuestions.map((q) => (
                            <tr
                              key={q.id}
                              className='border-white/5 border-b last:border-0 hover:bg-white/[0.02]'
                            >
                              <td className='py-2 pr-2'>
                                <Badge
                                  variant='outline'
                                  className='font-mono text-[0.5rem] text-slate-500'
                                >
                                  {q.identifier}
                                </Badge>
                              </td>
                              <td className='max-w-[240px] truncate py-2 pr-2 text-slate-300'>
                                {q.question}
                              </td>
                              <td className='px-2 py-2 text-slate-400'>
                                {q.question_type}
                              </td>
                              <td className='px-2 py-2'>
                                <span
                                  className={cn(
                                    'rounded-full px-1.5 py-0.5 font-medium text-[0.55rem]',
                                    q.difficulty === 'Easy'
                                      ? 'bg-emerald-500/10 text-emerald-400'
                                      : q.difficulty === 'Medium'
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : 'bg-red-500/10 text-red-400',
                                  )}
                                >
                                  {q.difficulty}
                                </span>
                              </td>
                              <td className='px-2 py-2 text-right text-slate-400 tabular-nums'>
                                {q.correct_rate != null
                                  ? `${Math.round(q.correct_rate)}%`
                                  : '-'}
                              </td>
                              <td className='py-2 pl-2 text-right'>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon-sm'
                                  onClick={() =>
                                    toggleSelectQuestion(
                                      q as typeof q & { correct_rate?: number },
                                    )
                                  }
                                >
                                  <Plus className='size-3 text-sky-400' />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className='flex items-center justify-center gap-2 pt-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        Previous
                      </Button>
                      <span className='text-slate-500 text-xs'>
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Section 3: Test Builder */}
          <section>
            <h2 className='mb-4 font-medium text-slate-300 text-sm uppercase tracking-wide'>
              Test Builder
            </h2>
            <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
              <div className='flex items-center justify-between'>
                <span className='text-slate-400 text-xs'>
                  {testQuestions.length} question
                  {testQuestions.length !== 1 ? 's' : ''} selected
                </span>
                {testQuestions.length > 0 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='text-red-400'
                    onClick={() => {
                      setTestQuestions([])
                      setSelectedQuestionIds(new Set())
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {testQuestions.length === 0 ? (
                <div className='flex flex-col items-center gap-2 py-8 text-center'>
                  <p className='text-slate-500 text-sm'>
                    No questions selected yet
                  </p>
                  <p className='text-slate-600 text-xs'>
                    Select questions from the library above to build your test
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={testQuestions.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className='flex flex-col gap-2'>
                      {testQuestions.map((q, i) => (
                        <SelectedQuestionsPanel
                          key={q.id}
                          question={q}
                          index={i}
                          onRemove={removeQuestion}
                          onPointsChange={updatePoints}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </section>

          {/* Section 4: Analytics Preview */}
          {analytics && (
            <TestAnalyticsPreview data={analytics} questions={testQuestions} />
          )}

          {/* Section 5: Publishing Checklist */}
          <PublishingChecklist checks={checklistChecks} />

          {/* Actions */}
          <div className='flex items-center justify-end gap-3 border-white/10 border-t pt-6'>
            <Button
              type='button'
              variant='ghost'
              onClick={onBack}
              className='text-slate-400'
            >
              Cancel
            </Button>
            <form.SubmitButton disabled={!allChecksPass || mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className='size-3.5 animate-spin' />
              ) : (
                <Plus className='size-3.5' />
              )}
              {mutation.isPending ? 'Creating...' : 'Publish Test'}
            </form.SubmitButton>
          </div>
        </form>
      </form.AppForm>
    </div>
  )
}
