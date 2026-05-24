import { formOptions } from '@tanstack/react-form-start'
import { loginSchema, logoutSchema } from '@/features/auth/schema'

export const loginFormOption = formOptions({
  validators: {
    onChange: loginSchema,
  },
})

export const logoutFormOption = formOptions({
  validators: {
    onChange: logoutSchema,
  },
  defaultValues: {
    csrfToken: '',
  },
})
