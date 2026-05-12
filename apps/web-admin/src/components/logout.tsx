import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useAppForm } from '@/components/forms/form-core'
import { logoutFormOption } from '@/modules/auth/form-option'
import { useCsrfTokenQuery } from '@/modules/auth/hooks/use-csrf-token-query'
import { signOutServerFunction } from '@/modules/auth/server-function/sign-out.function'

export const Logout = () => {
  const { data } = useCsrfTokenQuery()
  const _navigate = useNavigate()
  const signOut = useServerFn(signOutServerFunction)
  const logoutAppForm = useAppForm({
    ...logoutFormOption,
    onSubmit: async () => {
      await signOut()
      // navigate({
      //   to: "/auth/login",
      // });
    },
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
