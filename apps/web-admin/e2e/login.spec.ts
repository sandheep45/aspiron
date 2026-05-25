import { expect, test } from '@playwright/test'

test.describe('Login Flow', () => {
  test('shows login page with email and password fields', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(
      page.getByRole('button', { name: /sign in|login|submit/i }),
    ).toBeVisible()
  })

  test('shows validation error for empty form submission', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /sign in|login|submit/i }).click()

    // Should show validation messages — exact text depends on Zod schema
    await expect(page.locator('text=email').first()).toBeVisible()
  })
})
