import { useNavigate } from '@tanstack/react-router'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

const NAV_SHORTCUTS = {
  d: '/dashboard',
  c: '/content',
  q: '/quizzes',
  l: '/live-classes',
} as const

type NavigationTarget = keyof typeof NAV_SHORTCUTS

const G_PREFIX_TIMEOUT = 500

const TAGGABLE_INPUT_SELECTOR =
  'input:not([type="hidden"]):not([type="submit"]):not([type="reset"]):not([type="button"]), textarea, select, [contenteditable="true"]'

interface KeyboardShortcutContextValue {
  isCommandPaletteOpen: boolean
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void
  isCheatSheetOpen: boolean
  openCheatSheet: () => void
  closeCheatSheet: () => void
  toggleCheatSheet: () => void
}

const KeyboardShortcutContext =
  createContext<KeyboardShortcutContextValue | null>(null)

export function useKeyboardShortcuts(): KeyboardShortcutContextValue {
  const ctx = useContext(KeyboardShortcutContext)
  if (!ctx) {
    throw new Error(
      'useKeyboardShortcuts must be used within a KeyboardShortcutProvider',
    )
  }
  return ctx
}

export function KeyboardShortcutProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const gPrefixKeyRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [isCheatSheetOpen, setCheatSheetOpen] = useState(false)

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), [])
  const closeCommandPalette = useCallback(
    () => setCommandPaletteOpen(false),
    [],
  )
  const toggleCommandPalette = useCallback(
    () => setCommandPaletteOpen((prev) => !prev),
    [],
  )

  const openCheatSheet = useCallback(() => setCheatSheetOpen(true), [])
  const closeCheatSheet = useCallback(() => setCheatSheetOpen(false), [])
  const toggleCheatSheet = useCallback(
    () => setCheatSheetOpen((prev) => !prev),
    [],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isInInput = target.matches(TAGGABLE_INPUT_SELECTOR)

      if (event.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setCommandPaletteOpen(false)
          event.preventDefault()
          return
        }
        if (isCheatSheetOpen) {
          setCheatSheetOpen(false)
          event.preventDefault()
          return
        }
        return
      }

      if (event.metaKey || event.ctrlKey) {
        if (event.key === 'k') {
          event.preventDefault()
          toggleCommandPalette()
          return
        }
        return
      }

      if (event.key === '?' && !isInInput) {
        event.preventDefault()
        toggleCheatSheet()
        return
      }

      if (gPrefixKeyRef.current) {
        const key = event.key.toLowerCase() as NavigationTarget
        if (key in NAV_SHORTCUTS) {
          event.preventDefault()
          clearTimeout(gPrefixKeyRef.current)
          gPrefixKeyRef.current = null
          navigate({ to: NAV_SHORTCUTS[key] })
          return
        }
        clearTimeout(gPrefixKeyRef.current)
        gPrefixKeyRef.current = null
        return
      }

      if (event.key === 'g' && !isInInput) {
        gPrefixKeyRef.current = setTimeout(() => {
          gPrefixKeyRef.current = null
        }, G_PREFIX_TIMEOUT)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (gPrefixKeyRef.current) {
        clearTimeout(gPrefixKeyRef.current)
      }
    }
  }, [
    navigate,
    isCommandPaletteOpen,
    isCheatSheetOpen,
    toggleCommandPalette,
    toggleCheatSheet,
  ])

  return (
    <KeyboardShortcutContext.Provider
      value={{
        isCommandPaletteOpen,
        openCommandPalette,
        closeCommandPalette,
        toggleCommandPalette,
        isCheatSheetOpen,
        openCheatSheet,
        closeCheatSheet,
        toggleCheatSheet,
      }}
    >
      {children}
    </KeyboardShortcutContext.Provider>
  )
}
