import {
  FieldWrapper,
  useFieldMeta,
} from '@/components/forms/field-elements/field-wrapper'
import type { FormInputOTPProps } from '@/components/forms/types/form-input-otp'
import { FieldLabel } from '@/components/ui/field'
import { InputOTP } from '@/components/ui/input-otp'

export const FormInputOTP = (props: FormInputOTPProps) => {
  const { labelProps, ...inputOTPProps } = props
  const { field, isInvalid, inputId } = useFieldMeta<string>()

  return (
    <FieldWrapper isInvalid={isInvalid} errors={field.state.meta.errors}>
      <FieldLabel {...labelProps} htmlFor={inputId}>
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <InputOTP
        {...inputOTPProps}
        id={inputId}
        value={field.state.value}
        onChange={(value) => field.handleChange(value || '')}
        aria-invalid={isInvalid}
      />
    </FieldWrapper>
  )
}
