import { useFieldContext } from '@/components/forms/form-core'
import type { FormSliderProps } from '@/components/forms/types/form-slider'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Slider } from '@/components/ui/slider'

export const FormSlider = (props: FormSliderProps) => {
  const { labelProps, ...sliderProps } = props
  const field = useFieldContext<number[]>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel {...labelProps} htmlFor={field.name}>
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <Slider
        {...sliderProps}
        id={field.name}
        value={field.state.value}
        onValueChange={(value) =>
          field.handleChange(Array.isArray(value) ? value : [value])
        }
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
