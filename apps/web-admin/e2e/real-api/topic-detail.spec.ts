import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

const TOPIC_ID = '30000000-0000-0000-0000-000000000041'
const TOPIC_NAME = 'CD Quadratic Equations'

test.describe('Topic Detail Page — Real API', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
  })

  test('page renders topic name heading', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: TOPIC_NAME })).toBeVisible()
  })

  test('shows back to topics button', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('button', { name: 'Back to Topics' }),
    ).toBeVisible()
  })

  test('renders Topic Health Snapshot section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Topic Health Snapshot')).toBeVisible()
  })

  test('renders health metric cards', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Recall Strength')).toBeVisible()
    await expect(page.getByText('Practice Accuracy')).toBeVisible()
    await expect(page.getByText('Drop-off Indicator')).toBeVisible()
    await expect(page.getByText('Engagement Trend')).toBeVisible()
  })

  test('renders Learning Issues Detected section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Learning Issues Detected')).toBeVisible()
  })

  test('renders Content Components section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Content Components')).toBeVisible()
  })

  test('renders Quick Actions section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Quick Actions')).toBeVisible()
  })

  test('renders Performance Trends section when data exists', async ({
    page,
  }) => {
    await page.goto(`/content/topic/${TOPIC_ID}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Performance Trends')).toBeVisible()
  })

  test('no hydration mismatch warnings', async ({ page }) => {
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('hydration')) {
        warnings.push(msg.text())
      }
    })

    await page.goto(`/content/topic/${TOPIC_ID}`)
    await page.waitForLoadState('networkidle')

    expect(warnings).toHaveLength(0)
  })
})
