import { useFieldContext } from '@/components/forms/form-core'
import type { FormInputProps } from '@/components/forms/types/form-input'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export const FormInput = (props: FormInputProps) => {
  const { labelProps, ...inputProps } = props
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel {...labelProps} htmlFor={field.name}>
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <Input
        {...inputProps}
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
