import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

test.describe('Content Dashboard (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
  })

  test('dashboard sections are visible', async ({ page }) => {
    await page.goto('/content')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Content Health Snapshot')).toBeVisible()
    await expect(page.getByText('Content Needing Attention')).toBeVisible()
    await expect(page.getByText('Subject Entry Points')).toBeVisible()
    await expect(page.getByText('Content Quality Signals')).toBeVisible()
  })

  test('shows metric values from seeded data', async ({ page }) => {
    await page.goto('/content')
    await page.waitForLoadState('networkidle')
    // 1 subject (CD Mathematics), 2 topics with quizzes
    await expect(page.getByText('Subjects Covered')).toBeVisible()
    await expect(page.getByText('1', { exact: true }).first()).toBeVisible()
  })

  test('no hydration mismatch warnings', async ({ page, context }) => {
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('hydration')) {
        warnings.push(msg.text())
      }
    })
    await loginAsCDAdmin(page, context)
    await page.goto('/content')
    await page.waitForLoadState('networkidle')
    expect(warnings).toHaveLength(0)
  })

  test('SSR content present in HTML', async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
    await page.goto('/content')
    await page.waitForLoadState('networkidle')
    const html = await page.content()
    expect(html).toContain('Content Health Snapshot')
  })
})
