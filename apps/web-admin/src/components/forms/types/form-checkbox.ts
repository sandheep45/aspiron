import type { ComponentProps } from 'react'
import type { output, ZodObject, ZodRawShape } from 'zod'
import type { Checkbox } from '@/components/ui/checkbox'
import type { Label } from '@/components/ui/label'

export type FormCheckboxProps = ComponentProps<typeof Checkbox> & {
  labelProps?: ComponentProps<typeof Label>
}

export type FormCheckboxPropsWithZodSchema<
  Schema extends ZodObject<ZodRawShape>,
> = FormCheckboxProps & {
  schemaName: Extract<keyof output<Schema>, string>
}
