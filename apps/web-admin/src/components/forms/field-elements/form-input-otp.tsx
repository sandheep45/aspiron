import { useFieldContext } from '@/components/forms/form-core'
import type { FormInputOTPProps } from '@/components/forms/types/form-input-otp'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { InputOTP } from '@/components/ui/input-otp'

export const FormInputOTP = (props: FormInputOTPProps) => {
  const { labelProps, ...inputOTPProps } = props
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel {...labelProps} htmlFor={field.name}>
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <InputOTP
        {...inputOTPProps}
        id={field.name}
        value={field.state.value}
        onChange={(value) => field.handleChange(value || '')}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
