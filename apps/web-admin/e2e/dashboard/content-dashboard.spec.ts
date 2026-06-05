import { expect, type Page, test } from '@playwright/test'

async function setupAuthenticatedContentDashboard(page: Page) {
  await page.context().addCookies([
    {
      name: 'jwt_refresh',
      value: 'mock-refresh-token',
      domain: 'local.aspiron.test',
      path: '/',
    },
    {
      name: 'jwt',
      value: 'mock-access-token',
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
          permissions: ['VIEW_ANALYTICS', 'MANAGE_CONTENT'],
          expires_in: 3600,
        },
      }),
    })
  })

  await page.route('**/api/v1/content/dashboard/summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        subjects_covered: 4,
        topics_published: 147,
        topics_in_draft: 23,
        topics_flagged: 12,
      }),
    })
  })

  await page.route('**/api/v1/content/dashboard/attention', async (route) => {
    const url = new URL(route.request().url())
    const pageParam = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 5
    const items = [
      {
        id: 'a1',
        topic: 'Electrostatics',
        issue: 'Low Recall',
        reason: 'Students showing recall decline',
        students_affected: 23,
      },
      {
        id: 'a2',
        topic: 'Thermodynamics',
        issue: 'Poor Accuracy',
        reason: 'Accuracy below 60% threshold',
        students_affected: 18,
      },
      {
        id: 'a3',
        topic: 'Organic Chemistry',
        issue: 'High Drop-off',
        reason: 'More than 40% students disengaged',
        students_affected: 30,
      },
      {
        id: 'a4',
        topic: 'Calculus',
        issue: 'Weak Fundamentals',
        reason: 'Conceptual gaps detected',
        students_affected: 15,
      },
    ]
    const total = items.length
    const start = (pageParam - 1) * limit
    const paginated = items.slice(start, start + limit)
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ total, items: paginated }),
    })
  })

  await page.route('**/api/v1/content/dashboard/subjects', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 's1',
          name: 'Physics',
          completion: 87,
          total_topics: 68,
          published_topics: 59,
          draft_topics: 9,
        },
        {
          id: 's2',
          name: 'Chemistry',
          completion: 72,
          total_topics: 54,
          published_topics: 39,
          draft_topics: 15,
        },
        {
          id: 's3',
          name: 'Mathematics',
          completion: 64,
          total_topics: 82,
          published_topics: 53,
          draft_topics: 29,
        },
      ]),
    })
  })

  await page.route('**/api/v1/content/dashboard/signals', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        highest_recall: [
          { topic: 'Modern Physics', score: 84, drop: null },
          { topic: 'Chemical Bonding', score: 79, drop: null },
          { topic: 'Calculus - Limits', score: 76, drop: null },
        ],
        fastest_decay: [
          { topic: 'Electrostatics', score: null, drop: 28 },
          { topic: 'Thermodynamics', score: null, drop: 31 },
          { topic: 'Organic Chemistry', score: null, drop: 42 },
        ],
      }),
    })
  })
}

test.describe('Content Dashboard — Section Presence', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedContentDashboard(page)
  })

  test('renders all 4 section headers', async ({ page }) => {
    await page.goto('/content')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Content Health Snapshot')).toBeVisible()
    await expect(page.getByText('Content Needing Attention')).toBeVisible()
    await expect(page.getByText('Subject Entry Points')).toBeVisible()
    await expect(page.getByText('Content Quality Signals')).toBeVisible()

    // No horizontal scrollbar
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5)
  })

  test('renders metric card values', async ({ page }) => {
    await page.goto('/content')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Subjects Covered')).toBeVisible()
    await expect(page.getByText('Topics Published')).toBeVisible()
    await expect(page.getByText('4', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('147', { exact: true }).first()).toBeVisible()
  })

  test('renders attention table rows', async ({ page }) => {
    await page.goto('/content')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('table')).toBeVisible()
    const rows = page.locator('table tbody tr')
    await expect(rows).not.toHaveCount(0)
  })

  test('renders subject progress cards', async ({ page }) => {
    await page.goto('/content')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Physics' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Chemistry' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Mathematics' }),
    ).toBeVisible()
  })

  test('renders quality signal cards', async ({ page }) => {
    await page.goto('/content')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Topics With Highest Recall')).toBeVisible()
    await expect(
      page.getByText('Topics With Fastest Recall Decay'),
    ).toBeVisible()
  })
})

test.describe('Content Dashboard — Loading & Error States', () => {
  test('shows skeleton while content loads', async ({ page }) => {
    await setupAuthenticatedContentDashboard(page)

    await page.route('**/api/v1/content/dashboard/summary', async (route) => {
      await new Promise((r) => setTimeout(r, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          subjects_covered: 0,
          topics_published: 0,
          topics_in_draft: 0,
          topics_flagged: 0,
        }),
      })
    })

    await page.goto('/content')
    await expect(page.locator('.animate-pulse').first()).toBeVisible({
      timeout: 300,
    })
  })

  test('shows error state when summary fails', async ({ page }) => {
    await setupAuthenticatedContentDashboard(page)

    // Always return 500 (handles initial query + 3 retries)
    await page.route('**/api/v1/content/dashboard/summary', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    })

    await page.goto('/content')

    // Wait for error text after all retries exhausted (exponential backoff ~7s)
    await expect(page.getByText(/failed|error|status code 500/i)).toBeVisible({
      timeout: 30000,
    })
  })
})

test.describe('Content Dashboard — Mobile', () => {
  test('sections stack vertically at 375px width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await setupAuthenticatedContentDashboard(page)
    await page.goto('/content')
    await page.waitForLoadState('networkidle')
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5)
  })
})
