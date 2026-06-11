import { expect, type Page, test } from '@playwright/test'

async function setupAuthenticatedPracticeTests(page: Page) {
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

  await page.route('**/api/v1/topics/:topicId', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-topic',
        name: 'Quadratic Equations',
        subject_id: 'subj-1',
        subject_name: 'Mathematics',
        chapter_id: 'chap-1',
        chapter_name: 'Algebra',
        description: 'Topic for testing',
        status: 'published',
      }),
    })
  })

  await page.route(
    '**/api/v1/topics/:topicId/practice/overview',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_questions: 15,
          average_accuracy: 72.5,
          total_tests: 3,
          last_test_conducted: '2 days ago',
        }),
      })
    },
  )

  await page.route(
    '**/api/v1/topics/:topicId/practice/questions',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'q-1',
              identifier: 'Q-0001',
              question: 'What is 2+2?',
              question_type: 'MCQ',
              difficulty: 'Easy',
              correct_rate: 95,
              status: 'Active',
            },
            {
              id: 'q-2',
              identifier: 'Q-0002',
              question: 'Solve for x: x² - 4 = 0',
              question_type: 'Numerical',
              difficulty: 'Medium',
              correct_rate: 72,
              status: 'Active',
            },
            {
              id: 'q-3',
              identifier: 'Q-0003',
              question: 'Integrate sin(x) dx',
              question_type: 'MCQ',
              difficulty: 'Hard',
              correct_rate: 45,
              status: 'Draft',
            },
          ],
          total: 3,
          page: 1,
          limit: 10,
          total_pages: 1,
        }),
      })
    },
  )

  await page.route(
    '**/api/v1/topics/:topicId/practice/tests',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 't-1',
            title: 'Quadratic Equations Assessment',
            status: 'Published',
            questions_count: 10,
            difficulty_mix: 'Balanced',
            average_score: 72.5,
            attempts: 15,
          },
          {
            id: 't-2',
            title: 'Algebra Fundamentals',
            status: 'Draft',
            questions_count: 5,
            difficulty_mix: 'Easy',
            average_score: null,
            attempts: 0,
          },
        ]),
      })
    },
  )

  await page.route(
    '**/api/v1/topics/:topicId/practice/signals',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'high-accuracy',
            message: 'Students are performing well with high accuracy',
            signal_type: 'positive',
          },
          {
            id: 'moderate-engagement',
            message: 'Engagement is moderate',
            signal_type: 'warning',
          },
          {
            id: 'low-coverage',
            message: 'Topic coverage is below expected threshold',
            signal_type: 'negative',
          },
          {
            id: 'application-based',
            message: 'Include more application-based questions',
            signal_type: 'info',
          },
        ]),
      })
    },
  )

  await page.route(
    '**/api/v1/topics/:topicId/practice/analytics',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          average_score_trend: [
            { date: '2026-06-01', value: 65.0 },
            { date: '2026-06-08', value: 72.0 },
            { date: '2026-06-15', value: 78.0 },
          ],
          attempts_trend: [
            { date: '2026-06-01', value: 5 },
            { date: '2026-06-08', value: 8 },
            { date: '2026-06-15', value: 12 },
          ],
          difficulty_distribution: [
            { difficulty: 'Easy', count: 3, percentage: 30.0 },
            { difficulty: 'Medium', count: 5, percentage: 50.0 },
            { difficulty: 'Hard', count: 2, percentage: 20.0 },
          ],
          question_performance: [
            {
              question_id: 'q-0001',
              question: 'What is 2+2?',
              correct_rate: 85.0,
              attempts: 20,
            },
            {
              question_id: 'q-0002',
              question: 'Solve for x?',
              correct_rate: 62.0,
              attempts: 18,
            },
          ],
        }),
      })
    },
  )
}

test.describe('Practice & Tests Page — Section Presence', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPracticeTests(page)
  })

  test('renders page heading', async ({ page }) => {
    await page.goto('/content/topic/test-topic/practice-tests')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('heading', { name: 'Practice & Tests' }),
    ).toBeVisible()
  })

  test('renders description text', async ({ page }) => {
    await page.goto('/content/topic/test-topic/practice-tests')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText(
        'Manage practice questions and topic-level tests for quality and coverage',
      ),
    ).toBeVisible()
  })

  test('renders all 6 section headers', async ({ page }) => {
    await page.goto('/content/topic/test-topic/practice-tests')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Practice Overview')).toBeVisible()
    await expect(page.getByText('Practice Questions')).toBeVisible()
    await expect(page.getByText('Topic Tests')).toBeVisible()
    await expect(page.getByText('Quality Signals & Insights')).toBeVisible()
    await expect(page.getByText('Quick Actions')).toBeVisible()
    await expect(page.getByText('Test Performance Analytics')).toBeVisible()
  })

  test('renders overview metric values', async ({ page }) => {
    await page.goto('/content/topic/test-topic/practice-tests')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Total Practice Questions')).toBeVisible()
    await expect(page.getByText('Average Practice Accuracy')).toBeVisible()
    await expect(page.getByText('Total Topic Tests')).toBeVisible()
    await expect(page.getByText('Last Test Conducted')).toBeVisible()
  })

  test('renders question table headers', async ({ page }) => {
    await page.goto('/content/topic/test-topic/practice-tests')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Identifier')).toBeVisible()
    await expect(page.getByText('Correct Rate')).toBeVisible()
  })

  test('renders topic test cards', async ({ page }) => {
    await page.goto('/content/topic/test-topic/practice-tests')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Quadratic Equations Assessment')).toBeVisible()
    await expect(page.getByText('Algebra Fundamentals')).toBeVisible()
  })

  test('renders quality signals', async ({ page }) => {
    await page.goto('/content/topic/test-topic/practice-tests')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText('Students are performing well with high accuracy'),
    ).toBeVisible()
  })

  test('renders quick action buttons', async ({ page }) => {
    await page.goto('/content/topic/test-topic/practice-tests')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Preview As Student')).toBeVisible()
    await expect(page.getByText('Generate More Questions')).toBeVisible()
    await expect(page.getByText('Export Question Bank')).toBeVisible()
  })

  test('renders Add Question button', async ({ page }) => {
    await page.goto('/content/topic/test-topic/practice-tests')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Add Question')).toBeVisible()
  })

  test('renders back button', async ({ page }) => {
    await page.goto('/content/topic/test-topic/practice-tests')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Back to Topic Detail')).toBeVisible()
  })

  test('no horizontal scrollbar', async ({ page }) => {
    await page.goto('/content/topic/test-topic/practice-tests')
    await page.waitForLoadState('networkidle')
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5)
  })
})

test.describe('Practice & Tests Page — Loading & Error States', () => {
  test('shows skeleton while overview loads', async ({ page }) => {
    await setupAuthenticatedPracticeTests(page)

    await page.route(
      '**/api/v1/topics/:topicId/practice/overview',
      async (route) => {
        await new Promise((r) => setTimeout(r, 500))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            total_questions: 0,
            average_accuracy: 0,
            total_tests: 0,
            last_test_conducted: null,
          }),
        })
      },
    )

    await page.goto('/content/topic/test-topic/practice-tests')
    await expect(page.locator('.animate-pulse').first()).toBeVisible({
      timeout: 300,
    })
  })

  test('shows retry on overview error', async ({ page }) => {
    await setupAuthenticatedPracticeTests(page)

    await page.route(
      '**/api/v1/topics/:topicId/practice/overview',
      async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        })
      },
    )

    await page.goto('/content/topic/test-topic/practice-tests')
    await expect(page.getByText(/failed|error/i)).toBeVisible({
      timeout: 30000,
    })
  })
})
