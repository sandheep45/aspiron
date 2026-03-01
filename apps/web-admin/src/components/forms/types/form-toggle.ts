import type { ComponentProps } from 'react'
import type { output, ZodObject, ZodRawShape } from 'zod'
import type { Label } from '@/components/ui/label'
import type { Toggle } from '@/components/ui/toggle'

export type FormToggleProps = ComponentProps<typeof Toggle> & {
  labelProps?: ComponentProps<typeof Label>
}

export type FormTogglePropsWithZodSchema<
  Schema extends ZodObject<ZodRawShape>,
> = FormToggleProps & {
  schemaName: Extract<keyof output<Schema>, string>
}
