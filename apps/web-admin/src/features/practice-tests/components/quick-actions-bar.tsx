import type { LucideIcon } from 'lucide-react'
import { BookOpen, Download, Eye, FileEdit, WandSparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuickActionsSkeleton } from '@/features/practice-tests/components/loading-skeleton'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
}

const actions: QuickAction[] = [
  { id: 'preview-student', label: 'Preview As Student', icon: Eye },
  { id: 'mark-reviewed', label: 'Mark Practice As Reviewed', icon: FileEdit },
  {
    id: 'generate-questions',
    label: 'Generate More Questions',
    icon: WandSparkles,
  },
  { id: 'create-revision-test', label: 'Create Revision Test', icon: BookOpen },
  { id: 'export-questions', label: 'Export Question Bank', icon: Download },
]

interface QuickActionsBarProps {
  loading?: boolean
  className?: string
}

export function QuickActionsBar({ loading, className }: QuickActionsBarProps) {
  if (loading) {
    return <QuickActionsSkeleton />
  }

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Button
            key={action.id}
            variant='outline'
            size='sm'
            className='h-9 gap-2 text-xs'
          >
            <Icon className='size-3.5 shrink-0' />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
