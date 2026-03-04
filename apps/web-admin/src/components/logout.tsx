import { Button } from '@/components/ui/button'
import { useCsfrToken } from '@/hooks/use-csfr-token'

export const Logout = () => {
  const csrfToken = useCsfrToken()

  return (
    <form action='/api/auth/signout' method='POST' className='w-full'>
      <input type='hidden' name='csrfToken' value={csrfToken} />
      <Button variant={'destructive'} type='submit' className='w-full'>
        Logout
      </Button>
    </form>
  )
}
