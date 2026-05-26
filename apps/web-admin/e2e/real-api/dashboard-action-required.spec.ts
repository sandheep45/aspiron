import { expect, test } from '@playwright/test'
import { seedUser } from './login'

test.describe('Dashboard Action Required (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedUser(context, page)
  })

  test('action required section is visible', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="action-required"]')
    await expect(section).toBeVisible()
  })

  test('shows action items', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="action-required"]')
    await expect(section.getByText(/low engagement/i).first()).toBeVisible()
  })
})
