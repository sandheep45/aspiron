import {
  BookOpen,
  FileText,
  GraduationCap,
  Layers,
  ListChecks,
  PenTool,
  Play,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ContentComponentCardProps {
  id: string
  name: string
  status: string
  performance: string
  action: string
  className?: string
}

const componentIcons: Record<string, typeof Play> = {
  video: Play,
  'practice-questions': BookOpen,
  recall: RefreshCw,
  'study-notes': FileText,
  assignments: PenTool,
  flashcards: Layers,
  default: GraduationCap,
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> =
  {
    published: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      dot: 'bg-emerald-500',
    },
    draft: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      dot: 'bg-slate-500',
    },
    'review required': {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      dot: 'bg-amber-500',
    },
    archived: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
  }

const defaultStatusStyle = {
  bg: 'bg-slate-500/10',
  text: 'text-slate-400',
  dot: 'bg-slate-500',
}

export function ContentComponentCard({
  id,
  name,
  status,
  performance,
  action,
  className,
}: ContentComponentCardProps) {
  const Icon = componentIcons[id] ?? componentIcons.default
  const statusStyle = statusStyles[status.toLowerCase()] ?? defaultStatusStyle

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/20 hover:shadow-indigo-500/5 hover:shadow-lg',
        className,
      )}
    >
      <div className='flex items-center gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400'>
          <Icon className='size-5' />
        </div>
        <div className='flex min-w-0 flex-1 flex-col'>
          <span className='truncate font-medium text-sm text-white'>
            {name}
          </span>
          <span
            className={cn(
              'mt-1 inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 font-medium text-[0.65rem]',
              statusStyle.bg,
              statusStyle.text,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dot)} />
            {status}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-2 text-slate-500 text-xs'>
        <ListChecks className='size-3.5 shrink-0' />
        <span>{performance}</span>
      </div>

      <Button variant='outline' size='sm' className='w-full text-xs'>
        {action}
      </Button>
    </div>
  )
}
