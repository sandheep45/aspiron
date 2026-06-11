import { expect, type Page, test } from '@playwright/test'

const TOPIC_ID = '30000000-0000-0000-0000-000000000041'

async function setupAuthenticatedRecallInsights(page: Page) {
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

  await page.route('**/api/v1/topics/*/recall/overview', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        avg_recall_score: 72.5,
        completion_rate: 85.0,
        memory_decay: 'stable',
        last_recall_run: '2 hours ago',
      }),
    })
  })

  await page.route('**/api/v1/topics/*/recall/mcq', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        overall_accuracy: 72.5,
        total_questions_attempted: 12,
        difficulty_breakdown: [
          { difficulty: 'Easy', accuracy: 92.0, count: 4 },
          { difficulty: 'Medium', accuracy: 75.0, count: 5 },
          { difficulty: 'Hard', accuracy: 55.0, count: 3 },
        ],
        questions: [
          {
            question_number: 'Q-001',
            concept: "Gauss's Law Statement",
            difficulty: 'Easy',
            recall_accuracy: 100.0,
            attempts: 1,
          },
          {
            question_number: 'Q-002',
            concept: 'Flux Calculation',
            difficulty: 'Medium',
            recall_accuracy: 0.0,
            attempts: 1,
          },
        ],
      }),
    })
  })

  await page.route('**/api/v1/topics/*/recall/free-response', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        participation_rate: 60.0,
        ai_clarity_score: 72.5,
        average_response_length: 85,
        missing_concepts: [
          {
            concept: 'Mathematical derivation for spherical symmetry',
            percentage_missing: 62.0,
            ai_summary: 'Students consistently omit the derivation steps.',
          },
          {
            concept: 'Sign conventions for enclosed charge',
            percentage_missing: 48.0,
            ai_summary: 'Sign errors are common in flux problems.',
          },
          {
            concept: 'Real-world applications and examples',
            percentage_missing: 35.0,
            ai_summary: 'Students struggle to connect theory to practice.',
          },
        ],
      }),
    })
  })

  await page.route('**/api/v1/topics/*/recall/gaps', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            concept: "Gauss's Law Statement",
            recall_status: 'remembered',
            confidence: 85.0,
            correctness: 90.0,
          },
          {
            concept: 'Flux Calculation',
            recall_status: 'partial',
            confidence: 60.0,
            correctness: 50.0,
          },
          {
            concept: 'Spherical Symmetry',
            recall_status: 'forgotten',
            confidence: 30.0,
            correctness: 20.0,
            mismatch_alert: 'High Confidence, Low Accuracy',
          },
        ],
      }),
    })
  })

  await page.route('**/api/v1/topics/*/recall/actions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'spherical-symmetry',
          icon: 'alert-triangle',
          detected_issue:
            'Students struggle with spherical symmetry calculations',
          explanation: '62% of students missed mathematical derivation.',
          suggested_fix: 'Review derivation video at 7:20.',
          primary_cta: 'Review Video',
        },
        {
          id: 'hard-mcq-recall',
          icon: 'bar-chart',
          detected_issue:
            'Hard difficulty MCQs show significantly lower recall',
          explanation: 'Hard MCQs have 37% lower accuracy than easy ones.',
          suggested_fix: 'Add scaffolded practice for hard concepts.',
          primary_cta: 'Add Practice',
        },
      ]),
    })
  })

  await page.route('**/api/v1/topics/*/recall/trends', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        recall_trend: [
          { date: '2026-01-01', value: 85.0 },
          { date: '2026-01-08', value: 72.0 },
          { date: '2026-01-15', value: 58.0 },
        ],
        memory_decay_curve: [
          { date: '2026-01-01', value: 100.0 },
          { date: '2026-01-08', value: 86.0 },
          { date: '2026-01-15', value: 74.0 },
        ],
        recall_by_difficulty: [
          { date: '2026-01-01', value: 65.0 },
          { date: '2026-01-08', value: 62.0 },
        ],
        retention_distribution: [{ date: '2026-01-01', value: 40.0 }],
      }),
    })
  })
}

test.describe('Recall Insights Page — Section Presence', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedRecallInsights(page)
  })

  test('renders page heading', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('heading', { name: 'Recall Insights' }),
    ).toBeVisible()
  })

  test('renders description text', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText(
        'Understand how well students remember this topic over time',
      ),
    ).toBeVisible()
  })

  test('renders all section headers', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('MCQ Recall Performance')).toBeVisible()
    await expect(page.getByText('Free Recall Analysis')).toBeVisible()
    await expect(page.getByText('Memory Gap Map')).toBeVisible()
    await expect(page.getByText('Recall Trend Analytics')).toBeVisible()
    await expect(page.getByText('Suggested Actions')).toBeVisible()
  })

  test('renders MCQ overview metrics', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Overall MCQ Recall Accuracy')).toBeVisible()
    await expect(page.getByText('Total Questions Attempted')).toBeVisible()
  })

  test('renders difficulty cards', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('4 questions')).toBeVisible()
    await expect(page.getByText('5 questions')).toBeVisible()
    await expect(page.getByText('3 questions')).toBeVisible()
  })

  test('renders question performance table', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.locator('td').filter({ hasText: "Gauss's Law Statement" }).first(),
    ).toBeVisible()
    await expect(
      page.locator('td').filter({ hasText: 'Flux Calculation' }).first(),
    ).toBeVisible()
  })

  test('renders free recall section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Participation Rate')).toBeVisible()
    await expect(page.getByText('AI Clarity Score')).toBeVisible()
  })

  test('renders memory gap items', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Memory Gap Map')).toBeVisible()
  })

  test('renders suggested action cards', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText('Students struggle with spherical symmetry calculations'),
    ).toBeVisible()
    await expect(
      page.getByText('Hard difficulty MCQs show significantly lower recall'),
    ).toBeVisible()
  })

  test('renders back button', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Back to Topic Detail')).toBeVisible()
  })

  test('renders status badge', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Strong Recall')).toBeVisible()
  })

  test('no horizontal scrollbar', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5)
  })
})

test.describe('Recall Insights Page — Content Details', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedRecallInsights(page)
  })

  test('renders missing concept names and percentages', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText('Mathematical derivation for spherical symmetry'),
    ).toBeVisible()
    await expect(page.getByText('62% missing')).toBeVisible()
    await expect(
      page.getByText('Sign conventions for enclosed charge'),
    ).toBeVisible()
    await expect(page.getByText('48% missing')).toBeVisible()
  })

  test('renders memory gap mismatch alert', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('High Confidence, Low Accuracy')).toBeVisible()
  })

  test('renders trend chart titles', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Recall Trend Over Time')).toBeVisible()
    await expect(page.getByText('Memory Decay Curve')).toBeVisible()
    await expect(page.getByText('Recall By Difficulty')).toBeVisible()
    await expect(page.getByText('Student Retention Distribution')).toBeVisible()
  })

  test('renders suggested action CTA buttons', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('button', { name: 'Review Video' }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Add Practice' }),
    ).toBeVisible()
  })
})

test.describe('Recall Insights Page — Empty States', () => {
  async function setupEmptyRecallInsights(page: Page) {
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

    await page.route('**/api/v1/topics/*/recall/overview', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          avg_recall_score: null,
          completion_rate: null,
          memory_decay: null,
          last_recall_run: null,
        }),
      })
    })

    await page.route('**/api/v1/topics/*/recall/mcq', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(null),
      })
    })

    await page.route(
      '**/api/v1/topics/*/recall/free-response',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(null),
        })
      },
    )

    await page.route('**/api/v1/topics/*/recall/gaps', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      })
    })

    await page.route('**/api/v1/topics/*/recall/actions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.route('**/api/v1/topics/*/recall/trends', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
      })
    })
  }

  test.beforeEach(async ({ page }) => {
    await setupEmptyRecallInsights(page)
  })

  test('shows empty states for all sections', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('No MCQ recall data')).toBeVisible()
    await expect(page.getByText('No free recall data')).toBeVisible()
    await expect(page.getByText('No memory gap data')).toBeVisible()
    await expect(page.getByText('No actions suggested')).toBeVisible()
  })

  test('hides recall trend section when no data', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Recall Trend Analytics')).not.toBeVisible()
  })
})

test.describe('Recall Insights Page — Key Insight Card', () => {
  async function setupKeyInsightScenario(page: Page) {
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

    // Trigger: overviewAccuracy - mcqAccuracy > 20 (80 - 50 = 30)
    await page.route('**/api/v1/topics/*/recall/overview', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          avg_recall_score: 80.0,
          completion_rate: 90.0,
          memory_decay: 'stable',
          last_recall_run: '1 hour ago',
        }),
      })
    })

    await page.route('**/api/v1/topics/*/recall/mcq', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          overall_accuracy: 50.0,
          total_questions_attempted: 10,
          difficulty_breakdown: [],
          questions: [],
        }),
      })
    })

    // Minimal data for other sections
    await page.route(
      '**/api/v1/topics/*/recall/free-response',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            participation_rate: 0,
            ai_clarity_score: 0,
            average_response_length: 0,
            missing_concepts: [],
          }),
        })
      },
    )
    await page.route('**/api/v1/topics/*/recall/gaps', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      })
    })
    await page.route('**/api/v1/topics/*/recall/actions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })
    await page.route('**/api/v1/topics/*/recall/trends', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recall_trend: [],
          memory_decay_curve: [],
          recall_by_difficulty: [],
          retention_distribution: [],
        }),
      })
    })
  }

  test.beforeEach(async ({ page }) => {
    await setupKeyInsightScenario(page)
  })

  test('renders key insight when overview accuracy exceeds mcq by >20', async ({
    page,
  }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText(
        'MCQ recall accuracy is significantly lower than overall recall',
      ),
    ).toBeVisible()
  })
})

test.describe('Recall Insights Page — Loading & Error States', () => {
  test('shows skeleton while MCQ section loads', async ({ page }) => {
    await setupAuthenticatedRecallInsights(page)

    await page.route('**/api/v1/topics/*/recall/mcq', async (route) => {
      await new Promise((r) => setTimeout(r, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          overall_accuracy: 0,
          total_questions_attempted: 0,
          difficulty_breakdown: [],
          questions: [],
        }),
      })
    })

    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await expect(page.locator('.animate-pulse').first()).toBeVisible({
      timeout: 300,
    })
  })

  test('shows retry on MCQ section error', async ({ page }) => {
    await setupAuthenticatedRecallInsights(page)

    await page.route('**/api/v1/topics/*/recall/mcq', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    })

    await page.goto(`/content/topic/${TOPIC_ID}/recall-insights`)
    await expect(page.getByText(/failed|error/i)).toBeVisible({
      timeout: 30000,
    })
  })
})
