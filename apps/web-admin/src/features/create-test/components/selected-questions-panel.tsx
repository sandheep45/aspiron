import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SelectedQuestion {
  id: string
  identifier: string
  question: string
  question_type: string
  difficulty: string
  correct_rate?: number
  points: number
}

interface SelectedQuestionsPanelProps {
  question: SelectedQuestion
  index: number
  onRemove: (id: string) => void
  onPointsChange: (id: string, points: number) => void
}

export function SelectedQuestionsPanel({
  question,
  index,
  onRemove,
  onPointsChange,
}: SelectedQuestionsPanelProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2.5 transition-colors',
        isDragging && 'border-sky-500/30 bg-sky-500/5 opacity-80',
      )}
    >
      <button
        type='button'
        className='cursor-grab text-slate-500 hover:text-slate-300 active:cursor-grabbing'
        {...attributes}
        {...listeners}
      >
        <GripVertical className='size-3.5' />
      </button>

      <span className='w-5 text-center font-mono text-[0.6rem] text-slate-500'>
        {index + 1}
      </span>

      <Badge
        variant='outline'
        className='shrink-0 font-mono text-[0.5rem] text-slate-500'
      >
        {question.identifier}
      </Badge>

      <p className='min-w-0 flex-1 truncate text-slate-300 text-xs'>
        {question.question}
      </p>

      <span
        className={cn(
          'shrink-0 rounded-full px-1.5 py-0.5 font-medium text-[0.55rem]',
          question.difficulty === 'Easy'
            ? 'bg-emerald-500/10 text-emerald-400'
            : question.difficulty === 'Medium'
              ? 'bg-amber-500/10 text-amber-400'
              : 'bg-red-500/10 text-red-400',
        )}
      >
        {question.difficulty}
      </span>

      <div className='flex w-16 shrink-0 items-center gap-1'>
        <span className='text-[0.55rem] text-slate-500'>Pts</span>
        <Input
          type='number'
          min={1}
          value={question.points}
          onChange={(e) =>
            onPointsChange(question.id, Number(e.target.value) || 1)
          }
          className='h-6 w-12 text-center text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
        />
      </div>

      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        onClick={() => onRemove(question.id)}
        className='shrink-0 text-red-400 hover:text-red-300'
      >
        <Trash2 className='size-3' />
      </Button>
    </div>
  )
}
