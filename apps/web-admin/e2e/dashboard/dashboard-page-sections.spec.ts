import { expect, type Page, test } from '@playwright/test'

async function setupAuthenticatedDashboard(page: Page) {
  // Set auth cookie so SSR context considers user authenticated
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

  // Mock auth/me endpoint
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

  // Mock insights endpoint
  await page.route('**/api/v1/admin/insights', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        time_window: {
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-31T00:00:00Z',
        },
        insights: [
          {
            id: '1',
            insight_type: 'quiz_review_pending',
            severity: 'danger',
            title: 'Quizzes Pending Review',
            description: '5 quizzes need your attention',
            metadata: { quiz_id: 'quiz-1', pending_count: 5 },
            detected_at: '2025-01-15T10:00:00Z',
          },
          {
            id: '2',
            insight_type: 'low_attendance',
            severity: 'warning',
            title: 'Low Attendance',
            description: 'Class attendance dropped to 60%',
            metadata: { session_id: 'session-1', attendee_count: 20 },
            detected_at: '2025-01-15T10:00:00Z',
          },
          {
            id: '3',
            insight_type: 'low_engagement',
            severity: 'info',
            title: 'Low Engagement',
            description: 'Students not completing assignments',
            metadata: { topic_id: 'topic-1', active_users: 15 },
            detected_at: '2025-01-15T10:00:00Z',
          },
        ],
        summary: {
          total: 3,
          filtered_item: null,
          filtered_item_count: 0,
          danger: 1,
          success: 0,
          neutral: 0,
          warning: 1,
          info: 1,
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          filtered_total: 3,
          total_pages: 1,
        },
      }),
    })
  })

  // Mock topic performance endpoint
  await page.route('**/api/v1/admin/insights/topics', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        topics: [
          {
            topic_id: 't1',
            subject_id: 's1',
            topic_name: 'Quadratic Equations',
            chapter_name: 'Algebra',
            subject_name: 'Mathematics',
            recall_strength_mcq: 0.65,
            recall_strength_reflection: 0.55,
            practice_accuracy: 0.48,
            students_affected: 18,
            total_students: 30,
          },
          {
            topic_id: 't2',
            subject_id: 's2',
            topic_name: 'Photosynthesis',
            chapter_name: 'Plant Biology',
            subject_name: 'Biology',
            recall_strength_mcq: 0.72,
            recall_strength_reflection: 0.6,
            practice_accuracy: 0.52,
            students_affected: 14,
            total_students: 25,
          },
          {
            topic_id: 't3',
            subject_id: 's3',
            topic_name: "Newton's Laws",
            chapter_name: 'Mechanics',
            subject_name: 'Physics',
            recall_strength_mcq: 0.45,
            recall_strength_reflection: 0.4,
            practice_accuracy: 0.38,
            students_affected: 22,
            total_students: 28,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          filtered_total: 3,
          total_pages: 1,
        },
      }),
    })
  })

  // Mock upcoming classes endpoint
  await page.route('**/api/v1/live/classes/upcoming', async (route) => {
    const now = new Date()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'c1',
          topic_id: 't1',
          scheduled_at: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
          duration_min: 45,
          provider: 'Quadratic Equations Review',
          join_url: 'https://zoom.us/j/101',
        },
        {
          id: 'c2',
          topic_id: 't2',
          scheduled_at: new Date(
            now.getTime() + 2 * 60 * 60 * 1000,
          ).toISOString(),
          duration_min: 60,
          provider: 'Photosynthesis Deep Dive',
          join_url: 'https://zoom.us/j/102',
        },
      ]),
    })
  })
}

test.describe('Dashboard — Section Presence & Order', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedDashboard(page)
  })

  test('renders all 4 dashboard sections', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('System Health')).toBeVisible()
    await expect(page.getByText('Action Required')).toBeVisible()
    await expect(page.getByText('Student Pain Points')).toBeVisible()
    await expect(page.getByText('Upcoming Classes')).toBeVisible()

    // No horizontal scrollbar
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5)
  })

  test('renders correct visual hierarchy', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const headings = page.locator('h2')
    await expect(headings.nth(0)).toHaveText('System Health')
    await expect(headings.nth(1)).toHaveText('Action Required')
    await expect(headings.nth(2)).toHaveText('Student Pain Points')
    await expect(headings.nth(3)).toHaveText('Upcoming Classes')
  })

  test('header and action required are visible above the fold', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('System Health')).toBeVisible()
    await expect(page.getByText('Action Required')).toBeVisible()
    await expect(page.getByText('Quizzes Pending Review')).toBeVisible()
  })

  test('dashboard sections have data-dashboard-section attributes', async ({
    page,
  }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(
      page.locator('[data-dashboard-section="system-health"]'),
    ).toBeVisible()
    await expect(
      page.locator('[data-dashboard-section="action-required"]'),
    ).toBeVisible()
    await expect(
      page.locator('[data-dashboard-section="pain-points"]'),
    ).toBeVisible()
    await expect(
      page.locator('[data-dashboard-section="upcoming-classes"]'),
    ).toBeVisible()
  })
})
