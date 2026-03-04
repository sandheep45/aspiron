import { useId } from 'react'
import { useFieldContext } from '@/components/forms/form-core'
import type { FormSliderProps } from '@/components/forms/types/form-slider'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Slider } from '@/components/ui/slider'

export const FormSlider = (props: FormSliderProps) => {
  const { labelProps, ...sliderProps } = props
  const field = useFieldContext<number[]>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const generatedId = useId()

  const inputId = `${generatedId}-${field.name}`

  return (
    <Field data-invalid={isInvalid}>
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
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
