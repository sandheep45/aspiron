import { isAxiosError } from '@aspiron/api-client/axios-utils'
import { useLoginMutation } from '@aspiron/tanstack-client'
import { Link, useNavigate } from '@tanstack/react-router'
import { Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useAppForm } from '@/components/forms/form-core'
import { loginFormOption } from '@/features/auth/form-option'

export const LoginForm = () => {
  const navigate = useNavigate()
  const { mutate } = useLoginMutation()
  const loginAppForm = useAppForm({
    ...loginFormOption,
    onSubmit: async ({ value }) => {
      try {
        mutate(
          {
            ...value,
          },
          {
            onError(error, variables, onMutateResult, context) {
              if (isAxiosError(error)) {
                console.log(
                  error.response?.data,
                  variables,
                  onMutateResult,
                  context,
                )
              }
            },
            onSuccess: () => {
              navigate({
                to: '/dashboard',
              })
            },
          },
        )
      } catch (error) {
        if (error instanceof Error) {
          const jsonMatch = error.message.match(/\{.*\}/)

          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            toast.error(parsed.error.message)
          }
        }
      }
    },
  })

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    loginAppForm.handleSubmit()
  }

  return (
    <div className='w-full max-w-100 space-y-6 rounded-2xl border border-slate-800/50 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl'>
      <h2 className='font-semibold text-lg'>Log in to your account</h2>
      <loginAppForm.AppForm>
        <form
          method='POST'
          className='flex w-full flex-col gap-3'
          onSubmit={handleSubmit}
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
