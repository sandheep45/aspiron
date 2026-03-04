import { useId } from 'react'
import { useFieldContext } from '@/components/forms/form-core'
import type { FormTextareaProps } from '@/components/forms/types/form-textarea'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

export const FormTextarea = (props: FormTextareaProps) => {
  const { labelProps, ...textareaProps } = props
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const generatedId = useId()

  const inputId = `${generatedId}-${field.name}`

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel {...labelProps} htmlFor={inputId}>
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <Textarea
        {...textareaProps}
        id={inputId}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
