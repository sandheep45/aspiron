import {
  FieldWrapper,
  useFieldMeta,
} from '@/components/forms/field-elements/field-wrapper'
import type { FormSwitchProps } from '@/components/forms/types/form-switch'
import {
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

export const FormSwitch = (props: FormSwitchProps) => {
  const { labelProps, ...switchProps } = props
  const { field, isInvalid, inputId } = useFieldMeta<boolean>()

  return (
    <FieldWrapper
      orientation='horizontal'
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
    >
      <FieldContent>
        {labelProps && (
          <FieldLabel {...labelProps} htmlFor={inputId}>
            <span>{labelProps.children}</span>
          </FieldLabel>
        )}
        {labelProps?.children && (
          <FieldDescription>{labelProps.children}</FieldDescription>
        )}
      </FieldContent>
      <Switch
        {...switchProps}
        id={inputId}
        checked={field.state.value}
        onCheckedChange={field.handleChange}
        aria-invalid={isInvalid}
      />
    </FieldWrapper>
  )
}
