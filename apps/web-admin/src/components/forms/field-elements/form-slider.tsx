import {
  FieldWrapper,
  useFieldMeta,
} from '@/components/forms/field-elements/field-wrapper'
import type { FormSliderProps } from '@/components/forms/types/form-slider'
import { FieldLabel } from '@/components/ui/field'
import { Slider } from '@/components/ui/slider'

export const FormSlider = (props: FormSliderProps) => {
  const { labelProps, ...sliderProps } = props
  const { field, isInvalid, inputId } = useFieldMeta<number[]>()

  return (
    <FieldWrapper isInvalid={isInvalid} errors={field.state.meta.errors}>
      <FieldLabel {...labelProps} htmlFor={inputId}>
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <Slider
        {...sliderProps}
        id={inputId}
        value={field.state.value}
        onValueChange={(value) =>
          field.handleChange(Array.isArray(value) ? value : [value])
        }
        aria-invalid={isInvalid}
      />
    </FieldWrapper>
  )
}
