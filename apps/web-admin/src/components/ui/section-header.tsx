import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description?: string
  accent?: string
  action?: ReactNode
}

export function SectionHeader({
  title,
  description,
  accent,
  action,
}: SectionHeaderProps) {
  return (
    <div className='mb-4 flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        {accent && (
          <div className={`h-7 w-1 shrink-0 rounded-full ${accent}`} />
        )}
        <div>
          <h2 className='font-semibold text-white text-xl'>{title}</h2>
          {description && (
            <p className='mt-0.5 text-slate-400 text-xs'>{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}
