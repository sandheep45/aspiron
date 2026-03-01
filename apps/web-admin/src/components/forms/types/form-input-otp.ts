import type { ComponentProps } from 'react'
import type { output, ZodObject, ZodRawShape } from 'zod'
import type { InputOTP } from '@/components/ui/input-otp'
import type { Label } from '@/components/ui/label'

export type FormInputOTPProps = ComponentProps<typeof InputOTP> & {
  labelProps?: ComponentProps<typeof Label>
}

export type FormInputOTPPropsWithZodSchema<
  Schema extends ZodObject<ZodRawShape>,
> = FormInputOTPProps & {
  schemaName: Extract<keyof output<Schema>, string>
}
