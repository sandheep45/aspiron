import { createServerFn } from '@tanstack/react-start'
import { getRequest, getResponse } from '@tanstack/react-start/server'
import { signIn } from '@/lib/auth'
import { loginSchema } from '@/modules/auth/schema'

export const signInServerFunction = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const formData = new FormData()
    const request = getRequest()
    const response = getResponse()

    for (const [key, value] of Object.entries(data ?? {})) {
      formData.append(key, String(value))
    }

    const newRequest = new Request(request.url, {
      method: 'POST',
      body: formData,
    })

    await signIn({ request: newRequest, response })
  })
