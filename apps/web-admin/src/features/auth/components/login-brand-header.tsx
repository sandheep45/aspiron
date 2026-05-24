import { GraduationCap } from 'lucide-react'

export const LoginBrandHeader = () => {
  return (
    <div className='space-y-1 text-center'>
      <div className='inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-purple-600 shadow-indigo-500/20 shadow-lg'>
        <GraduationCap className='h-8 w-8 text-white' />
      </div>
      <h1 className='font-semibold text-3xl text-white'>Aspiron</h1>
      <p className='text-slate-400 text-sm'>
        Focused learning. Intelligent guidance.
      </p>
    </div>
  )
}
