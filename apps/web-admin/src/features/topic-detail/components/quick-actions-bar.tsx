import type { TopicAction } from '@aspiron/api-client'
import {
  BookOpen,
  Calendar,
  Edit3,
  Eye,
  FileText,
  Flag,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuickActionsSkeleton } from '@/features/topic-detail/components/loading-skeleton'
import { cn } from '@/lib/utils'

interface QuickActionsBarProps {
  actions: TopicAction[]
  loading?: boolean
  className?: string
}

const actionIcons: Record<string, LucideIcon> = {
  eye: Eye,
  calendar: Calendar,
  flag: Flag,
  book: BookOpen,
  file: FileText,
  edit: Edit3,
}

export function QuickActionsBar({
  actions,
  loading,
  className,
}: QuickActionsBarProps) {
  if (loading) return <QuickActionsSkeleton />

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {actions.map((action) => {
        const Icon = action.icon ? (actionIcons[action.icon] ?? Eye) : Eye
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
