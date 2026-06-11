import { Eye, FileX, Loader2, Send } from 'lucide-react'
import { useAppForm } from '@/components/forms/form-core'
import { Button } from '@/components/ui/button'

interface TeacherNotesEditorProps {
  content: string
  status: string
  onSave: (content: string) => Promise<void>
  onPublish: () => Promise<void>
  onUnpublish: () => Promise<void>
  onPreview: () => void
  isSaving: boolean
  isPublishing: boolean
  isUnpublishing: boolean
}

export function TeacherNotesEditor({
  content,
  status,
  onSave,
  onPublish,
  onUnpublish,
  onPreview,
  isSaving,
  isPublishing,
  isUnpublishing,
}: TeacherNotesEditorProps) {
  const form = useAppForm({
    defaultValues: { notes_content: content },
    onSubmit: async ({ value }) => {
      await onSave(value.notes_content)
    },
  })

  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
      <form.AppForm>
        <form.AppField name='notes_content'>
          {(field) => (
            <field.FormTiptapEditor placeholder='Start writing your notes here...' />
          )}
        </form.AppField>
      </form.AppForm>

      <div className='flex flex-wrap items-center gap-2'>
        <Button
          variant='brand'
          size='sm'
          onClick={() => form.handleSubmit()}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className='size-3.5 animate-spin' />
          ) : (
            <Send className='size-3.5' />
          )}
          Save Changes
        </Button>
        <Button
          variant='secondary'
          size='sm'
          onClick={onPublish}
          disabled={isPublishing || status === 'published'}
        >
          {isPublishing ? (
            <Loader2 className='size-3.5 animate-spin' />
          ) : (
            <Send className='size-3.5' />
          )}
          Publish Notes
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={onUnpublish}
          disabled={isUnpublishing || status === 'draft'}
        >
          {isUnpublishing ? (
            <Loader2 className='size-3.5 animate-spin' />
          ) : (
            <FileX className='size-3.5' />
          )}
          Unpublish Notes
        </Button>
        <Button variant='ghost' size='sm' onClick={onPreview}>
          <Eye className='size-3.5' />
          Preview Student View
        </Button>
      </div>
    </div>
  )
}
