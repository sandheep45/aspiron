import { expect, test } from '@playwright/test'
import { loginAsCDAdmin } from './login'

const TOPIC_ID = '30000000-0000-0000-0000-000000000041'
const _TOPIC_NAME = 'CD Quadratic Equations'

test.describe('Notes Manager Page — Real API', () => {
  test.describe.configure({ mode: 'serial' })
  test.beforeEach(async ({ page, context }) => {
    await loginAsCDAdmin(page, context)
  })

  // ---------------------------------------------------------------------------
  // Page structure
  // ---------------------------------------------------------------------------

  test('page renders Notes Manager heading', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('heading', { name: 'Notes Manager' }),
    ).toBeVisible()
  })

  test('shows Notes Overview card with metrics', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')
    // Section header
    await expect(
      page.getByRole('heading', { name: 'Notes Overview' }),
    ).toBeVisible()
    // Metric labels in the overview card (use .first() — also appears as section header)
    await expect(page.getByText('Teacher Notes').first()).toBeVisible()
    await expect(page.getByText('AI Notes').first()).toBeVisible()
    await expect(page.getByText('External References').first()).toBeVisible()
    await expect(page.getByText('Student Engagement').first()).toBeVisible()
  })

  test('shows Teacher Notes Editor section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('heading', { name: 'Teacher Notes' }),
    ).toBeVisible()
  })

  test('shows AI Generated Notes section', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('heading', { name: 'AI Generated Notes' }),
    ).toBeVisible()
  })

  test('shows External References section with add button', async ({
    page,
  }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('heading', { name: 'External References' }),
    ).toBeVisible()
    // Empty state shows "Add Reference" button
    const addButtons = page.getByRole('button', { name: 'Add Reference' })
    await expect(addButtons.first()).toBeVisible()
  })

  test('shows Quick Actions bar', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('heading', { name: 'Quick Actions' }),
    ).toBeVisible()
  })

  test('no hydration mismatch warnings', async ({ page }) => {
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('hydration')) {
        warnings.push(msg.text())
      }
    })

    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')

    expect(warnings).toHaveLength(0)
  })

  // ---------------------------------------------------------------------------
  // ReferenceDialog: open / close / cancel
  // ---------------------------------------------------------------------------

  test('ReferenceDialog opens and can close via Cancel', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')

    // Click first "Add Reference" button to open dialog
    await page.getByRole('button', { name: 'Add Reference' }).first().click()

    // Dialog should be visible
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Should show both tabs
    await expect(
      dialog.getByRole('tab', { name: 'Link Resource' }),
    ).toBeVisible()
    await expect(dialog.getByRole('tab', { name: 'Upload File' })).toBeVisible()

    // Click Cancel (use first — there's also a dialog-close X button)
    await dialog.getByRole('button', { name: 'Cancel' }).first().click()

    // Dialog should close
    await expect(dialog).not.toBeVisible()
  })

  test('ReferenceDialog re-opens with clean form after cancel', async ({
    page,
  }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')

    // Open dialog
    await page.getByRole('button', { name: 'Add Reference' }).first().click()
    let dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Type something in title
    const titleInput = dialog.getByPlaceholder('Enter reference title')
    await titleInput.fill('Temporary Title')

    // Cancel
    await dialog.getByRole('button', { name: 'Cancel' }).first().click()
    await expect(dialog).not.toBeVisible()

    // Re-open dialog
    await page.getByRole('button', { name: 'Add Reference' }).first().click()
    dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Form should be reset
    await expect(dialog.getByPlaceholder('Enter reference title')).toHaveValue(
      '',
    )
  })

  // ---------------------------------------------------------------------------
  // ReferenceDialog: form validation
  // ---------------------------------------------------------------------------

  test('shows validation errors on empty form submission', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')

    // Open dialog
    await page.getByRole('button', { name: 'Add Reference' }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Submit with empty form
    await dialog.getByRole('button', { name: 'Add Reference' }).click()

    // Should see validation errors (title and url are required)
    await expect(dialog.getByText('Title is required')).toBeVisible()
    await expect(dialog.getByText('URL is required')).toBeVisible()
  })

  test('shows invalid URL error', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')

    // Open dialog
    await page.getByRole('button', { name: 'Add Reference' }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Type invalid URL
    const urlInput = dialog.getByPlaceholder('https://example.com/resource')
    await urlInput.fill('not-a-url')

    // Click somewhere else to trigger validation
    await dialog.getByPlaceholder('Enter reference title').click()

    // Should show invalid URL error
    await expect(dialog.getByText('Must be a valid URL')).toBeVisible()
  })

  test('clears validation error after fixing URL', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Add Reference' }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Type valid title
    await dialog
      .getByPlaceholder('Enter reference title')
      .fill('Test Reference')

    // Type invalid URL → triggers error
    const urlInput = dialog.getByPlaceholder('https://example.com/resource')
    await urlInput.fill('not-a-url')
    await dialog.getByPlaceholder('Enter reference title').click()
    await expect(dialog.getByText('Must be a valid URL')).toBeVisible()

    // Fix the URL
    await urlInput.fill('https://example.com/test')
    await dialog.getByPlaceholder('Enter reference title').click()

    // Error should disappear
    await expect(dialog.getByText('Must be a valid URL')).not.toBeVisible()
  })

  // ---------------------------------------------------------------------------
  // ReferenceDialog: tab switching
  // ---------------------------------------------------------------------------

  test('switches between URL and Upload tabs', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Add Reference' }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Default tab shows URL input
    const urlInput = dialog.getByPlaceholder('https://example.com/resource')
    await expect(urlInput).toBeVisible()

    // Switch to Upload tab
    await dialog.getByRole('tab', { name: 'Upload File' }).click()

    // URL input hidden, file picker shown
    await expect(urlInput).not.toBeVisible()
    await expect(dialog.getByText('Choose a file to upload')).toBeVisible()

    // Switch back to URL tab
    await dialog.getByRole('tab', { name: 'Link Resource' }).click()

    // URL input shown again
    await expect(
      dialog.getByPlaceholder('https://example.com/resource'),
    ).toBeVisible()
  })

  // ---------------------------------------------------------------------------
  // ReferenceDialog: submit valid URL reference
  // ---------------------------------------------------------------------------

  test('creates a reference and shows it in the table', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')

    // Open dialog
    await page.getByRole('button', { name: 'Add Reference' }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Fill form
    await dialog
      .getByPlaceholder('Enter reference title')
      .fill('E2E Test Reference')
    await dialog
      .getByPlaceholder('e.g., Wikipedia, Khan Academy')
      .fill('Playwright E2E')
    await dialog
      .getByPlaceholder('https://example.com/resource')
      .fill('https://example.com/e2e-test')

    // Submit
    await dialog.getByRole('button', { name: 'Add Reference' }).click()

    // Dialog should close after successful submission
    await expect(dialog).not.toBeVisible()

    // Reference should appear in table
    await expect(page.getByText('E2E Test Reference').first()).toBeVisible()
  })

  test('overview count increments after adding a reference', async ({
    page,
  }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')

    // The overview card should show a count value for External References
    // It shows "{count} Linked" text
    const _overviewCard = page.getByText('External References').first()

    // Add a reference via dialog
    await page.getByRole('button', { name: 'Add Reference' }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog
      .getByPlaceholder('Enter reference title')
      .fill('Count Test Ref')
    await dialog
      .getByPlaceholder('https://example.com/resource')
      .fill('https://example.com/count-test')
    await dialog.getByRole('button', { name: 'Add Reference' }).click()
    await expect(dialog).not.toBeVisible()

    // Wait for the overview to update (mutation invalidates the query)
    await page.waitForTimeout(1000)

    // The overview should now show a count > 0
    // The metric value text shows "{count} Linked"
    await expect(page.getByText(/[1-9]\s*Linked/)).toBeVisible()
  })

  // ---------------------------------------------------------------------------
  // Reference table: toggle visibility
  // ---------------------------------------------------------------------------

  test('toggles reference visibility', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')

    // First create a reference
    await page.getByRole('button', { name: 'Add Reference' }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog
      .getByPlaceholder('Enter reference title')
      .fill('Toggle Test Ref')
    await dialog
      .getByPlaceholder('https://example.com/resource')
      .fill('https://example.com/toggle-test')
    await dialog.getByRole('button', { name: 'Add Reference' }).click()
    await expect(dialog).not.toBeVisible()

    // Wait for mutation to complete
    await page.waitForTimeout(1000)

    // Find the visibility switch in the table row
    const tableRow = page
      .getByRole('row')
      .filter({ hasText: 'Toggle Test Ref' })
    const toggleSwitch = tableRow.getByRole('switch')

    // Get initial state
    const initialChecked = await toggleSwitch.isChecked()

    // Click the toggle
    await toggleSwitch.click()

    // Wait for mutation
    await page.waitForTimeout(1000)

    // State should be flipped
    await expect(toggleSwitch).toBeChecked({ checked: !initialChecked })
  })

  // ---------------------------------------------------------------------------
  // Reference table: delete reference
  // ---------------------------------------------------------------------------

  test('deletes a reference from the table', async ({ page }) => {
    await page.goto(`/content/topic/${TOPIC_ID}/notes`)
    await page.waitForLoadState('networkidle')

    // First create a reference
    await page.getByRole('button', { name: 'Add Reference' }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog
      .getByPlaceholder('Enter reference title')
      .fill('Delete Test Ref')
    await dialog
      .getByPlaceholder('https://example.com/resource')
      .fill('https://example.com/delete-test')
    await dialog.getByRole('button', { name: 'Add Reference' }).click()
    await expect(dialog).not.toBeVisible()

    // Wait for mutation
    await page.waitForTimeout(1000)

    // Reference should be visible
    await expect(page.getByText('Delete Test Ref').first()).toBeVisible()

    // Click delete button in the row
    const deleteRow = page
      .getByRole('row')
      .filter({ hasText: 'Delete Test Ref' })
    await deleteRow
      .getByRole('button')
      .filter({ has: page.locator('svg') })
      .click()

    // Wait for deletion mutation
    await page.waitForTimeout(1000)

    // Reference should no longer be visible
    await expect(page.getByText('Delete Test Ref')).not.toBeVisible()
  })
})
