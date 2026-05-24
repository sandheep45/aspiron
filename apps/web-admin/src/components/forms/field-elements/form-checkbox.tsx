import {
  FieldWrapper,
  useFieldMeta,
} from '@/components/forms/field-elements/field-wrapper'
import type { FormCheckboxProps } from '@/components/forms/types/form-checkbox'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldLabel } from '@/components/ui/field'

export const FormCheckbox = (props: FormCheckboxProps) => {
  const { labelProps, ...checkboxProps } = props
  const { field, isInvalid, inputId } = useFieldMeta<boolean>()

  return (
    <FieldWrapper
      orientation='horizontal'
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
    >
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
    </FieldWrapper>
  )
}
