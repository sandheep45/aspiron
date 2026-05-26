import { expect, test } from '@playwright/test'
import { seedUser } from './login'

test.describe('Dashboard Reliability (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedUser(context, page)
  })

  test('dashboard loads all modules', async ({ page }) => {
    const sections = page.locator('[data-dashboard-section]')
    const count = await sections.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })
})
