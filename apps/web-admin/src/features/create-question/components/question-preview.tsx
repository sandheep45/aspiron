import { useMemo } from 'react'
import { useFormContext } from '@/components/forms/form-core'

interface QuestionPreviewProps {
  questionType: string
  choices?: string[]
  assertionReason?: {
    assertion: string
    reason: string
  }
}

export function QuestionPreview({
  questionType,
  choices,
  assertionReason,
}: QuestionPreviewProps) {
  const form = useFormContext()

  const difficultyBadge = useMemo(() => {
    return questionType === 'Easy'
      ? 'bg-emerald-500/10 text-emerald-400'
      : questionType === 'Medium'
        ? 'bg-amber-500/10 text-amber-400'
        : 'bg-red-500/10 text-red-400'
  }, [questionType])

  const typeLabel = useMemo(() => {
    switch (questionType) {
      case 'MCQ':
        return 'Multiple Choice'
      case 'Multiple Select':
        return 'Multiple Select'
      case 'Numerical':
        return 'Numerical'
      case 'Assertion Reason':
        return 'Assertion-Reason'
      case 'Subjective':
        return 'Subjective'
      default:
        return questionType
    }
  }, [questionType])

  const question = form.getFieldValue('question_text')

  if (!question) {
    return (
      <div className='rounded-2xl border border-white/10 border-dashed bg-slate-900/50 p-8 text-center'>
        <p className='text-slate-500 text-sm'>
          Preview will appear once you start writing the question.
        </p>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
      <div className='flex items-center justify-between'>
        <h3 className='font-medium text-slate-300 text-xs uppercase tracking-wide'>
          Student Preview
        </h3>
        <div className='flex items-center gap-2'>
          <span
            className={`rounded-full px-2 py-0.5 font-medium text-[10px] ${difficultyBadge}`}
          >
            {questionType}
          </span>
          <span className='rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400'>
            {typeLabel}
          </span>
        </div>
      </div>

      <form.AppField name='question_text'>
        {(field) => <field.FormTiptapEditor editable={false} hideToolbar />}
      </form.AppField>

      {assertionReason && (
        <div className='flex flex-col gap-3 rounded-xl border border-white/5 bg-slate-950/60 p-4'>
          <div className='flex items-start gap-2'>
            <span className='mt-0.5 shrink-0 rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] text-sky-400'>
              A
            </span>
            <p className='text-slate-300 text-sm'>
              {assertionReason.assertion}
            </p>
          </div>
          <div className='flex items-start gap-2'>
            <span className='mt-0.5 shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400'>
              R
            </span>
            <p className='text-slate-300 text-sm'>{assertionReason.reason}</p>
          </div>
        </div>
      )}

      {choices && choices.length > 0 && (
        <div className='flex flex-col gap-2'>
          {choices.map((choice, i) => {
            const letter = String.fromCharCode(65 + i)
            return (
              <div
                key={i}
                className='flex items-center gap-3 rounded-lg border border-white/5 px-3 py-2.5 text-slate-400 text-sm transition-colors hover:border-white/10 hover:text-slate-300'
              >
                <span className='flex size-6 items-center justify-center rounded-md bg-slate-800 font-mono text-xs'>
                  {letter}
                </span>
                <span>{choice}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
