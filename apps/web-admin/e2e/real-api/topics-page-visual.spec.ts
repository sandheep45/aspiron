import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

const SUBJECT_ID = '30000000-0000-0000-0000-000000000020'
const CHAPTER_ID = '30000000-0000-0000-0000-000000000030'

test.describe('Topics Page Visual Regression (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
    await page.goto(
      `/content/subjects/${SUBJECT_ID}/chapters/${CHAPTER_ID}/topics`,
    )
    await page.waitForLoadState('networkidle')
  })

  test('topics page layout matches baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('topics-page-full.png', {
      maxDiffPixelRatio: 0.05,
    })
  })
})
