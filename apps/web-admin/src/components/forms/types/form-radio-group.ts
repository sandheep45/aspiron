import type { ComponentProps, ReactNode } from 'react'
import type { output, ZodObject, ZodRawShape } from 'zod'
import type { RadioGroup } from '@/components/ui/radio-group'

export type FormRadioGroupProps = ComponentProps<typeof RadioGroup> & {
  labelProps?: {
    children?: ReactNode
  }
}

export type FormRadioGroupPropsWithZodSchema<
  Schema extends ZodObject<ZodRawShape>,
> = FormRadioGroupProps & {
  schemaName: Extract<keyof output<Schema>, string>
}
