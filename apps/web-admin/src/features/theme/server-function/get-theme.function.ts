import { createServerFn } from '@tanstack/react-start'
import { getCookies } from '@tanstack/react-start/server'

export const getThemeCookie = createServerFn({ method: 'GET' }).handler(
  async () => {
    const cookies = getCookies()
    return cookies['vite-ui-theme'] || null
  },
)
