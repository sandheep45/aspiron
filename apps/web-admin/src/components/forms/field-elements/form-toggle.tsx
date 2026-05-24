import {
  FieldWrapper,
  useFieldMeta,
} from '@/components/forms/field-elements/field-wrapper'
import type { FormToggleProps } from '@/components/forms/types/form-toggle'
import { FieldLabel } from '@/components/ui/field'
import { Toggle } from '@/components/ui/toggle'

export const FormToggle = (props: FormToggleProps) => {
  const { labelProps, ...toggleProps } = props
  const { field, isInvalid, inputId } = useFieldMeta<boolean>()

  return (
    <FieldWrapper
      orientation='horizontal'
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
    >
      <Toggle
        {...toggleProps}
        id={inputId}
        pressed={field.state.value}
        onPressedChange={field.handleChange}
        aria-invalid={isInvalid}
      >
        {toggleProps.children}
      </Toggle>
      {labelProps && (
        <FieldLabel {...labelProps} htmlFor={inputId}>
          <span>{labelProps.children}</span>
        </FieldLabel>
      )}
    </FieldWrapper>
  )
}
