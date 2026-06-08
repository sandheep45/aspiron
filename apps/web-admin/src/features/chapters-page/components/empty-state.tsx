import { Search } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-10 text-center backdrop-blur-sm'>
      <div className='flex size-12 items-center justify-center rounded-full bg-slate-800/50'>
        <Search className='size-5 text-slate-500' />
      </div>
      <div>
        <p className='font-medium text-slate-300 text-sm'>{title}</p>
        <p className='mt-1 text-slate-500 text-xs'>{description}</p>
      </div>
    </div>
  )
}
