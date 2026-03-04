import type React from 'react'
import type { ComponentProps } from 'react'
import type { output, ZodObject, ZodRawShape } from 'zod'
import type { InputProps } from '@/components/ui/input'
import type { Label } from '@/components/ui/label'

export type FormInputProps = InputProps & {
  isPasswordType?: boolean
  labelProps?: ComponentProps<typeof Label>
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export type FormInputPropsWithZodSchema<Schema extends ZodObject<ZodRawShape>> =
  FormInputProps & {
    schemaName: Extract<keyof output<Schema>, string>
  }
