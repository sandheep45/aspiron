import { useEffect, useState } from 'react'

export const useCsfrToken = () => {
  const [csrfToken, setCsrfToken] = useState<string>('')

  useEffect(() => {
    fetch('/api/auth/csrf')
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
  }, [])

  return csrfToken
}
