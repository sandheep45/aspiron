import { Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'
import { useFieldContext } from '@/components/forms/form-core'
import type { FormInputProps } from '@/components/forms/types/form-input'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const FormInput = (props: FormInputProps) => {
  const {
    labelProps,
    isPasswordType,
    rightIcon: RightIcon,
    leftIcon: LeftIcon,
    ...inputProps
  } = props
  const [showPassword, setShowPassword] = useState(!!isPasswordType)

  const field = useFieldContext<string>()
  const generatedId = useId()

  const inputId = `${generatedId}-${field.name}`
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field
      data-invalid={isInvalid}
      className={cn(props.hidden ? 'hidden' : '')}
    >
      <FieldLabel {...labelProps} htmlFor={inputId}>
        <span>{labelProps?.children}</span>
      </FieldLabel>

      <div className='relative'>
        {LeftIcon && (
          <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
            {LeftIcon}
          </div>
        )}

        <Input
          variant={'form'}
          {...inputProps}
          id={inputId}
          type={showPassword ? 'password' : inputProps.type}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          className={cn(
            LeftIcon && 'pl-9',
            RightIcon && 'pr-9',
            inputProps.className,
          )}
        />

        {isPasswordType && (
          <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
            <Button
              variant={'ghost'}
              size={'icon'}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className='size-3 text-slate-500' />
              ) : (
                <Eye className='size-3' />
              )}
            </Button>
          </div>
        )}

        {RightIcon && !isPasswordType && (
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
            {RightIcon}
          </div>
        )}
      </div>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
