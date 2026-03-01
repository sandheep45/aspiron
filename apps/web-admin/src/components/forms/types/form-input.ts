import type { ComponentProps } from 'react'
import type { output, ZodObject, ZodRawShape } from 'zod'
import type { Input } from '@/components/ui/input'
import type { Label } from '@/components/ui/label'

export type FormInputProps = ComponentProps<typeof Input> & {
  labelProps?: ComponentProps<typeof Label>
}

export type FormInputPropsWithZodSchema<Schema extends ZodObject<ZodRawShape>> =
  FormInputProps & {
    schemaName: Extract<keyof output<Schema>, string>
  }
