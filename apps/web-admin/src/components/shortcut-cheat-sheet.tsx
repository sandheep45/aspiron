import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Kbd } from '@/components/ui/kbd'
import { useKeyboardShortcuts } from '@/providers/keyboard-shortcuts'

const SHORTCUT_GROUPS = [
  {
    heading: 'Navigation',
    shortcuts: [
      { keys: ['g', 'd'], label: 'Go to Dashboard' },
      { keys: ['g', 'c'], label: 'Go to Content' },
      { keys: ['g', 'q'], label: 'Go to Quizzes' },
      { keys: ['g', 'l'], label: 'Go to Live Classes' },
    ],
  },
  {
    heading: 'Actions',
    shortcuts: [
      { keys: ['⌘', 'K'], label: 'Open command palette' },
      { keys: ['?'], label: 'Show this cheat sheet' },
      { keys: ['⌘', 'B'], label: 'Toggle sidebar' },
      { keys: ['Esc'], label: 'Close overlay' },
    ],
  },
]

export function ShortcutCheatSheet() {
  const { isCheatSheetOpen, closeCheatSheet } = useKeyboardShortcuts()

  return (
    <Dialog
      open={isCheatSheetOpen}
      onOpenChange={(open: boolean) => {
        if (!open) closeCheatSheet()
      }}
    >
      <DialogContent className='sm:max-w-md' showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Keyboard shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.heading}>
              <h4 className='mb-2 font-medium text-muted-foreground text-xs'>
                {group.heading}
              </h4>
              <div className='space-y-1.5'>
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.label}
                    className='flex items-center justify-between'
                  >
                    <span className='text-xs'>{shortcut.label}</span>
                    <span className='flex items-center gap-1'>
                      {shortcut.keys.map((key, i) => (
                        <span key={i} className='flex items-center gap-0.5'>
                          {i > 0 && (
                            <span className='text-muted-foreground'> </span>
                          )}
                          <Kbd>{key}</Kbd>
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
