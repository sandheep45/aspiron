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

async function setupTopicsPageMocks(page: Page) {
  await page.route(
    '**/api/v1/chapters/ch-1/topics-page/summary',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          chapter_name: 'Electrostatics',
          total_topics: 8,
          published_topics: 6,
          draft_topics: 2,
          weak_topics: 1,
        }),
      })
    },
  )

  await page.route(
    '**/api/v1/chapters/ch-1/topics-page/topics*',
    async (route) => {
      const url = new URL(route.request().url())
      const search = url.searchParams.get('search')?.toLowerCase() ?? ''
      const sortBy = url.searchParams.get('sort_by')
      const sortOrder = url.searchParams.get('sort_order') ?? 'desc'
      const pageNum = Number(url.searchParams.get('page') ?? '1')
      const limit = Number(url.searchParams.get('limit') ?? '10')

      const allTopics = [
        {
          id: 'topic-1',
          name: "Coulomb's Law",
          content_status: 'published',
          video_available: true,
          recall_strength: 'strong',
          practice_accuracy: 90,
          last_activity: '2 hours ago',
          status: 'healthy',
        },
        {
          id: 'topic-2',
          name: 'Electric Field',
          content_status: 'published',
          video_available: true,
          recall_strength: 'medium',
          practice_accuracy: 72,
          last_activity: '5 hours ago',
          status: 'needs_attention',
        },
        {
          id: 'topic-3',
          name: 'Gauss Law',
          content_status: 'draft',
          video_available: false,
          recall_strength: 'weak',
          practice_accuracy: 35,
          last_activity: 'Never',
          status: 'critical',
        },
      ]

      const filtered = search
        ? allTopics.filter((t) => t.name.toLowerCase().includes(search))
        : [...allTopics]

      if (sortBy) {
        const isDesc = sortOrder === 'desc'
        filtered.sort((a, b) => {
          let cmp = 0
          switch (sortBy) {
            case 'recall': {
              const order = { strong: 3, medium: 2, weak: 1 }
              cmp =
                (order[b.recall_strength as keyof typeof order] ?? 0) -
                (order[a.recall_strength as keyof typeof order] ?? 0)
              break
            }
            case 'accuracy':
              cmp = a.practice_accuracy - b.practice_accuracy
              break
            case 'last_activity': {
              const actOrder = {
                '2 hours ago': 3,
                '5 hours ago': 2,
                Never: 1,
              }
              cmp =
                (actOrder[b.last_activity as keyof typeof actOrder] ?? 0) -
                (actOrder[a.last_activity as keyof typeof actOrder] ?? 0)
              break
            }
            case 'status': {
              const order = {
                healthy: 3,
                needs_attention: 2,
                critical: 1,
              }
              cmp =
                (order[b.status as keyof typeof order] ?? 0) -
                (order[a.status as keyof typeof order] ?? 0)
              break
            }
          }
          return isDesc ? -cmp : cmp
        })
      }

      const start = (pageNum - 1) * limit
      const paginated = filtered.slice(start, start + limit)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(paginated),
      })
    },
  )

  await page.route(
    '**/api/v1/chapters/ch-1/topics-page/insights',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'ins-1',
            type: 'positive',
            title: 'All topics fully equipped',
            description:
              'Every topic in this chapter has both video content and assessment quizzes.',
          },
          {
            id: 'ins-2',
            type: 'warning',
            title: 'Topics with low recall',
            description:
              'Some topics have significantly lower recall rates than the chapter average.',
          },
          {
            id: 'ins-3',
            type: 'negative',
            title: 'Practice accuracy concerns',
            description: 'Gauss Law shows practice accuracy below 50%.',
          },
        ]),
      })
    },
  )
}

test.describe('Topics Page — Mocked', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await setupTopicsPageMocks(page)
  })

  test('renders chapter name heading', async ({ page }) => {
    await page.goto('/content/subjects/subj-1/chapters/ch-1/topics')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('heading', { name: 'Electrostatics' }),
    ).toBeVisible()
  })

  test('renders summary metric cards', async ({ page }) => {
    await page.goto('/content/subjects/subj-1/chapters/ch-1/topics')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Total Topics')).toBeVisible()
    await expect(page.getByText('Topics Published')).toBeVisible()
    await expect(page.getByText('Topics In Draft')).toBeVisible()
    await expect(page.getByText('Topics Flagged As Weak')).toBeVisible()
    await expect(page.getByText('8')).toBeVisible()
    await expect(page.getByText('6')).toBeVisible()
    await expect(page.getByText('2')).toBeVisible()
    await expect(page.getByText('1')).toBeVisible()
  })

  test('renders topics table with rows', async ({ page }) => {
    await page.goto('/content/subjects/subj-1/chapters/ch-1/topics')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('cell', { name: "Coulomb's Law" }),
    ).toBeVisible()
    await expect(
      page.getByRole('cell', { name: 'Electric Field' }),
    ).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Gauss Law' })).toBeVisible()
  })

  test('renders pattern insights section', async ({ page }) => {
    await page.goto('/content/subjects/subj-1/chapters/ch-1/topics')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Quick Pattern Insights')).toBeVisible()
    await expect(page.getByText('All topics fully equipped')).toBeVisible()
    await expect(page.getByText('Topics with low recall')).toBeVisible()
    await expect(page.getByText('Practice accuracy concerns')).toBeVisible()
  })

  test('search filters topic list', async ({ page }) => {
    await page.goto('/content/subjects/subj-1/chapters/ch-1/topics')
    await page.waitForLoadState('networkidle')
    const searchInput = page.getByPlaceholder('Search topics...')
    await searchInput.fill('Gauss')
    await page.waitForTimeout(500)
    await expect(
      page.getByRole('cell', { name: "Coulomb's Law" }),
    ).not.toBeVisible()
    await expect(page.getByRole('cell', { name: 'Gauss Law' })).toBeVisible()
  })

  test('no horizontal scroll at 1440px desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/content/subjects/subj-1/chapters/ch-1/topics')
    await page.waitForLoadState('networkidle')
    const hasHorizontalScroll = await page.evaluate(() => {
      const main = document.querySelector('[data-slot="sidebar-inset"]')
      if (!main) return true
      return main.scrollWidth > main.clientWidth + 2
    })
    expect(hasHorizontalScroll).toBe(false)
  })

  test('renders back to chapters button', async ({ page }) => {
    await page.goto('/content/subjects/subj-1/chapters/ch-1/topics')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('button', { name: 'Back to Chapters' }),
    ).toBeVisible()
  })
})
