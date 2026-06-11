import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../mock/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  Element.prototype.scrollIntoView = () => {}
  if (!document.elementFromPoint) {
    document.elementFromPoint = () => document.createElement('div')
  }
})
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
