import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

test.describe('Subjects Page Visual Regression (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
  })

  test('subjects page layout matches baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('subjects-page.png', {
      maxDiffPixelRatio: 0.05,
    })
  })
})
