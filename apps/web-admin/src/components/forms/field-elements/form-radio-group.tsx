import { useFieldContext } from '@/components/forms/form-core'
import type { FormRadioGroupProps } from '@/components/forms/types/form-radio-group'
import { FieldError, FieldLegend } from '@/components/ui/field'
import { RadioGroup } from '@/components/ui/radio-group'

export const FormRadioGroup = ({
  labelProps,
  children,
  ...radioGroupProps
}: FormRadioGroupProps) => {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <>
      {labelProps && <FieldLegend>{labelProps.children}</FieldLegend>}
      <RadioGroup
        {...radioGroupProps}
        value={field.state.value}
        onValueChange={field.handleChange}
        aria-invalid={isInvalid}
      >
        {children}
      </RadioGroup>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </>
  )
}
