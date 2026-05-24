import type { ComponentProps } from 'react'
import { useFormContext } from '@/components/forms/form-core'
import { Button } from '@/components/ui/button'

export function SubmitButton(props: ComponentProps<typeof Button>) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          type='submit'
          disabled={isSubmitting}
          {...props}
          variant={isSubmitting ? 'default' : (props.variant ?? 'brand')}
        />
      )}
    </form.Subscribe>
  )
}
