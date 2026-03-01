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

  return (
    <Field orientation='horizontal' data-invalid={isInvalid}>
      <FieldContent>
        {labelProps && (
          <FieldLabel {...labelProps} htmlFor={field.name}>
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
        id={field.name}
        checked={field.state.value}
        onCheckedChange={field.handleChange}
        aria-invalid={isInvalid}
      />
    </Field>
  )
}
