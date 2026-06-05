import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

test.describe('Content Dashboard Visual Regression (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
    await page.goto('/content')
    await page.waitForLoadState('networkidle')
  })

  test('dashboard layout matches baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('content-dashboard-full.png', {
      maxDiffPixelRatio: 0.05,
    })
  })
})
