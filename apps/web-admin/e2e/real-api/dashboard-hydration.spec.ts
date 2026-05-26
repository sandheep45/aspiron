import { expect, test } from '@playwright/test'
import { seedUser } from './login'

test.describe('Dashboard SSR Hydration (Real API)', () => {
  test('no hydration mismatch warnings in console', async ({
    page,
    context,
  }) => {
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('hydration')) {
        warnings.push(msg.text())
      }
    })

    await seedUser(context, page)

    expect(warnings).toHaveLength(0)
  })

  test('dashboard source contains SSR-rendered content', async ({
    page,
    context,
  }) => {
    await seedUser(context, page)

    const html = await page.content()
    expect(html).toContain('data-dashboard-section')
  })
})
