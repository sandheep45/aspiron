import { Search } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/40 px-6 py-12 backdrop-blur-sm'>
      <div className='mb-4 flex size-12 items-center justify-center rounded-full bg-slate-800/50'>
        <Search className='size-5 text-slate-500' />
      </div>
      <p className='mb-1 font-medium text-slate-300 text-sm'>{title}</p>
      <p className='text-center text-slate-500 text-xs'>{description}</p>
    </div>
  )
}
