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

  test('limits topics to 5 rows', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="pain-points"]')
    const rows = section.locator('[data-testid="pain-point-row"]')
    const count = await rows.count()
    expect(count).toBeLessThanOrEqual(5)
  })

  test('shows view all button', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="pain-points"]')
    await expect(section.getByText('View All').first()).toBeVisible()
  })

  test('clicking view all navigates to pain points page', async ({ page }) => {
    const section = page.locator('[data-dashboard-section="pain-points"]')
    await section.getByText('View All').click()
    await page.waitForURL('**/pain-points')
    await expect(page).toHaveURL(/\/pain-points/)
  })
})
