import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

const SUBJECT_ID = '30000000-0000-0000-0000-000000000020'
const CHAPTER_ID = '30000000-0000-0000-0000-000000000030'

test.describe('Topics Page — Real API', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
  })

  test('topics page sections visible', async ({ page }) => {
    await page.goto(
      `/content/subjects/${SUBJECT_ID}/chapters/${CHAPTER_ID}/topics`,
    )
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('heading', { name: 'CD Algebra' }),
    ).toBeVisible()
    await expect(page.getByText('Total Topics')).toBeVisible()
    await expect(page.getByText('All Topics')).toBeVisible()
    await expect(page.getByText('Quick Pattern Insights')).toBeVisible()
  })

  test('shows topic rows with names', async ({ page }) => {
    await page.goto(
      `/content/subjects/${SUBJECT_ID}/chapters/${CHAPTER_ID}/topics`,
    )
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('cell', { name: 'CD Quadratic Equations' }),
    ).toBeVisible()
    await expect(
      page.getByRole('cell', { name: 'CD Linear Algebra' }),
    ).toBeVisible()
  })

  test('shows metric values from seed', async ({ page }) => {
    await page.goto(
      `/content/subjects/${SUBJECT_ID}/chapters/${CHAPTER_ID}/topics`,
    )
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Total Topics')).toBeVisible()
    const topicCountElements = page.locator('text=3')
    await expect(topicCountElements.first()).toBeVisible()
  })

  test('no hydration mismatch warnings', async ({ page }) => {
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('hydration')) {
        warnings.push(msg.text())
      }
    })

    await page.goto(
      `/content/subjects/${SUBJECT_ID}/chapters/${CHAPTER_ID}/topics`,
    )
    await page.waitForLoadState('networkidle')

    expect(warnings).toHaveLength(0)
  })
})
