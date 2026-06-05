import { expect, type Page, test } from '@playwright/test'

async function setupAuth(page: Page) {
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
          permissions: ['VIEW_ANALYTICS'],
          expires_in: 3600,
        },
      }),
    })
  })
}

test.describe('Dashboard — Loading & Error States', () => {
  test('shows skeleton while insights load', async ({ page }) => {
    await setupAuth(page)

    // Delay insights response to ensure skeleton is visible
    await page.route('**/api/v1/admin/insights', async (route) => {
      await new Promise((r) => setTimeout(r, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          time_window: { start: '', end: '' },
          insights: [],
          summary: {
            total: 0,
            filtered_item: null,
            filtered_item_count: 0,
            danger: 0,
            success: 0,
            neutral: 0,
            warning: 0,
            info: 0,
          },
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            filtered_total: 0,
            total_pages: 0,
          },
        }),
      })
    })
    await page.route('**/api/v1/admin/insights/topics', async (route) => {
      await new Promise((r) => setTimeout(r, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          topics: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            filtered_total: 0,
            total_pages: 0,
          },
        }),
      })
    })
    await page.route('**/api/v1/live/classes/upcoming', async (route) => {
      await new Promise((r) => setTimeout(r, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/dashboard')

    // Skeleton should be visible during loading
    await expect(page.locator('.animate-pulse').first()).toBeVisible({
      timeout: 300,
    })
  })

  test('shows error state and retries on insights failure', async ({
    page,
  }) => {
    await setupAuth(page)

    await page.route('**/api/v1/admin/insights', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })
    await page.route('**/api/v1/admin/insights/topics', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })
    await page.route('**/api/v1/live/classes/upcoming', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Each module should show its error state
    await expect(page.getByText('Something went wrong').first()).toBeVisible()
  })

  test('recovers after retry on failed module', async ({ page }) => {
    await setupAuth(page)

    let insightsFailed = true
    await page.route('**/api/v1/admin/insights', async (route) => {
      if (insightsFailed) {
        insightsFailed = false
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Error' }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            time_window: { start: '', end: '' },
            insights: [
              {
                id: '1',
                insight_type: 'quiz_review_pending',
                severity: 'danger',
                title: 'Quizzes Pending Review',
                description: '5 quizzes need your attention',
                metadata: {},
                detected_at: '2025-01-15T10:00:00Z',
              },
            ],
            summary: {
              total: 1,
              filtered_item: null,
              filtered_item_count: 0,
              danger: 1,
              success: 0,
              neutral: 0,
              warning: 0,
              info: 0,
            },
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              filtered_total: 1,
              total_pages: 1,
            },
          }),
        })
      }
    })
    await page.route('**/api/v1/admin/insights/topics', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          topics: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            filtered_total: 0,
            total_pages: 0,
          },
        }),
      })
    })
    await page.route('**/api/v1/live/classes/upcoming', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Click retry on the error module
    await page.getByTestId('retry-button').first().click()

    // After retry, the module should show data
    await expect(page.getByText('Quizzes Pending Review')).toBeVisible({
      timeout: 5000,
    })
  })
})
