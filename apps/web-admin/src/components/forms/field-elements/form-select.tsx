import {
  FieldWrapper,
  useFieldMeta,
} from '@/components/forms/field-elements/field-wrapper'
import type { FormSelectProps } from '@/components/forms/types/form-select'
import { FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const FormSelect = ({
  labelProps,
  placeholder,
  children,
  ...selectTriggerProps
}: FormSelectProps) => {
  const { field, isInvalid, inputId } = useFieldMeta<string>()

  return (
    <FieldWrapper isInvalid={isInvalid} errors={field.state.meta.errors}>
      <FieldLabel {...labelProps} htmlFor={inputId}>
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <Select
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value || '')}
      >
        <SelectTrigger
          {...selectTriggerProps}
          id={inputId}
          aria-invalid={isInvalid}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FieldWrapper>
  )
}
