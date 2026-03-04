import { createFileRoute } from '@tanstack/react-router'
import { useAppForm } from '@/components/forms/form-core'
import { useCsfrToken } from '@/hooks/use-csfr-token'
import { loginFormOption } from '@/modules/auth/form-option'

export const Route = createFileRoute('/auth/_auth-layout/login')({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'Login',
  },
})

function RouteComponent() {
  const csrfToken = useCsfrToken()
  const loginAppForm = useAppForm({
    ...loginFormOption,
    defaultValues: {
      ...loginFormOption.defaultValues,
      csrfToken,
    },
  })
  return (
    <loginAppForm.AppForm>
      <form action={'/api/auth/callback/credentials'} method='POST'>
        <loginAppForm.AppField name='email'>
          {(field) => <field.FormInput />}
        </loginAppForm.AppField>
        <loginAppForm.AppField name='password'>
          {(field) => <field.FormInput />}
        </loginAppForm.AppField>
        <loginAppForm.AppField name='csrfToken'>
          {(field) => <field.FormInput hidden />}
        </loginAppForm.AppField>
        <loginAppForm.SubmitButton variant={'brand'}>
          Login
        </loginAppForm.SubmitButton>
      </form>
    </loginAppForm.AppForm>
  )
}
