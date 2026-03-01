import type { ComponentProps } from 'react'
import type { output, ZodObject, ZodRawShape } from 'zod'
import type { Label } from '@/components/ui/label'
import type { SelectTrigger } from '@/components/ui/select'

export type FormSelectProps = ComponentProps<typeof SelectTrigger> & {
  labelProps?: ComponentProps<typeof Label>
  placeholder?: string
}

export type FormSelectPropsWithZodSchema<
  Schema extends ZodObject<ZodRawShape>,
> = FormSelectProps & {
  schemaName: Extract<keyof output<Schema>, string>
}
