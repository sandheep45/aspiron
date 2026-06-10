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
  isAdding: boolean
  isDeleting: boolean
}

export function ReferencesTable({
  references,
  loading,
  topicId: _topicId,
  onAdd,
  onDelete,
  onToggleVisibility,
  isAdding,
  isDeleting,
}: ReferencesTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  if (loading) {
    return (
      <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
        <div className='flex items-center justify-end'>
          <div className='h-7 w-28 animate-pulse rounded bg-slate-800' />
        </div>
        <div className='animate-pulse space-y-3'>
          <div className='flex gap-4 rounded-lg bg-slate-800/30 p-3'>
            <div className='h-3 w-1/3 rounded bg-slate-700' />
            <div className='h-3 w-1/4 rounded bg-slate-700' />
            <div className='h-3 w-20 rounded bg-slate-700' />
            <div className='h-3 w-16 rounded bg-slate-700' />
            <div className='h-3 w-24 rounded bg-slate-700' />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='flex gap-4 rounded-lg p-3'>
              <div className='h-3 w-1/3 rounded bg-slate-800' />
              <div className='h-3 w-1/4 rounded bg-slate-800' />
              <div className='h-3 w-20 rounded bg-slate-800' />
              <div className='h-3 w-16 rounded bg-slate-800' />
              <div className='flex gap-2'>
                <div className='size-6 rounded bg-slate-800' />
                <div className='size-6 rounded bg-slate-800' />
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
          title='No references linked'
          description='Add external resources to supplement the topic content.'
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className='border-white/5'>
              <TableHead className='text-[0.625rem] text-slate-400'>
                Title
              </TableHead>
              <TableHead className='text-[0.625rem] text-slate-400'>
                Source
              </TableHead>
              <TableHead className='text-[0.625rem] text-slate-400'>
                Type
              </TableHead>
              <TableHead className='text-[0.625rem] text-slate-400'>
                Visibility
              </TableHead>
              <TableHead className='w-24 text-[0.625rem] text-slate-400'>
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
              return (
                <TableRow key={ref.id} className='border-white/5'>
                  <TableCell className='font-medium text-white text-xs'>
                    {ref.title}
                  </TableCell>
                  <TableCell className='text-slate-400 text-xs'>
                    {ref.source}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-[0.625rem] ${typeColor}`}
                    >
                      <TypeIcon className='size-3' />
                      {ref.reference_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      size='sm'
                      checked={ref.visible}
                      onCheckedChange={() => onToggleVisibility(ref.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1'>
                      <a
                        href={ref.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex size-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'
                      >
                        <ExternalLink className='size-3' />
                      </a>
                      <Button
                        variant='ghost'
                        size='icon-xs'
                        onClick={() => onDelete(ref.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className='size-3 animate-spin' />
                        ) : (
                          <Trash2 className='size-3 text-red-400' />
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
        isSubmitting={isAdding}
      />
    </div>
  )
}
