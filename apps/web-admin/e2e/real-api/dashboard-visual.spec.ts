import { expect, test } from '@playwright/test'
import { seedUser } from './login'

test.describe('Dashboard Visual Regression (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedUser(context, page)
    await page.waitForLoadState('networkidle')
  })

  test('dashboard layout matches baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard-full.png', {
      maxDiffPixelRatio: 0.05,
    })
  })
})
