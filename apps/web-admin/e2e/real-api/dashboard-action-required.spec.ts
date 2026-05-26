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

  test('limits insights to 5 cards', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="action-required"]')
    const cards = section.locator('[data-slot="card"]')
    const count = await cards.count()
    expect(count).toBeLessThanOrEqual(5)
  })

  test('shows view all button', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="action-required"]')
    await expect(section.getByText('View All').first()).toBeVisible()
  })

  test('clicking view all navigates to insights page', async ({ page }) => {
    await page.getByText('View All').first().click()
    await page.waitForURL('**/insights')
    await expect(page).toHaveURL(/\/insights/)
  })
})
