import { useFieldContext } from '@/components/forms/form-core'
import type { FormToggleProps } from '@/components/forms/types/form-toggle'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Toggle } from '@/components/ui/toggle'

export const FormToggle = (props: FormToggleProps) => {
  const { labelProps, ...toggleProps } = props
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field orientation='horizontal' data-invalid={isInvalid}>
      <Toggle
        {...toggleProps}
        id={field.name}
        pressed={field.state.value}
        onPressedChange={field.handleChange}
        aria-invalid={isInvalid}
      >
        {toggleProps.children}
      </Toggle>
      {labelProps && (
        <FieldLabel {...labelProps} htmlFor={field.name}>
          <span>{labelProps.children}</span>
        </FieldLabel>
      )}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
