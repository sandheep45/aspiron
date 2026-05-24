import {
  FieldWrapper,
  useFieldMeta,
} from '@/components/forms/field-elements/field-wrapper'
import type { FormTextareaProps } from '@/components/forms/types/form-textarea'
import { FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

export const FormTextarea = (props: FormTextareaProps) => {
  const { labelProps, ...textareaProps } = props
  const { field, isInvalid, inputId } = useFieldMeta<string>()

  return (
    <FieldWrapper isInvalid={isInvalid} errors={field.state.meta.errors}>
      <FieldLabel {...labelProps} htmlFor={inputId}>
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <Textarea
        {...textareaProps}
        id={inputId}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />
    </FieldWrapper>
  )
}
