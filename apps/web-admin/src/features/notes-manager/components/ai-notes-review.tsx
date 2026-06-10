import type { AiNote } from '@aspiron/api-client'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/features/notes-manager/components/status-badge'

interface AiNotesReviewProps {
  notes: AiNote[] | undefined
  loading: boolean
  onApprove: (noteId: string) => Promise<void>
  onEdit: (note: AiNote) => void
  onReject: (noteId: string) => Promise<void>
  isApproving: boolean
}

function AiNotePreview({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false,
  })

  if (!editor) return null

  return (
    <div className='tiptap-editor overflow-hidden rounded-lg border border-white/5 bg-slate-950/40'>
      <EditorContent editor={editor} />
    </div>
  )
}

export function AiNotesReview({
  notes,
  loading,
  onApprove,
  onEdit,
  onReject,
  isApproving,
}: AiNotesReviewProps) {
  if (loading) {
    return (
      <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-6 backdrop-blur-sm'>
        <div className='flex items-center gap-3'>
          <div className='size-10 rounded-lg bg-slate-800' />
          <div className='flex flex-1 flex-col gap-1.5'>
            <div className='h-4 w-28 rounded bg-slate-800' />
            <div className='h-3 w-20 rounded bg-slate-800' />
          </div>
        </div>
        <div className='flex animate-pulse flex-col gap-3 rounded-lg bg-slate-800/30 p-4'>
          <div className='h-4 w-full rounded bg-slate-800' />
          <div className='h-4 w-3/4 rounded bg-slate-800' />
          <div className='h-4 w-5/6 rounded bg-slate-800' />
        </div>
      </div>
    )
  }

  if (!notes || notes.length === 0) {
    return (
      <div className='rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
        <EmptyState
          icon={Sparkles}
          title='No AI-generated notes available'
          description='AI notes will appear here once generated for this topic.'
        />
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
      <div className='flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4'>
        <AlertTriangle className='mt-0.5 size-4 shrink-0 text-amber-400' />
        <p className='text-amber-300 text-xs'>
          AI-generated notes must be reviewed and approved before publishing.
        </p>
      </div>

      <div className='space-y-4'>
        {notes.map((note) => (
          <div
            key={note.id}
            className='overflow-hidden rounded-xl border border-white/5 bg-slate-950/40'
          >
            <div className='flex items-center justify-between border-white/5 border-b px-4 py-3'>
              <div className='flex items-center gap-2'>
                <span className='font-medium text-white text-xs'>
                  {note.title}
                </span>
                <StatusBadge status={note.status} />
              </div>
              <span className='text-[0.625rem] text-slate-500'>
                Generated:{' '}
                {new Date(note.generated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className='px-4 py-3'>
              <AiNotePreview content={note.content} />
            </div>

            <div className='flex items-center justify-end gap-2 border-white/5 border-t px-4 py-3'>
              <Button
                variant='brand'
                size='xs'
                onClick={() => onApprove(note.id)}
                disabled={isApproving || note.status === 'approved'}
              >
                {isApproving ? (
                  <Loader2 className='size-3 animate-spin' />
                ) : (
                  <CheckCircle className='size-3' />
                )}
                Approve &amp; Publish
              </Button>
              <Button variant='outline' size='xs' onClick={() => onEdit(note)}>
                <Edit className='size-3' />
                Edit Before Publishing
              </Button>
              <Button
                variant='ghost'
                size='xs'
                onClick={() => onReject(note.id)}
              >
                <RotateCcw className='size-3' />
                Reject &amp; Regenerate
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
