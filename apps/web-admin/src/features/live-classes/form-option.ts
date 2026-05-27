import { formOptions } from '@tanstack/react-form-start'
import { createClassSchema } from '@/features/live-classes/schema'

export const createClassFormOption = formOptions({
  validators: {
    onChange: createClassSchema,
  },
  defaultValues: {
    provider: '',
    scheduled_at: '',
    duration_min: 45,
    join_url: '',
  },
})
