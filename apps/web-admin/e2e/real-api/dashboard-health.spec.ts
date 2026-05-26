import { expect, test } from '@playwright/test'
import { seedUser } from './login'

test.describe('Dashboard System Health (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedUser(context, page)
  })

  test('system health section is visible', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="system-health"]')
    await expect(section).toBeVisible()
  })

  test('shows metric values', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="system-health"]')
    await expect(
      section.getByText(/756|active students/i).first(),
    ).toBeVisible()
  })
})
