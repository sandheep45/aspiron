import { expect, type Page, test } from '@playwright/test'

async function setupAuth(page: Page) {
  await page.context().addCookies([
    {
      name: 'jwt_refresh',
      value: 'mock-refresh-token',
      domain: 'localhost',
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

async function setupDashboardMocks(page: Page) {
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
            metadata: {},
            detected_at: '2025-01-15T10:00:00Z',
          },
          {
            id: '2',
            insight_type: 'low_attendance',
            severity: 'warning',
            title: 'Low Attendance',
            description: 'Class attendance dropped to 60%',
            metadata: {},
            detected_at: '2025-01-15T10:00:00Z',
          },
          {
            id: '3',
            insight_type: 'low_engagement',
            severity: 'info',
            title: 'Low Engagement',
            description: 'Students not completing assignments',
            metadata: {},
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
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          filtered_total: 2,
          total_pages: 1,
        },
      }),
    })
  })

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

test.describe('Dashboard — Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await setupDashboardMocks(page)
  })

  test('sections stack vertically at 375px width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const h2s = page.locator('h2')
    const headings = await h2s.allTextContents()
    expect(headings.filter((h) => h.length > 0).length).toBeGreaterThanOrEqual(
      4,
    )

    // No horizontal scrollbar should appear
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5)
  })

  test('class cards display in single column at mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const cards = page.locator('[data-testid="class-card"]')
    const count = await cards.count()
    expect(count).toBe(2)

    // Verify cards are visually in a column layout
    const firstCardBox = await cards.nth(0).boundingBox()
    const secondCardBox = await cards.nth(1).boundingBox()
    if (firstCardBox && secondCardBox) {
      expect(secondCardBox.y).toBeGreaterThan(
        firstCardBox.y + firstCardBox.height,
      )
    }
  })

  test('sidebar toggle visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const toggle = page.locator('[data-slot="sidebar-trigger"]')
    await expect(toggle).toBeVisible()
  })
})
