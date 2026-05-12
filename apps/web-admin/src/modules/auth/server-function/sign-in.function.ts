import { createServerFn } from '@tanstack/react-start'
import { getRequest, getResponse } from '@tanstack/react-start/server'
import { signIn } from '@/lib/auth'
import { loginSchema, tokenSchema } from '@/modules/auth/schema'

export const signInServerFunction = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema.or(tokenSchema))
  .handler(async ({ data }) => {
    const formData = new FormData()
    const request = getRequest()
    const response = getResponse()

    const tokenData = tokenSchema.safeParse(data)

    if (tokenData.success) {
      formData.append('providerId', 'credentials')
      formData.append('email', tokenData.data.user.email)
      formData.append('password', '')
      formData.append('data', JSON.stringify(data))
      const newRequest = new Request(request.url, {
        method: 'POST',
        body: formData,
      })

      await signIn({ request: newRequest, response })

      return
    }

    for (const [key, value] of Object.entries(data ?? {})) {
      formData.append(key, String(value))
    }

    const newRequest = new Request(request.url, {
      method: 'POST',
      body: formData,
    })

    await signIn({ request: newRequest, response })
  })
