import { useEffect, useState } from 'react'

export const Logout = () => {
  const [csrfToken, setCsrfToken] = useState<string>('')

  useEffect(() => {
    fetch('/api/auth/csrf')
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
  }, [])
  ;<form action='/api/auth/signout' method='POST'>
    <input type='hidden' name='csrfToken' value={csrfToken} />
    <button type='submit' className=''>
      Logout
    </button>
  </form>
}
