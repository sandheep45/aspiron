import { createFileRoute } from '@tanstack/react-router'
import { Shield } from 'lucide-react'
import { LoginBrandHeader } from '@/modules/auth/components/login-brand-header'
import { LoginForm } from '@/modules/auth/components/login-form'
export const Route = createFileRoute('/auth/_auth-layout/login')({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'Login',
  },
})

function RouteComponent() {
  return (
    <div className='flex w-full flex-col items-center justify-center gap-6'>
      <LoginBrandHeader />
      <LoginForm />
      <div className='inline-flex items-center gap-2 text-slate-500 text-sm'>
        <Shield className='h-4 w-4' />
        <span>Your data is secure. We never share your information.</span>
      </div>
    </div>
  )
}
