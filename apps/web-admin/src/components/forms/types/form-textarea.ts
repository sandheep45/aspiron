import type { ComponentProps } from 'react'
import type { output, ZodObject, ZodRawShape } from 'zod'
import type { Label } from '@/components/ui/label'
import type { Textarea } from '@/components/ui/textarea'

export type FormTextareaProps = ComponentProps<typeof Textarea> & {
  labelProps?: ComponentProps<typeof Label>
}

export type FormTextareaPropsWithZodSchema<
  Schema extends ZodObject<ZodRawShape>,
> = FormTextareaProps & {
  schemaName: Extract<keyof output<Schema>, string>
}
