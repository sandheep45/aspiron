import type { ApiResponse, AuthResponse } from '@aspiron/api-client'
import { createAuthResponse } from '@mock/factories/student.factory'
import { HttpResponse, http } from 'msw'

export const authHandlers = [
  http.post('*/api/v1/auth/login', () => {
    const body: ApiResponse<null> = {
      success: true,
      data: null,
      message: null,
      code: null,
    }
    return HttpResponse.json(body, {
      headers: {
        'Set-Cookie': [
          'access_token=mock-access-token; Path=/; HttpOnly; SameSite=Lax; Max-Age=900',
          'refresh_token=mock-refresh-token; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800',
        ].join(', '),
      },
    })
  }),

  http.get('*/api/v1/auth/refresh-token', () => {
    const body: ApiResponse<null> = {
      success: true,
      data: null,
      message: null,
      code: null,
    }
    return HttpResponse.json(body, {
      headers: {
        'Set-Cookie': [
          'access_token=mock-access-token; Path=/; HttpOnly; SameSite=Lax; Max-Age=900',
          'refresh_token=mock-refresh-token; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800',
        ].join(', '),
      },
    })
  }),

  http.get('*/api/v1/auth/me', () => {
    const data = createAuthResponse({
      expires_in: 3600 as unknown as bigint,
    }) as unknown as AuthResponse
    const body: ApiResponse<AuthResponse> = {
      success: true,
      data,
      message: null,
      code: null,
    }
    return HttpResponse.json(body)
  }),

  http.post('*/api/v1/auth/register-user', () => {
    const body: ApiResponse<null> = {
      success: true,
      data: null,
      message: 'Registration successful',
      code: null,
    }
    return HttpResponse.json(body)
  }),

  http.post('*/api/v1/auth/logout', () => {
    return HttpResponse.json({ success: true, message: 'Logged out' })
  }),
]
