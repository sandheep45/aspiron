import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

const TOPIC_ID = '30000000-0000-0000-0000-000000000041'

test.describe('Notes Manager Visual Regression (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')
  })

  test('notes manager layout matches baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('notes-manager-full.png', {
      maxDiffPixelRatio: 0.05,
    })
  })
})
