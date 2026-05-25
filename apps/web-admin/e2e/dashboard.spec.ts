import { expect, test } from '@playwright/test'

test.describe('Dashboard', () => {
  test('redirects unauthenticated users to auth page', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL('/auth')
    expect(page.url()).toContain('/auth')
  })
})
