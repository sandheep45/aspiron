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
          permissions: ['VIEW_ANALYTICS', 'MANAGE_CONTENT'],
          expires_in: 3600,
        },
      }),
    })
  })
}

async function setupSubjectsPageMocks(page: Page) {
  await page.route('**/api/v1/content/subjects-page', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: '1',
          name: 'Physics',
          chapters_count: 12,
          topics_published: 59,
          coverage: 87,
          average_recall: 0.62,
          practice_accuracy: 0.74,
          status: 'Needs Attention',
        },
        {
          id: '2',
          name: 'Chemistry',
          chapters_count: 10,
          topics_published: 39,
          coverage: 72,
          average_recall: 0.81,
          practice_accuracy: 0.85,
          status: 'Healthy',
        },
        {
          id: '3',
          name: 'Mathematics',
          chapters_count: 14,
          topics_published: 53,
          coverage: 64,
          average_recall: 0.76,
          practice_accuracy: 0.69,
          status: 'Needs Attention',
        },
        {
          id: '4',
          name: 'Biology',
          chapters_count: 8,
          topics_published: 42,
          coverage: 91,
          average_recall: 0.88,
          practice_accuracy: 0.91,
          status: 'Healthy',
        },
      ]),
    })
  })

  await page.route('**/api/v1/content/subjects-page/summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_subjects: 4,
        total_topics: 250,
        published_topics: 193,
        topics_needing_attention: 18,
        descriptions: [
          'Physics, Chemistry, Mathematics, Biology',
          '250 topics across 4 subjects',
          '193 topics published and available',
          '18 topics with low recall or accuracy',
        ],
      }),
    })
  })

  await page.route('**/api/v1/content/subjects-page/signals', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          subject_name: 'Physics',
          message: 'Physics has fastest recall decay',
          signal_type: 'negative',
        },
        {
          subject_name: 'Chemistry',
          message: 'Chemistry has highest practice accuracy',
          signal_type: 'positive',
        },
        {
          subject_name: 'Biology',
          message: 'Content coverage improved significantly for Biology',
          signal_type: 'positive',
        },
        {
          subject_name: 'Mathematics',
          message: 'Mathematics maintains most stable recall',
          signal_type: 'positive',
        },
      ]),
    })
  })
}

test.describe('Subjects Page — Mocked', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await setupSubjectsPageMocks(page)
  })

  test('no horizontal scroll at 1440px desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
    const hasHorizontalScroll = await page.evaluate(() => {
      const main = document.querySelector('[data-slot="sidebar-inset"]')
      if (!main) return true
      return main.scrollWidth > main.clientWidth + 2
    })
    expect(hasHorizontalScroll).toBe(false)
  })

  test('no horizontal scroll at 1280px desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
    const hasHorizontalScroll = await page.evaluate(() => {
      const main = document.querySelector('[data-slot="sidebar-inset"]')
      if (!main) return true
      return main.scrollWidth > main.clientWidth + 2
    })
    expect(hasHorizontalScroll).toBe(false)
  })

  test('no horizontal scroll at 1024px tablet', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
    const hasHorizontalScroll = await page.evaluate(() => {
      const main = document.querySelector('[data-slot="sidebar-inset"]')
      if (!main) return true
      return main.scrollWidth > main.clientWidth + 2
    })
    expect(hasHorizontalScroll).toBe(false)
  })

  test('no horizontal scroll at 375px mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
    const hasHorizontalScroll = await page.evaluate(() => {
      const main = document.querySelector('[data-slot="sidebar-inset"]')
      if (!main) return true
      return main.scrollWidth > main.clientWidth + 2
    })
    expect(hasHorizontalScroll).toBe(false)
  })

  test('renders all three sections', async ({ page }) => {
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Total Subjects')).toBeVisible()
    await expect(page.getByText('Subject Name')).toBeVisible()
    await expect(page.getByText('Subject Signals')).toBeVisible()
  })

  test('renders summary metric cards', async ({ page }) => {
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Total Subjects')).toBeVisible()
    await expect(page.getByText('Total Topics')).toBeVisible()
    await expect(page.getByText('Published Topics')).toBeVisible()
    await expect(page.getByText('Topics Needing Attention')).toBeVisible()
  })

  test('renders subjects table rows', async ({ page }) => {
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('cell', { name: 'Physics' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Chemistry' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Mathematics' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Biology' })).toBeVisible()
  })

  test('renders signal cards', async ({ page }) => {
    await page.goto('/content/subjects')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText('Physics has fastest recall decay'),
    ).toBeVisible()
    await expect(
      page.getByText('Chemistry has highest practice accuracy'),
    ).toBeVisible()
  })
})
