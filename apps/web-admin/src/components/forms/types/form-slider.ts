import type { ComponentProps } from 'react'
import type { output, ZodObject, ZodRawShape } from 'zod'
import type { Label } from '@/components/ui/label'
import type { Slider } from '@/components/ui/slider'

export type FormSliderProps = ComponentProps<typeof Slider> & {
  labelProps?: ComponentProps<typeof Label>
}

export type FormSliderPropsWithZodSchema<
  Schema extends ZodObject<ZodRawShape>,
> = FormSliderProps & {
  schemaName: Extract<keyof output<Schema>, string>
}
