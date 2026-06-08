import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

const SUBJECT_ID = '30000000-0000-0000-0000-000000000020'

test.describe('Chapters Page — Real API', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
  })

  test('chapters page sections visible', async ({ page }) => {
    await page.goto(`/content/subjects/${SUBJECT_ID}/chapters`)
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('heading', { name: 'CD Mathematics' }),
    ).toBeVisible()
    await expect(page.getByText('Total Chapters')).toBeVisible()
    await expect(page.getByText('All Chapters')).toBeVisible()
    await expect(page.getByText('Quick Insights')).toBeVisible()
  })

  test('shows chapter rows with names', async ({ page }) => {
    await page.goto(`/content/subjects/${SUBJECT_ID}/chapters`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('cell', { name: 'CD Algebra' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'CD Geometry' })).toBeVisible()
    await expect(
      page.getByRole('cell', { name: 'CD Trigonometry' }),
    ).toBeVisible()
  })

  test('shows metric values from seed', async ({ page }) => {
    await page.goto(`/content/subjects/${SUBJECT_ID}/chapters`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Total Chapters')).toBeVisible()
    const chapterCountElements = page.locator('text=3')
    await expect(chapterCountElements.first()).toBeVisible()
  })

  test('no hydration mismatch warnings', async ({ page }) => {
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('hydration')) {
        warnings.push(msg.text())
      }
    })

    await page.goto(`/content/subjects/${SUBJECT_ID}/chapters`)
    await page.waitForLoadState('networkidle')

    expect(warnings).toHaveLength(0)
  })
})
