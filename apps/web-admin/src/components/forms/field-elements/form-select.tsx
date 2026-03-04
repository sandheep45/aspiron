import { useId } from 'react'
import { useFieldContext } from '@/components/forms/form-core'
import type { FormSelectProps } from '@/components/forms/types/form-select'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const FormSelect = ({
  labelProps,
  placeholder,
  children,
  ...selectTriggerProps
}: FormSelectProps) => {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const generatedId = useId()

  const inputId = `${generatedId}-${field.name}`

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel {...labelProps} htmlFor={inputId}>
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <Select
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value || '')}
      >
        <SelectTrigger
          {...selectTriggerProps}
          id={inputId}
          aria-invalid={isInvalid}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
