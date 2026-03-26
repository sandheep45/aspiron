import { formOptions } from '@tanstack/react-form-start'
import { loginSchema, logoutSchema } from '@/modules/auth/schema'

export const loginFormOption = formOptions({
  validators: {
    onChange: loginSchema,
  },
  defaultValues: {
    email: 'barbara_turner.1@admin.aspiron',
    password: 'admin123',
    providerId: 'credentials',
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
