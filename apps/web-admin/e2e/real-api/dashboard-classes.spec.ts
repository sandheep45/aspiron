import { expect, test } from '@playwright/test'
import { seedUser } from './login'

test.describe('Dashboard Classes Section (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedUser(context, page)
  })

  test('upcoming classes section is visible', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="upcoming-classes"]')
    await expect(section).toBeVisible()
  })

  test('shows upcoming class cards', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="upcoming-classes"]')
    await expect(
      section.locator('[data-testid="class-card"]').first(),
    ).toBeVisible()
  })
})
