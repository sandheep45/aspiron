import type { ComponentProps } from 'react'
import type { output, ZodObject, ZodRawShape } from 'zod'
import type { Label } from '@/components/ui/label'
import type { Switch } from '@/components/ui/switch'

export type FormSwitchProps = ComponentProps<typeof Switch> & {
  labelProps?: ComponentProps<typeof Label>
}

export type FormSwitchPropsWithZodSchema<
  Schema extends ZodObject<ZodRawShape>,
> = FormSwitchProps & {
  schemaName: Extract<keyof output<Schema>, string>
}
