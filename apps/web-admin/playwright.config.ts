import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  globalSetup: './e2e/real-api/globalSetup.ts',
  globalTeardown: './e2e/real-api/globalTeardown.ts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    headless: false,
  },
  projects: [
    {
      name: 'unit-msw',
      testDir: './e2e/dashboard',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://local.aspiron.test:3000',
        ignoreHTTPSErrors: true,
      },
      webServer: {
        command: 'bash -c "source ../../.env && pnpm dev --filter web-admin"',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
      },
    },
    {
      name: 'pain-points-msw',
      testDir: './e2e/pain-points',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://local.aspiron.test:3000',
        ignoreHTTPSErrors: true,
      },
      webServer: {
        command: 'bash -c "source ../../.env && pnpm dev --filter web-admin"',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
      },
    },
    {
      name: 'real-api',
      testDir: './e2e/real-api',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://local.aspiron.test:3000',
        ignoreHTTPSErrors: true,
      },
    },
  ],
})
