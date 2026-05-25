import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
  const {
    isCommandPaletteOpen,
    isCheatSheetOpen,
    openCommandPalette,
    closeCommandPalette,
    openCheatSheet,
    closeCheatSheet,
  } = useKeyboardShortcuts()

  return (
    <div>
      <div data-testid='palette-status'>
        {isCommandPaletteOpen ? 'open' : 'closed'}
      </div>
      <div data-testid='cheatsheet-status'>
        {isCheatSheetOpen ? 'open' : 'closed'}
      </div>
      <button type='button' onClick={openCommandPalette}>
        Open Palette
      </button>
      <button type='button' onClick={closeCommandPalette}>
        Close Palette
      </button>
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

describe('KeyboardShortcutProvider', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('navigates to dashboard on g then d', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.keyboard('gd')

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' })
  })

  it('navigates to content on g then c', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.keyboard('gc')

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/content' })
  })

  it('navigates to quizzes on g then q', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.keyboard('gq')

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/quizzes' })
  })

  it('navigates to live classes on g then l', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.keyboard('gl')

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/live-classes' })
  })

  it('opens command palette on Ctrl+K', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.keyboard('{Control>}k{/Control}')

    expect(screen.getByTestId('palette-status')).toHaveTextContent('open')
  })

  it('opens command palette on Meta+K', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.keyboard('{Meta>}k{/Meta}')

    expect(screen.getByTestId('palette-status')).toHaveTextContent('open')
  })

  it('closes command palette on Escape', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.keyboard('{Control>}k{/Control}')
    expect(screen.getByTestId('palette-status')).toHaveTextContent('open')

    await user.keyboard('{Escape}')
    expect(screen.getByTestId('palette-status')).toHaveTextContent('closed')
  })

  it('toggles cheat sheet on ?', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    await user.keyboard('?')
    expect(screen.getByTestId('cheatsheet-status')).toHaveTextContent('open')

    await user.keyboard('?')
    expect(screen.getByTestId('cheatsheet-status')).toHaveTextContent('closed')
  })

  it('does not navigate g-d when inside an input', async () => {
    renderWithProvider()
    const user = userEvent.setup()

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    await user.keyboard('gd')
    document.body.removeChild(input)

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
