import { useId } from 'react'
import { useFieldContext } from '@/components/forms/form-core'
import type { FormSwitchProps } from '@/components/forms/types/form-switch'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

export const FormSwitch = (props: FormSwitchProps) => {
  const { labelProps, ...switchProps } = props
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const generatedId = useId()

  const inputId = `${generatedId}-${field.name}`

  return (
    <Field orientation='horizontal' data-invalid={isInvalid}>
      <FieldContent>
        {labelProps && (
          <FieldLabel {...labelProps} htmlFor={inputId}>
            <span>{labelProps.children}</span>
          </FieldLabel>
        )}
        {labelProps?.children && (
          <FieldDescription>{labelProps.children}</FieldDescription>
        )}
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </FieldContent>
      <Switch
        {...switchProps}
        id={inputId}
        checked={field.state.value}
        onCheckedChange={field.handleChange}
        aria-invalid={isInvalid}
      />
    </Field>
  )
}
