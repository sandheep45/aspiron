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

async function setupChaptersPageMocks(page: Page) {
  await page.route(
    '**/api/v1/subjects/physics-1/chapters-page/summary',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          subject_name: 'Physics',
          total_chapters: 8,
          published_topics: 45,
          draft_topics: 12,
          chapters_needing_attention: 2,
        }),
      })
    },
  )

  await page.route(
    '**/api/v1/subjects/physics-1/chapters-page/chapters*',
    async (route) => {
      const url = new URL(route.request().url())
      const search = url.searchParams.get('search')?.toLowerCase() ?? ''
      const sortBy = url.searchParams.get('sort_by')
      const sortOrder = url.searchParams.get('sort_order') ?? 'desc'
      const page = Number(url.searchParams.get('page') ?? '1')
      const limit = Number(url.searchParams.get('limit') ?? '10')

      const allChapters = [
        {
          id: 'ch-1',
          name: 'Mechanics',
          published_topics: 12,
          total_topics: 15,
          coverage: 80,
          avg_recall: 'strong',
          practice_accuracy: 74,
          status: 'healthy',
          last_updated: '2 days ago',
        },
        {
          id: 'ch-2',
          name: 'Thermodynamics',
          published_topics: 5,
          total_topics: 10,
          coverage: 50,
          avg_recall: 'medium',
          practice_accuracy: 62,
          status: 'needs_attention',
          last_updated: '5 days ago',
        },
        {
          id: 'ch-3',
          name: 'Optics',
          published_topics: 8,
          total_topics: 12,
          coverage: 67,
          avg_recall: 'weak',
          practice_accuracy: 55,
          status: 'critical',
          last_updated: '1 week ago',
        },
        {
          id: 'ch-4',
          name: 'Electromagnetism',
          published_topics: 15,
          total_topics: 18,
          coverage: 83,
          avg_recall: 'strong',
          practice_accuracy: 89,
          status: 'healthy',
          last_updated: '3 days ago',
        },
        {
          id: 'ch-5',
          name: 'Quantum Physics',
          published_topics: 5,
          total_topics: 20,
          coverage: 25,
          avg_recall: 'weak',
          practice_accuracy: 35,
          status: 'critical',
          last_updated: '2 weeks ago',
        },
      ]

      const filtered = search
        ? allChapters.filter((c) => c.name.toLowerCase().includes(search))
        : [...allChapters]

      if (sortBy) {
        const isDesc = sortOrder === 'desc'
        filtered.sort((a, b) => {
          let cmp = 0
          switch (sortBy) {
            case 'coverage':
              cmp = a.coverage - b.coverage
              break
            case 'accuracy':
              cmp = a.practice_accuracy - b.practice_accuracy
              break
            case 'recall': {
              const recallOrder = { strong: 3, medium: 2, weak: 1 }
              cmp =
                (recallOrder[b.avg_recall as keyof typeof recallOrder] ?? 0) -
                (recallOrder[a.avg_recall as keyof typeof recallOrder] ?? 0)
              break
            }
            case 'status': {
              const statusOrder = {
                healthy: 3,
                needs_attention: 2,
                critical: 1,
              }
              cmp =
                (statusOrder[b.status as keyof typeof statusOrder] ?? 0) -
                (statusOrder[a.status as keyof typeof statusOrder] ?? 0)
              break
            }
          }
          return isDesc ? -cmp : cmp
        })
      }

      const start = (page - 1) * limit
      const paginated = filtered.slice(start, start + limit)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(paginated),
      })
    },
  )

  await page.route(
    '**/api/v1/subjects/physics-1/chapters-page/insights',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'ins-1',
            type: 'positive',
            title: 'Strong Recall',
            description:
              'Mechanics and Electromagnetism maintain strong recall rates',
          },
          {
            id: 'ins-2',
            type: 'warning',
            title: 'Content Gaps',
            description: 'Quantum Physics has low coverage at 25%',
          },
          {
            id: 'ins-3',
            type: 'negative',
            title: 'Low Accuracy',
            description: 'Quantum Physics practice accuracy dropped below 40%',
          },
        ]),
      })
    },
  )
}

test.describe('Chapters Page — Mocked', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await setupChaptersPageMocks(page)
  })

  test('renders subject name heading', async ({ page }) => {
    await page.goto('/content/subjects/physics-1/chapters')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Physics' })).toBeVisible()
  })

  test('renders summary metric cards', async ({ page }) => {
    await page.goto('/content/subjects/physics-1/chapters')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Total Chapters')).toBeVisible()
    await expect(page.getByText('Topics Published')).toBeVisible()
    await expect(page.getByText('Topics In Draft')).toBeVisible()
    await expect(page.getByText('Chapters With Weak Recall')).toBeVisible()
    await expect(page.getByText('8')).toBeVisible()
    await expect(page.getByText('45')).toBeVisible()
    await expect(page.getByText('12')).toBeVisible()
    await expect(page.getByText('2')).toBeVisible()
  })

  test('renders chapters table with rows', async ({ page }) => {
    await page.goto('/content/subjects/physics-1/chapters')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('cell', { name: 'Mechanics' })).toBeVisible()
    await expect(
      page.getByRole('cell', { name: 'Thermodynamics' }),
    ).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Optics' })).toBeVisible()
    await expect(
      page.getByRole('cell', { name: 'Electromagnetism' }),
    ).toBeVisible()
    await expect(
      page.getByRole('cell', { name: 'Quantum Physics' }),
    ).toBeVisible()
  })

  test('renders quick insights section', async ({ page }) => {
    await page.goto('/content/subjects/physics-1/chapters')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Quick Insights')).toBeVisible()
    await expect(page.getByText('Strong Recall')).toBeVisible()
    await expect(page.getByText('Content Gaps')).toBeVisible()
    await expect(page.getByText('Low Accuracy')).toBeVisible()
  })

  test('search filters chapter list', async ({ page }) => {
    await page.goto('/content/subjects/physics-1/chapters')
    await page.waitForLoadState('networkidle')
    const searchInput = page.getByPlaceholder('Search chapters...')
    await searchInput.fill('mech')
    await page.waitForTimeout(500)
    await expect(page.getByRole('cell', { name: 'Mechanics' })).toBeVisible()
    await expect(
      page.getByRole('cell', { name: 'Thermodynamics' }),
    ).not.toBeVisible()
  })

  test('pagination controls visible and functional', async ({ page }) => {
    await page.goto('/content/subjects/physics-1/chapters')
    await page.waitForLoadState('networkidle')
    const prevButton = page.getByRole('button', { name: /previous/i })
    const nextButton = page.getByRole('button', { name: /next/i })
    await expect(prevButton).toBeDisabled()
    await expect(nextButton).toBeDisabled()
  })

  test('no horizontal scroll at 1440px desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/content/subjects/physics-1/chapters')
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
    await page.goto('/content/subjects/physics-1/chapters')
    await page.waitForLoadState('networkidle')
    const hasHorizontalScroll = await page.evaluate(() => {
      const main = document.querySelector('[data-slot="sidebar-inset"]')
      if (!main) return true
      return main.scrollWidth > main.clientWidth + 2
    })
    expect(hasHorizontalScroll).toBe(false)
  })
})
