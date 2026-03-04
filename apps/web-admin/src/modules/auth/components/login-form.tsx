import { Link } from '@tanstack/react-router'
import { Lock, Mail } from 'lucide-react'
import { useAppForm } from '@/components/forms/form-core'
import { loginFormOption } from '@/modules/auth/form-option'
import { useCsrfTokenQuery } from '@/modules/auth/hooks/use-csrf-token-query'

export const LoginForm = () => {
  const { data } = useCsrfTokenQuery()
  const loginAppForm = useAppForm({
    ...loginFormOption,
    defaultValues: {
      ...loginFormOption.defaultValues,
      csrfToken: data,
    },
  })

  return (
    <div className='w-full max-w-100 space-y-6 rounded-2xl border border-slate-800/50 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl'>
      <h2 className='font-semibold text-lg'>Log in to your account</h2>
      <loginAppForm.AppForm>
        <form
          action={'/api/auth/callback/credentials'}
          method='POST'
          className='flex w-full flex-col gap-3'
        >
          <div className='flex w-full flex-col gap-4'>
            <loginAppForm.AppField name='email'>
              {(field) => (
                <field.FormInput
                  placeholder='you@example.com'
                  leftIcon={<Mail className='size-4 text-slate-500' />}
                  labelProps={{
                    children: 'Email address',
                  }}
                />
              )}
            </loginAppForm.AppField>
            <loginAppForm.AppField name='password'>
              {(field) => (
                <field.FormInput
                  isPasswordType
                  placeholder='••••••••'
                  leftIcon={<Lock className='size-4 text-slate-500' />}
                  labelProps={{
                    children: 'Password',
                  }}
                />
              )}
            </loginAppForm.AppField>
            <loginAppForm.AppField name='csrfToken'>
              {(field) => <field.FormInput hidden className='hidden' />}
            </loginAppForm.AppField>
          </div>
          <Link
            to='/auth/forgot-password'
            className='text-end text-indigo-400 text-sm transition-colors hover:text-indigo-300'
          >
            Forgot Password?
          </Link>
          <loginAppForm.SubmitButton variant={'brand'} className={'w-full'}>
            Login
          </loginAppForm.SubmitButton>
        </form>
      </loginAppForm.AppForm>
    </div>
  )
}
