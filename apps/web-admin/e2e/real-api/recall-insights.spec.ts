import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

const TOPIC_ID = '30000000-0000-0000-0000-000000000041'

test.describe('Recall Insights Page — Real API', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
  })

  test('page renders heading', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('heading', { name: 'Recall Insights' }),
    ).toBeVisible()
  })

  test('shows back to topic detail button', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Back to Topic Detail')).toBeVisible()
  })

  test('renders MCQ Recall Performance section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('MCQ Recall Performance')).toBeVisible()
  })

  test('renders Free Recall Analysis section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Free Recall Analysis')).toBeVisible()
  })

  test('renders Memory Gap Map section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Memory Gap Map')).toBeVisible()
  })

  test('renders Suggested Actions section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Suggested Actions')).toBeVisible()
  })

  test('renders overview metric cards', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Overall MCQ Recall Accuracy')).toBeVisible()
    await expect(page.getByText('Total Questions Attempted')).toBeVisible()
  })

  test('no hydration mismatch warnings', async ({ page }) => {
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('hydration')) {
        warnings.push(msg.text())
      }
    })

    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')

    expect(warnings).toHaveLength(0)
  })
})
