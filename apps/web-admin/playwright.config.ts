import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'unit-msw',
      testDir: './e2e/dashboard',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'real-api',
      testDir: './e2e/real-api',
      globalSetup: './e2e/real-api/globalSetup.ts',
      globalTeardown: './e2e/real-api/globalTeardown.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://local.aspiron.test:3000',
        ignoreHTTPSErrors: true,
      },
    },
  ],
})
