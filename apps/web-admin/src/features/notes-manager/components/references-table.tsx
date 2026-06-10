import type { Reference } from '@aspiron/api-client'
import {
  BookOpen,
  ExternalLink,
  FileSearch,
  FileText,
  Link,
  Loader2,
  Plus,
  Trash2,
  Video,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ReferenceDialog } from '@/features/notes-manager/components/reference-dialog'

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  PDF: FileText,
  Document: FileText,
  URL: Link,
  Video: Video,
  'Research Paper': BookOpen,
}

const typeColors: Record<string, string> = {
  PDF: 'text-red-400 bg-red-500/10',
  Document: 'text-blue-400 bg-blue-500/10',
  URL: 'text-sky-400 bg-sky-500/10',
  Video: 'text-purple-400 bg-purple-500/10',
  'Research Paper': 'text-emerald-400 bg-emerald-500/10',
}

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function getDisplaySource(ref: Reference): string {
  if (ref.source && !isUrl(ref.source)) return ref.source
  return 'Uploaded File'
}

function _getFileName(url: string): string {
  try {
    const segments = new URL(url).pathname.split('/')
    const last = segments[segments.length - 1] ?? ''
    const idx = last.indexOf('_')
    if (idx > 0 && idx < last.length - 1) {
      const uuid = last.slice(0, idx)
      if (/^[a-f0-9-]{36}$/i.test(uuid)) return last.slice(idx + 1)
    }
    return last
  } catch {
    return url
  }
}

interface ReferencesTableProps {
  references: Reference[] | undefined
  loading: boolean
  topicId: string
  onAdd: (data: {
    title: string
    source: string
    referenceType: string
    url: string
  }) => Promise<void>
  onDelete: (referenceId: string) => Promise<void>
  onToggleVisibility: (referenceId: string) => Promise<void>
  isDeleting: boolean
}

export function ReferencesTable({
  references,
  loading,
  topicId: _topicId,
  onAdd,
  onDelete,
  onToggleVisibility,
  isDeleting,
}: ReferencesTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  if (loading) {
    return (
      <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
        <div className='flex items-center justify-end'>
          <div className='h-7 w-28 animate-pulse rounded bg-slate-800' />
        </div>
        <div className='animate-pulse space-y-2'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='flex items-center gap-4 rounded-lg bg-slate-800/30 px-4'
              style={{ height: 76 }}
            >
              <div className='size-8 shrink-0 rounded-lg bg-slate-700' />
              <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
                <div className='h-3.5 w-3/5 rounded bg-slate-700' />
                <div className='h-3 w-1/4 rounded bg-slate-700' />
              </div>
              <div className='h-5 w-8 rounded bg-slate-700' />
              <div className='flex gap-2'>
                <div className='size-7 rounded bg-slate-700' />
                <div className='size-7 rounded bg-slate-700' />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
      <div className='flex items-center justify-end'>
        <Button variant='brand' size='sm' onClick={() => setDialogOpen(true)}>
          <Plus className='size-3.5' />
          Add Reference
        </Button>
      </div>

      {!references || references.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title='No External References'
          description='Add your first supporting resource for students.'
          actions={
            <Button
              variant='brand'
              size='sm'
              onClick={() => setDialogOpen(true)}
            >
              <Plus className='size-3.5' />
              Add Reference
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className='border-white/5'>
              <TableHead className='text-[0.625rem] text-slate-400'>
                Resource
              </TableHead>
              <TableHead className='text-[0.625rem] text-slate-400'>
                Source
              </TableHead>
              <TableHead className='text-[0.625rem] text-slate-400'>
                Type
              </TableHead>
              <TableHead className='w-20 text-center text-[0.625rem] text-slate-400'>
                Visibility
              </TableHead>
              <TableHead className='w-24 text-right text-[0.625rem] text-slate-400'>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {references.map((ref) => {
              const TypeIcon = typeIcons[ref.reference_type] ?? Link
              const typeColor =
                typeColors[ref.reference_type] ??
                'text-slate-400 bg-slate-500/10'
              const sourceLabel = getDisplaySource(ref)

              return (
                <TableRow
                  key={ref.id}
                  className='border-white/5 transition-colors hover:bg-white/[0.02]'
                  style={{ height: 76 }}
                >
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${typeColor}`}
                      >
                        <TypeIcon className='size-4' />
                      </div>
                      <div className='flex min-w-0 flex-col gap-0.5'>
                        <span className='truncate font-medium text-sm text-white'>
                          {ref.title}
                        </span>
                        <a
                          href={ref.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-1 text-[0.625rem] text-sky-400 transition-colors hover:text-sky-300'
                        >
                          <ExternalLink className='size-3 shrink-0' />
                          Open link
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className='text-slate-400 text-xs'>
                      {sourceLabel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-[0.625rem] ${typeColor}`}
                    >
                      <TypeIcon className='size-3' />
                      {ref.reference_type}
                    </span>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Switch
                      size='sm'
                      checked={ref.visible}
                      onCheckedChange={() => onToggleVisibility(ref.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon-sm'
                        onClick={() => onDelete(ref.id)}
                        disabled={isDeleting}
                        className='hover:bg-red-500/10 hover:text-red-400'
                      >
                        {isDeleting ? (
                          <Loader2 className='size-3.5 animate-spin' />
                        ) : (
                          <Trash2 className='size-3.5' />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <ReferenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={async (data) => {
          await onAdd(data)
          setDialogOpen(false)
        }}
      />
    </div>
  )
}
