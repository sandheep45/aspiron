import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

test.describe('Subjects Page (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
  })

  test('subjects page sections are visible', async ({ page }) => {
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Total Subjects')).toBeVisible()
    await expect(page.getByText('Subject Name')).toBeVisible()
    await expect(page.getByText('Subject Signals')).toBeVisible()
  })

  test('shows metric values from seeded data', async ({ page }) => {
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
    // The CD seed creates 1 subject with 3 topics
    await expect(page.getByText('1', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Subject Signals')).toBeVisible()
  })

  test('no horizontal scroll at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5)
  })

  test('no hydration mismatch warnings', async ({ page, context }) => {
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('hydration')) {
        warnings.push(msg.text())
      }
    })
    await loginAsCDAdmin(page, context)
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
    expect(warnings).toHaveLength(0)
  })

  test('SSR content present in HTML', async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
    const html = await page.content()
    expect(html).toContain('Subjects')
  })
})
