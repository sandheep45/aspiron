import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { CheckCircle2 } from 'lucide-react'
import { useMemo } from 'react'

interface QuestionPreviewProps {
  question: string
  questionType: string
  choices?: string[]
  assertionReason?: {
    assertion: string
    reason: string
  }
}

export function QuestionPreview({
  question,
  questionType,
  choices,
  assertionReason,
}: QuestionPreviewProps) {
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

      <ReadOnlyContent content={question} />

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
            const isSelected = false
            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  isSelected
                    ? 'border-purple-500/30 bg-purple-500/5 text-purple-300'
                    : 'border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
                }`}
              >
                <span className='flex size-6 items-center justify-center rounded-md bg-slate-800 font-mono text-xs'>
                  {letter}
                </span>
                <span>{choice}</span>
                {isSelected && (
                  <CheckCircle2 className='ml-auto size-4 text-purple-400' />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ReadOnlyContent({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content ? JSON.parse(content) : '',
    editable: false,
  })
  if (!editor) return null
  return (
    <EditorContent
      editor={editor}
      className='prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed [&_p]:my-0.5'
    />
  )
}
