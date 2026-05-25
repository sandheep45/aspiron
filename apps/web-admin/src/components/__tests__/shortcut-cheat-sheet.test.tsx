import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ShortcutCheatSheet } from '@/components/shortcut-cheat-sheet'
import {
  KeyboardShortcutProvider,
  useKeyboardShortcuts,
} from '@/providers/keyboard-shortcuts'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode
    to: string
    className?: string
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}))

function TestHarness() {
  const { openCheatSheet, closeCheatSheet } = useKeyboardShortcuts()

  return (
    <div>
      <ShortcutCheatSheet />
      <button type='button' onClick={openCheatSheet}>
        Open Cheat Sheet
      </button>
      <button type='button' onClick={closeCheatSheet}>
        Close Cheat Sheet
      </button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <KeyboardShortcutProvider>
      <TestHarness />
    </KeyboardShortcutProvider>,
  )
}

describe('ShortcutCheatSheet', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders title when open', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.click(screen.getByText('Open Cheat Sheet'))

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })

  it('renders navigation shortcuts', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.click(screen.getByText('Open Cheat Sheet'))

    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Go to Content')).toBeInTheDocument()
    expect(screen.getByText('Go to Quizzes')).toBeInTheDocument()
    expect(screen.getByText('Go to Live Classes')).toBeInTheDocument()
  })

  it('renders action shortcuts', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.click(screen.getByText('Open Cheat Sheet'))

    expect(screen.getByText('Open command palette')).toBeInTheDocument()
    expect(screen.getByText('Show this cheat sheet')).toBeInTheDocument()
    expect(screen.getByText('Toggle sidebar')).toBeInTheDocument()
    expect(screen.getByText('Close overlay')).toBeInTheDocument()
  })

  it('renders kbd elements for shortcuts', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.click(screen.getByText('Open Cheat Sheet'))

    const kbdElements = document.querySelectorAll('[data-slot="kbd"]')
    expect(kbdElements.length).toBeGreaterThanOrEqual(8)
  })

  it('closes on Escape via dialog', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.click(screen.getByText('Open Cheat Sheet'))
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument()
  })
})
