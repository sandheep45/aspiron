import { useId } from 'react'
import { useFieldContext } from '@/components/forms/form-core'
import type { FormCheckboxProps } from '@/components/forms/types/form-checkbox'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

export const FormCheckbox = (props: FormCheckboxProps) => {
  const { labelProps, ...checkboxProps } = props
  const field = useFieldContext<boolean>()
  const generatedId = useId()

  const inputId = `${generatedId}-${field.name}`
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field orientation='horizontal' data-invalid={isInvalid}>
      <Checkbox
        {...checkboxProps}
        id={inputId}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(!!checked)}
        aria-invalid={isInvalid}
      />
      {labelProps && (
        <FieldLabel {...labelProps} htmlFor={inputId}>
          <span>{labelProps.children}</span>
        </FieldLabel>
      )}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
