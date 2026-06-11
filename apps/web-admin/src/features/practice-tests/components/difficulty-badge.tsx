import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const difficultyVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-[0.65rem]',
  {
    variants: {
      difficulty: {
        easy: 'bg-emerald-500/10 text-emerald-400 [&>span]:bg-emerald-500',
        medium: 'bg-amber-500/10 text-amber-400 [&>span]:bg-amber-500',
        hard: 'bg-red-500/10 text-red-400 [&>span]:bg-red-500',
      },
    },
    defaultVariants: {
      difficulty: 'medium',
    },
  },
)

interface DifficultyBadgeProps extends VariantProps<typeof difficultyVariants> {
  difficulty: string
  className?: string
}

export function DifficultyBadge({
  difficulty,
  className,
}: DifficultyBadgeProps) {
  const variant = difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
  return (
    <span
      className={cn(difficultyVariants({ difficulty: variant, className }))}
    >
      <span className='h-1.5 w-1.5 rounded-full' />
      {difficulty}
    </span>
  )
}
