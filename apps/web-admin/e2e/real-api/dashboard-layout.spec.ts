import { expect, test } from '@playwright/test'
import { seedUser } from './login'

test.describe('Dashboard Layout (Real API)', () => {
  test('authenticates with seeded user and shows dashboard', async ({
    page,
    context,
  }) => {
    await seedUser(context, page)

    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('sidebar navigation links render', async ({ page, context }) => {
    await seedUser(context, page)

    const sidebar = page.locator('[role="navigation"]')
    await expect(sidebar).toBeVisible()
    await expect(sidebar.getByText('Dashboard')).toBeVisible()
    await expect(sidebar.getByText('Content')).toBeVisible()
  })

  test('navigates to content page via sidebar', async ({ page, context }) => {
    await seedUser(context, page)

    await page.getByText('Content').click()
    await page.waitForURL('**/content')
    await expect(page).toHaveURL(/\/content/)
  })
})
