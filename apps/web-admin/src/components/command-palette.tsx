import { useNavigate } from '@tanstack/react-router'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useKeyboardShortcuts } from '@/providers/keyboard-shortcuts'

interface SearchResult {
  id: string
  label: string
  description?: string
  to: string
}

const PAGE_RESULTS: SearchResult[] = [
  { id: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { id: 'content', label: 'Content', to: '/content' },
  { id: 'quizzes', label: 'Quizzes', to: '/quizzes' },
  { id: 'live-classes', label: 'Live Classes', to: '/live-classes' },
  { id: 'community', label: 'Community', to: '/community' },
  { id: 'analytics', label: 'Analytics', to: '/analytics' },
  { id: 'settings', label: 'Settings', to: '/settings' },
]

const TOPIC_RESULTS: SearchResult[] = [
  {
    id: 'topic-1',
    label: 'Quadratic Equations',
    description: 'Algebra',
    to: '/content/topic/1',
  },
  {
    id: 'topic-2',
    label: 'Photosynthesis',
    description: 'Biology',
    to: '/content/topic/2',
  },
  {
    id: 'topic-3',
    label: 'World War II',
    description: 'History',
    to: '/content/topic/3',
  },
  {
    id: 'topic-4',
    label: "Newton's Laws",
    description: 'Physics',
    to: '/content/topic/4',
  },
]

const CLASS_RESULTS: SearchResult[] = [
  {
    id: 'class-1',
    label: 'Algebra II - Period 3',
    description: 'Upcoming at 2:00 PM',
    to: '/live-classes/1',
  },
  {
    id: 'class-2',
    label: 'Biology Lab',
    description: 'Upcoming tomorrow',
    to: '/live-classes/2',
  },
  {
    id: 'class-3',
    label: 'History Review',
    description: 'Recording available',
    to: '/live-classes/3',
  },
]

export function CommandPalette() {
  const { isCommandPaletteOpen, closeCommandPalette } = useKeyboardShortcuts()
  const navigate = useNavigate()

  const handleSelect = (result: SearchResult) => {
    closeCommandPalette()
    navigate({ to: result.to })
  }

  return (
    <CommandDialog
      open={isCommandPaletteOpen}
      onOpenChange={(open: boolean) => {
        if (!open) closeCommandPalette()
      }}
    >
      <Command>
        <CommandInput placeholder='Search pages, topics, classes...' />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading='Pages'>
            {PAGE_RESULTS.map((result) => (
              <CommandItem
                key={result.id}
                value={result.id}
                onSelect={() => handleSelect(result)}
              >
                {result.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading='Topics'>
            {TOPIC_RESULTS.map((result) => (
              <CommandItem
                key={result.id}
                value={`topic-${result.label}`}
                onSelect={() => handleSelect(result)}
              >
                <span>{result.label}</span>
                {result.description && (
                  <span className='ml-1 text-muted-foreground'>
                    {result.description}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading='Recent Classes'>
            {CLASS_RESULTS.map((result) => (
              <CommandItem
                key={result.id}
                value={`class-${result.label}`}
                onSelect={() => handleSelect(result)}
              >
                <span>{result.label}</span>
                {result.description && (
                  <span className='ml-1 text-muted-foreground'>
                    {result.description}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
