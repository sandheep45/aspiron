import { useId } from 'react'
import { useFieldContext } from '@/components/forms/form-core'
import type { FormInputProps } from '@/components/forms/types/form-input'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export const FormInput = (props: FormInputProps) => {
  const { labelProps, ...inputProps } = props
  const field = useFieldContext<string>()
  const generatedId = useId()

  const inputId = `${generatedId}-${field.name}`
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel {...labelProps} htmlFor={inputId}>
        <span>{labelProps?.children}</span>
      </FieldLabel>

      <Input
        {...inputProps}
        id={inputId}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
