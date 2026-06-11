import { formOptions } from '@tanstack/react-form-start'
import { createTestSchema } from '@/features/create-test/schema'

export const createTestFormOption = formOptions({
  validators: {
    onChange: createTestSchema,
  },
  defaultValues: {
    title: '',
    description: '',
    instructions: '',
    duration_minutes: 30,
    passing_score: undefined,
    max_attempts: 3,
    visibility: 'Visible',
    status: 'Draft',
  },
})
