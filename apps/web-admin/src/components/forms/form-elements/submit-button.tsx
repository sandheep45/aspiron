import { useFormContext } from '@/components/forms/form-core'
import { Button } from '@/components/ui/button'

export function SubmitButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          variant={isSubmitting ? 'default' : 'brand'}
          type='submit'
          disabled={isSubmitting}
        >
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}
