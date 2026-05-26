import type { BrowserContext, Page } from '@playwright/test'

const BACKEND_URL = 'https://local.aspiron.test:8082/api/v1'

export async function loginAsE2eStudent(page: Page, context: BrowserContext) {
  const loginResp = await page.request.post(`${BACKEND_URL}/auth/login`, {
    headers: {
      'Content-Type': 'application/json',
      'x-client-type': 'BROWSER',
    },
    data: {
      email: 'e2e.student@aspiron.test',
      password: 'student123',
    },
  })

  const setCookie = loginResp.headers()['set-cookie']
  if (!setCookie) {
    throw new Error('No Set-Cookie header in login response')
  }

  const cookies = parseSetCookie(setCookie)
  await context.addCookies(cookies)
}

function parseSetCookie(setCookieHeader: string) {
  const cookieStrings = setCookieHeader
    .split(/,(?=\s*\w+=)/)
    .map((s) => s.trim())

  return cookieStrings.map((cookieStr) => {
    const parts = cookieStr.split(';').map((p) => p.trim())
    const [nameValue, ...attrs] = parts
    const eqIdx = nameValue.indexOf('=')
    const name = nameValue.slice(0, eqIdx).trim()
    const value = nameValue.slice(eqIdx + 1).trim()

    const cookie: {
      name: string
      value: string
      domain: string
      path: string
      httpOnly?: boolean
      secure?: boolean
      sameSite?: 'Lax' | 'Strict' | 'None'
    } = {
      name,
      value,
      domain: 'local.aspiron.test',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    }

    for (const attr of attrs) {
      const lower = attr.toLowerCase()
      if (lower.startsWith('domain=')) {
        cookie.domain = attr.slice(7)
      } else if (lower.startsWith('path=')) {
        cookie.path = attr.slice(5)
      } else if (lower === 'httponly') {
        cookie.httpOnly = true
      } else if (lower === 'secure') {
        cookie.secure = true
      } else if (lower === 'lax') {
        cookie.sameSite = 'Lax'
      } else if (lower === 'strict') {
        cookie.sameSite = 'Strict'
      }
    }

    return cookie
  })
}

export async function seedUser(context: BrowserContext, page: Page) {
  await loginAsE2eStudent(page, context)
  await page.goto('/dashboard')
  await page.waitForURL('**/dashboard')
}
