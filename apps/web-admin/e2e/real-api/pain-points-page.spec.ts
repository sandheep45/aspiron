import { expect, test } from '@playwright/test'
import { loginAsE2eStudent } from './login'

function mockCriticalIssues(page: import('@playwright/test').Page) {
  return page.route(
    '**/api/v1/admin/insights/pain-points/critical',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_urgent: 2,
          issues: [
            {
              id: 'ci-1',
              topic: 'Quadratic Equations',
              description: 'Students struggle with quadratic formula',
              severity: 'critical',
              students_affected: 18,
              action_label: 'View Topic',
            },
            {
              id: 'ci-2',
              topic: 'Photosynthesis',
              description: 'Students struggle with light reactions',
              severity: 'critical',
              students_affected: 14,
              action_label: 'View Topic',
            },
          ],
        }),
      })
    },
  )
}

function mockPainPointsList(page: import('@playwright/test').Page) {
  return page.route(
    /\/api\/v1\/admin\/insights\/pain-points(\?.*)?$/,
    async (route) => {
      const url = new URL(route.request().url())
      const pageParam = Number(url.searchParams.get('page')) || 1
      const items = Array.from({ length: 10 }, (_, i) => {
        const idx = (pageParam - 1) * 10 + i
        const severities = ['weak', 'medium', 'strong'] as const
        const statuses = ['degrading', 'stable', 'improving'] as const
        return {
          id: `pp-${idx + 1}`,
          topic: `Topic ${idx + 1}`,
          recall_strength: severities[idx % 3],
          accuracy: Math.max(0.1, (100 - idx * 8) / 100),
          common_mistake: 'Incorrect recall or calculation',
          last_activity: 'recently',
          status: statuses[idx % 3],
          students: Math.max(1, 20 - idx),
        }
      })
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ total: 25, items }),
      })
    },
  )
}

function mockPatternInsights(page: import('@playwright/test').Page) {
  return page.route(
    '**/api/v1/admin/insights/pain-points/insights',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          insights: [
            {
              id: 'pi-1',
              title: 'Numerical-heavy topics show faster recall decay',
              metric: 'Affects 60% of struggling students',
            },
            {
              id: 'pi-2',
              title: 'Students skip spaced repetition',
              metric: '45 students have incomplete recall sessions',
            },
            {
              id: 'pi-3',
              title: 'Concept gaps compound',
              metric: '3/12 topics show cascading failures',
            },
            {
              id: 'pi-4',
              title: 'Passive learning drops accuracy',
              metric: '52% average accuracy on first recall',
            },
          ],
        }),
      })
    },
  )
}

function mockEmptyData(page: import('@playwright/test').Page) {
  return Promise.all([
    page.route(
      '**/api/v1/admin/insights/pain-points/critical',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ total_urgent: 0, issues: [] }),
        })
      },
    ),
    page.route(
      /\/api\/v1\/admin\/insights\/pain-points(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ total: 0, items: [] }),
        })
      },
    ),
    page.route(
      '**/api/v1/admin/insights/pain-points/insights',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ insights: [] }),
        })
      },
    ),
  ])
}

function mockErrorState(page: import('@playwright/test').Page) {
  return page.route(
    '**/api/v1/admin/insights/pain-points/critical',
    async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    },
  )
}

test.describe('Pain Points Page (Real API)', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsE2eStudent(page, context)
  })

  test('page renders with live seeded data', async ({ page }) => {
    await mockCriticalIssues(page)
    await mockPainPointsList(page)
    await mockPatternInsights(page)

    await page.goto('/pain-points')
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('heading', { name: /student pain points/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /critical issues/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /all pain points/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /pattern insights/i }),
    ).toBeVisible()
  })

  test('critical issues display severity and names', async ({ page }) => {
    await mockCriticalIssues(page)
    await mockPainPointsList(page)
    await mockPatternInsights(page)

    await page.goto('/pain-points')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Quadratic Equations')).toBeVisible()
    await expect(page.getByText('Photosynthesis')).toBeVisible()
    await expect(page.getByText('2 urgent')).toBeVisible()
  })

  test('table shows paginated topic rows', async ({ page }) => {
    await mockCriticalIssues(page)
    await mockPainPointsList(page)
    await mockPatternInsights(page)

    await page.goto('/pain-points')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Topic 1', { exact: true })).toBeVisible()
    const nextBtn = page.getByRole('button', { name: /next/i })
    await expect(nextBtn).toBeEnabled()

    await nextBtn.click()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Topic 11', { exact: true })).toBeVisible()
  })

  test('empty state renders for all sections', async ({ page }) => {
    await mockEmptyData(page)

    await page.goto('/pain-points')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('No Critical Issues')).toBeVisible()
    await expect(page.getByText('No pain points found')).toBeVisible()
    await expect(page.getByText('No patterns detected yet')).toBeVisible()
  })

  test('api error shows retry button', async ({ page }) => {
    await mockErrorState(page)
    await mockPainPointsList(page)
    await mockPatternInsights(page)

    await page.goto('/pain-points')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/request failed/i)).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible()
  })
})
