import { expect, type Page, test } from '@playwright/test'

async function setupAuth(page: Page) {
  await page.context().addCookies([
    {
      name: 'jwt',
      value: 'mock-access-token',
      domain: 'local.aspiron.test',
      path: '/',
    },
    {
      name: 'jwt_refresh',
      value: 'mock-refresh-token',
      domain: 'local.aspiron.test',
      path: '/',
    },
  ])

  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: 'user-1',
            email: 'admin@aspiron.test',
            first_name: 'Admin',
            last_name: 'User',
            avatar_url: null,
          },
          roles: [{ id: 'role-1', name: 'Admin' }],
          permissions: ['VIEW_ANALYTICS'],
          expires_in: 3600,
        },
      }),
    })
  })
}

function buildCriticalIssuesData() {
  return {
    total_urgent: 2,
    issues: [
      {
        id: 'ci-1',
        topic: 'Quadratic Equations',
        description: 'Students struggle with quadratic formula application',
        severity: 'critical',
        students_affected: 18,
        action_label: 'View Topic',
      },
      {
        id: 'ci-2',
        topic: 'Photosynthesis',
        description: 'Students struggle with light-dependent reactions',
        severity: 'high',
        students_affected: 14,
        action_label: 'View Topic',
      },
    ],
  }
}

function buildPainPointsData(pageNum = 1, total = 25) {
  const items = Array.from({ length: 10 }, (_, i) => {
    const idx = (pageNum - 1) * 10 + i
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
  return {
    total,
    items,
  }
}

function buildPatternInsightsData() {
  return {
    insights: [
      {
        id: 'pi-1',
        title: 'Numerical-heavy topics show faster recall decay',
        metric: 'Affects 60% of struggling students',
      },
      {
        id: 'pi-2',
        title: 'Students skip spaced repetition on weak topics',
        metric: '45 students have incomplete recall sessions',
      },
      {
        id: 'pi-3',
        title: 'Concept gaps compound across related chapters',
        metric: '3/12 topics show cascading failures',
      },
      {
        id: 'pi-4',
        title: 'Passive learning without practice leads to 40% accuracy drop',
        metric: '52% average accuracy on first recall',
      },
    ],
  }
}

function buildTopicDetailData() {
  return {
    topic: 'Quadratic Equations',
    accuracy: 0.32,
    students_affected: 18,
    trend: 'degrading',
    common_mistakes: [
      'Incorrect application of quadratic formula',
      'Sign errors in discriminant calculation',
    ],
    weak_questions: [
      'Solve 2x² + 5x - 3 = 0',
      'Find roots of x² - 7x + 12 = 0',
    ],
    recommendations: [
      'Review quadratic formula derivation',
      'Practice discriminant analysis',
      'Complete remedial worksheet set 3',
    ],
  }
}

async function mockPainPointsApi(page: Page) {
  await page.route(
    '**/api/v1/admin/insights/pain-points/critical',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildCriticalIssuesData()),
      })
    },
  )

  await page.route(
    '**/api/v1/admin/insights/pain-points/insights',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildPatternInsightsData()),
      })
    },
  )

  await page.route(
    /\/api\/v1\/admin\/insights\/pain-points(\?.*)?$/,
    async (route) => {
      const url = new URL(route.request().url())
      const pageParam = Number(url.searchParams.get('page')) || 1
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildPainPointsData(pageParam)),
      })
    },
  )

  await page.route(
    /\/api\/v1\/admin\/insights\/pain-points\/(?!critical|insights)[^/?]+/,
    async (route) => {
      const url = new URL(route.request().url())
      const id = url.pathname.split('/').pop()
      if (id === 'unknown') {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            error: { code: 'NOT_FOUND', message: 'Topic not found' },
          }),
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildTopicDetailData()),
      })
    },
  )
}

test.describe('Pain Points Page — Unit MSW', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await mockPainPointsApi(page)
  })

  test('page loads all sections with data', async ({ page }) => {
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

  test('critical issues display severity indicators', async ({ page }) => {
    await page.goto('/pain-points')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Quadratic Equations')).toBeVisible()
    await expect(page.getByText('Photosynthesis')).toBeVisible()
    await expect(page.getByText('2 urgent')).toBeVisible()
    await expect(page.getByText('critical', { exact: true })).toBeVisible()
    await expect(page.getByText('high', { exact: true })).toBeVisible()
    await expect(page.getByText('18 students affected')).toBeVisible()
    await expect(page.getByText('14 students affected')).toBeVisible()
  })

  test('topic detail drawer opens and closes', async ({ page }) => {
    await page.goto('/pain-points')
    await page.waitForLoadState('networkidle')

    await page
      .getByRole('button', { name: /view topic/i })
      .first()
      .click()
    await expect(
      page.getByRole('heading', { name: /quadratic equations/i }),
    ).toBeVisible()
    await expect(page.getByText('32%')).toBeVisible()

    await page.getByRole('button', { name: /close/i }).click()
    await expect(
      page.getByRole('heading', { name: /quadratic equations/i }),
    ).not.toBeVisible()
  })

  test('pagination controls work', async ({ page }) => {
    await page.goto('/pain-points')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Topic 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Topic 10', { exact: true })).toBeVisible()

    expect(page.getByRole('button', { name: /previous/i })).toBeDisabled()
    const nextButton = page.getByRole('button', { name: /next/i })
    await expect(nextButton).toBeEnabled()

    await nextButton.click()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Topic 11')).toBeVisible()
    await expect(page.getByText('Topic 20')).toBeVisible()
  })

  test('empty state renders correctly', async ({ page }) => {
    await setupAuth(page)
    await page.route(
      '**/api/v1/admin/insights/pain-points/critical',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ total_urgent: 0, issues: [] }),
        })
      },
    )
    await page.route(
      '**/api/v1/admin/insights/pain-points/insights',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ insights: [] }),
        })
      },
    )
    await page.route(
      /\/api\/v1\/admin\/insights\/pain-points(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ total: 0, items: [] }),
        })
      },
    )
    await page.route(
      /\/api\/v1\/admin\/insights\/pain-points\/(?!critical|insights)[^/?]+/,
      async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            error: { code: 'NOT_FOUND', message: 'Topic not found' },
          }),
        })
      },
    )

    await page.goto('/pain-points')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('No Critical Issues')).toBeVisible()
    await expect(page.getByText('No pain points found')).toBeVisible()
    await expect(page.getByText('No patterns detected yet')).toBeVisible()
  })

  test('error state shows retry', async ({ page }) => {
    await setupAuth(page)
    await page.route(
      '**/api/v1/admin/insights/pain-points/critical',
      async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        })
      },
    )
    await page.route(
      /\/api\/v1\/admin\/insights\/pain-points(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildPainPointsData()),
        })
      },
    )
    await page.route(
      '**/api/v1/admin/insights/pain-points/insights',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildPatternInsightsData()),
        })
      },
    )

    await page.goto('/pain-points')

    // Wait for query to exhaust retries and show error state
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible({
      timeout: 15000,
    })
    await expect(
      page.getByText('Request failed with status code 500'),
    ).toBeVisible()
  })
})
