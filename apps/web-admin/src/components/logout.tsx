import { useAppForm } from '@/components/forms/form-core'
import { logoutFormOption } from '@/modules/auth/form-option'
import { useCsrfTokenQuery } from '@/modules/auth/hooks/use-csrf-token-query'

export const Logout = () => {
  const { data } = useCsrfTokenQuery()
  const logoutAppForm = useAppForm({
    ...logoutFormOption,
    defaultValues: {
      csrfToken: data,
    },
  })

  return (
    <logoutAppForm.AppForm>
      <form action='/api/auth/signout' method='POST' className='w-full'>
        <logoutAppForm.AppField name='csrfToken'>
          {(feild) => <feild.FormInput hidden />}
        </logoutAppForm.AppField>

        <logoutAppForm.SubmitButton
          variant={'destructive'}
          className={'w-full'}
        >
          Logout
        </logoutAppForm.SubmitButton>
      </form>
    </logoutAppForm.AppForm>
  )
}
