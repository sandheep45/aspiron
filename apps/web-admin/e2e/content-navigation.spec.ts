import { expect, test } from '@playwright/test'

test.describe('Content Page Navigation', () => {
  test('shows login page for unauthenticated content access', async ({
    page,
  }) => {
    await page.goto('/content')
    await page.waitForURL('/auth')
    expect(page.url()).toContain('/auth')
  })
})
