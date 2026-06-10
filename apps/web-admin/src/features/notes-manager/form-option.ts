import { formOptions } from '@tanstack/react-form-start'
import { referenceSchema } from '@/features/notes-manager/schema'

export const referenceFormOption = formOptions({
  validators: {
    onChange: referenceSchema,
  },
  defaultValues: {
    title: '',
    source: '',
    referenceType: 'URL',
    url: '',
  },
})
