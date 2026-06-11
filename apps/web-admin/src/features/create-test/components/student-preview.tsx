import { Clock, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PreviewQuestion {
  id: string
  identifier: string
  question: string
  question_type: string
  difficulty: string
  points: number
}

interface StudentPreviewProps {
  questions: PreviewQuestion[]
  duration: number
}

export function StudentPreview({ questions, duration }: StudentPreviewProps) {
  return (
    <section>
      <h2 className='mb-4 font-medium text-slate-300 text-sm uppercase tracking-wide'>
        Student Preview
      </h2>
      <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
        {/* Test Header */}
        <div className='flex flex-col gap-3 border-white/5 border-b pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <FileText className='size-4 text-slate-400' />
              <span className='font-medium text-sm text-white'>
                Practice Test
              </span>
            </div>
            <div className='flex items-center gap-1.5 text-amber-400 text-xs'>
              <Clock className='size-3.5' />
              <span className='tabular-nums'>{duration} min</span>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <span className='text-slate-500 text-xs'>
              {questions.length} Questions
            </span>
            <span className='text-slate-600 text-xs'>|</span>
            <span className='text-slate-500 text-xs'>
              {questions.reduce((s, q) => s + q.points, 0)} Points
            </span>
          </div>
        </div>

        {/* Question Sequence */}
        {questions.length === 0 ? (
          <div className='flex flex-col items-center gap-3 py-8 text-center'>
            <p className='text-slate-500 text-sm'>No questions in test yet</p>
            <p className='text-slate-600 text-xs'>
              Add questions to see the student preview
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            {questions.map((q, i) => (
              <div
                key={q.id}
                className='flex items-start gap-3 rounded-xl border border-white/5 bg-slate-950/60 p-3'
              >
                <span className='flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-800 font-mono text-slate-500 text-xs'>
                  {i + 1}
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='text-slate-300 text-xs leading-relaxed'>
                    {q.question.length > 100
                      ? `${q.question.slice(0, 100)}...`
                      : q.question}
                  </p>
                  <div className='mt-1.5 flex items-center gap-2'>
                    <Badge
                      variant='outline'
                      className='font-mono text-[0.5rem] text-slate-500'
                    >
                      {q.identifier}
                    </Badge>
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 font-medium text-[0.5rem]',
                        q.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : q.difficulty === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-red-500/10 text-red-400',
                      )}
                    >
                      {q.difficulty}
                    </span>
                    <span className='text-[0.5rem] text-slate-600'>
                      {q.points} pt{q.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Mock */}
        {questions.length > 0 && (
          <div className='flex items-center justify-between border-white/5 border-t pt-4'>
            <div className='flex gap-1'>
              {questions.slice(0, Math.min(questions.length, 8)).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex size-6 items-center justify-center rounded-md font-mono text-[0.55rem]',
                    i === 0
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'bg-slate-800 text-slate-500',
                  )}
                >
                  {i + 1}
                </div>
              ))}
              {questions.length > 8 && (
                <div className='flex size-6 items-center justify-center text-[0.55rem] text-slate-500'>
                  +{questions.length - 8}
                </div>
              )}
            </div>

            <button
              type='button'
              className='rounded-lg bg-sky-500/80 px-4 py-1.5 font-medium text-[0.6rem] text-white transition-colors hover:bg-sky-500 disabled:opacity-50'
              disabled
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
