import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../mock/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({
    handler: vi.fn(),
  }),
}))

vi.mock('@tanstack/react-start/server', () => ({
  getCookies: vi.fn(() => ({})),
}))

vi.mock('@tanstack/react-start/client', () => ({
  useServerFn: vi.fn(),
}))
