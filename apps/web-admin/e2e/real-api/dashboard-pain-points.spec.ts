import { expect, test } from '@playwright/test'
import { seedUser } from './login'

test.describe('Dashboard Student Pain Points (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedUser(context, page)
  })

  test('pain points section is visible', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="pain-points"]')
    await expect(section).toBeVisible()
  })

  test('shows error state when insights API fails', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="pain-points"]')
    await expect(section.getByText(/error|retry/i).first()).toBeVisible()
  })
})
