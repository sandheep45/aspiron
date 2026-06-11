import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

const TOPIC_ID = '30000000-0000-0000-0000-000000000041'
const _TOPIC_NAME = 'CD Quadratic Equations'

test.describe('Practice & Tests Page — Real API', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
  })

  test('page renders heading', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/practice-tests`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('heading', { name: 'Practice & Tests' }),
    ).toBeVisible()
  })

  test('shows back to topic detail button', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/practice-tests`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Back to Topic Detail')).toBeVisible()
  })

  test('renders Practice Overview section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/practice-tests`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Practice Overview')).toBeVisible()
  })

  test('renders Practice Questions section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/practice-tests`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Practice Questions')).toBeVisible()
  })

  test('renders Topic Tests section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/practice-tests`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Topic Tests')).toBeVisible()
  })

  test('renders Quality Signals section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/practice-tests`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Quality Signals & Insights')).toBeVisible()
  })

  test('renders Quick Actions section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/practice-tests`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Quick Actions')).toBeVisible()
  })

  test('renders overview metric cards', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/practice-tests`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Total Practice Questions')).toBeVisible()
    await expect(page.getByText('Total Topic Tests')).toBeVisible()
  })

  test('renders Add Question button', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/practice-tests`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Add Question')).toBeVisible()
  })

  test('no hydration mismatch warnings', async ({ page }) => {
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('hydration')) {
        warnings.push(msg.text())
      }
    })

    await page.goto(`/content/topic/${TOPIC_ID}/practice-tests`)
    await page.waitForLoadState('networkidle')

    expect(warnings).toHaveLength(0)
  })
})
