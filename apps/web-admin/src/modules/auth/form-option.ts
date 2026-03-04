import { formOptions } from '@tanstack/react-form-start'
import { loginSchema } from './schema'

export const loginFormOption = formOptions({
  validators: {
    onChange: loginSchema,
  },
  defaultValues: {
    email: 'barbara_turner.1@admin.aspiron',
    password: 'admin123',
  },
})
