import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

const TOPIC_ID = '30000000-0000-0000-0000-000000000041'

test.describe('Recall Insights Visual Regression (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
  })

  test('recall insights layout matches baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('recall-insights-full.png', {
      maxDiffPixelRatio: 0.05,
    })
  })
})
