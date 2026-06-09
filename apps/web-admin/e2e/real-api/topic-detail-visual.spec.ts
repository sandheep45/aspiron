import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

const TOPIC_ID = '30000000-0000-0000-0000-000000000041'

test.describe('Topic Detail Visual Regression (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
    await page.goto(`/content/topic/${TOPIC_ID}`)
    await page.waitForLoadState('networkidle')
  })

  test('topic detail layout matches baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('topic-detail-full.png', {
      maxDiffPixelRatio: 0.05,
    })
  })
})
