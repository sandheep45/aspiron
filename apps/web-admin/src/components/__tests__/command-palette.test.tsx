import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CommandPalette } from '@/components/command-palette'
import {
  KeyboardShortcutProvider,
  useKeyboardShortcuts,
} from '@/providers/keyboard-shortcuts'

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
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
  const { openCommandPalette, closeCommandPalette } = useKeyboardShortcuts()

  return (
    <div>
      <CommandPalette />
      <button type='button' onClick={openCommandPalette}>
        Open Palette
      </button>
      <button type='button' onClick={closeCommandPalette}>
        Close Palette
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

describe('CommandPalette', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input when open', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.click(screen.getByText('Open Palette'))

    expect(
      screen.getByPlaceholderText('Search pages, topics, classes...'),
    ).toBeInTheDocument()
  })

  it('shows page results', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.click(screen.getByText('Open Palette'))

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Quizzes')).toBeInTheDocument()
    expect(screen.getByText('Live Classes')).toBeInTheDocument()
  })

  it('navigates on page selection', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.click(screen.getByText('Open Palette'))

    const dashboard = screen.getByText('Dashboard')
    await user.click(dashboard)

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' })
  })

  it('navigates on topic selection', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.click(screen.getByText('Open Palette'))

    const topic = screen.getByText('Quadratic Equations')
    await user.click(topic)

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/content/topic/1' })
  })

  it('navigates on class selection', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.click(screen.getByText('Open Palette'))

    const classItem = screen.getByText('Algebra II - Period 3')
    await user.click(classItem)

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/live-classes/1' })
  })
})
