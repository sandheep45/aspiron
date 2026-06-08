import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

const SUBJECT_ID = '30000000-0000-0000-0000-000000000020'

test.describe('Chapters Page Visual Regression (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
    await page.goto(`/content/subjects/${SUBJECT_ID}/chapters`)
    await page.waitForLoadState('networkidle')
  })

  test('chapters page layout matches baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('chapters-page-full.png', {
      maxDiffPixelRatio: 0.05,
    })
  })
})
