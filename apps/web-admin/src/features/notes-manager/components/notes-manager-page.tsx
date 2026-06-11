import {
  useAiNotesQuery,
  useApproveAiNotesMutation,
  useCreateReferenceMutation,
  useDeleteReferenceMutation,
  useNotesOverviewQuery,
  usePublishNotesMutation,
  useReferencesQuery,
  useTeacherNotesQuery,
  useToggleReferenceVisibilityMutation,
  useUnpublishNotesMutation,
  useUpdateTeacherNotesMutation,
} from '@aspiron/tanstack-client'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/ui/section-header'
import { AiNotesReview } from '@/features/notes-manager/components/ai-notes-review'
import { NotesOverviewCard } from '@/features/notes-manager/components/notes-overview-card'
import { QuickActionsBar } from '@/features/notes-manager/components/quick-actions-bar'
import { ReferencesTable } from '@/features/notes-manager/components/references-table'
import { StatusBadge } from '@/features/notes-manager/components/status-badge'
import { TeacherNotesEditor } from '@/features/notes-manager/components/teacher-notes-editor'

interface NotesManagerPageProps {
  topicId: string
  onBack: () => void
}

export function NotesManagerPage({ topicId, onBack }: NotesManagerPageProps) {
  const overview = useNotesOverviewQuery({ args: { topicId } })
  const teacherNotes = useTeacherNotesQuery({ args: { topicId } })
  const aiNotes = useAiNotesQuery({ args: { topicId } })
  const references = useReferencesQuery({ args: { topicId } })

  const updateMutation = useUpdateTeacherNotesMutation()
  const publishMutation = usePublishNotesMutation()
  const unpublishMutation = useUnpublishNotesMutation()
  const approveMutation = useApproveAiNotesMutation()
  const createRefMutation = useCreateReferenceMutation()
  const deleteRefMutation = useDeleteReferenceMutation()
  const toggleVisibilityMutation = useToggleReferenceVisibilityMutation()

  const handleRefresh = useCallback(() => {
    overview.refetch()
    teacherNotes.refetch()
    aiNotes.refetch()
    references.refetch()
  }, [overview, teacherNotes, aiNotes, references])

  const handleSave = async (content: string) => {
    try {
      await updateMutation.mutateAsync({ topicId, content })
      toast.success('Notes saved')
    } catch {
      toast.error('Failed to save notes')
    }
  }

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync({ topicId })
      toast.success('Notes published')
    } catch {
      toast.error('Failed to publish notes')
    }
  }

  const handleUnpublish = async () => {
    try {
      await unpublishMutation.mutateAsync({ topicId })
      toast.success('Notes unpublished')
    } catch {
      toast.error('Failed to unpublish notes')
    }
  }

  const handleApproveAiNote = async (noteId: string) => {
    try {
      await approveMutation.mutateAsync({ topicId, noteId })
      toast.success('AI note approved')
    } catch {
      toast.error('Failed to approve AI note')
    }
  }

  const handleEditAiNote = useCallback(
    (_note: {
      id: string
      title: string
      content: string
      status: string
      generated_at: string
    }) => {
      // In a production app, this would open the editor with AI content
      // For now, we treat this as a no-op placeholder
    },
    [],
  )

  const handleRejectAiNote = async (_noteId: string) => {
    // Placeholder — would call a reject/regenerate endpoint
    // For now, just invalidate AI notes to trigger a fresh fetch
    aiNotes.refetch()
  }

  const handleAddReference = async (data: {
    title: string
    source: string
    referenceType: string
    url: string
  }) => {
    try {
      await createRefMutation.mutateAsync({
        topicId,
        ...data,
      })
      toast.success('Reference added')
    } catch {
      toast.error('Failed to add reference')
    }
  }

  const handleDeleteReference = async (referenceId: string) => {
    try {
      await deleteRefMutation.mutateAsync({ topicId, referenceId })
      toast.success('Reference deleted')
    } catch {
      toast.error('Failed to delete reference')
    }
  }

  const handleToggleVisibility = async (referenceId: string) => {
    try {
      await toggleVisibilityMutation.mutateAsync({ topicId, referenceId })
      toast.success('Visibility updated')
    } catch {
      toast.error('Failed to update visibility')
    }
  }

  const status = teacherNotes.data?.status ?? 'draft'

  return (
    <div className='flex w-full flex-col gap-8 pb-10'>
      {/* Back Navigation */}
      <button
        type='button'
        onClick={onBack}
        className='group flex w-fit items-center gap-1.5 text-slate-400 text-sm transition-colors hover:text-white'
      >
        <ArrowLeft className='size-4 transition-transform group-hover:-translate-x-0.5' />
        Back to Topic Detail
      </button>

      {/* Page Header */}
      <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-3'>
            <h1 className='font-semibold text-2xl text-white'>Notes Manager</h1>
            <StatusBadge status={status} />
          </div>
          <p className='text-slate-400 text-sm'>
            Curate, review, and control notes shown to students
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon-sm' onClick={handleRefresh}>
            <RefreshCw className='size-3.5' />
          </Button>
        </div>
      </header>

      {/* Section 1: Notes Overview */}
      <section>
        <SectionHeader
          title='Notes Overview'
          accent='bg-indigo-500'
          description='Quick content health snapshot'
        />
        {overview.isLoading ? (
          <NotesOverviewCard
            data={{
              teacher_notes_status: '',
              ai_notes_status: '',
              external_references_count: 0,
              student_engagement: 0,
            }}
            loading
          />
        ) : overview.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {overview.error?.message || 'Failed to load overview'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => overview.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : overview.data ? (
          <NotesOverviewCard data={overview.data} />
        ) : null}
      </section>

      {/* Section 2: Teacher Notes */}
      <section>
        <SectionHeader
          title='Teacher Notes'
          accent='bg-purple-500'
          description='Primary editing workspace'
        />

        {teacherNotes.isLoading ? (
          <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-6 backdrop-blur-sm'>
            <div className='flex animate-pulse items-center gap-3'>
              <div className='size-10 rounded-lg bg-slate-800' />
              <div className='flex flex-1 flex-col gap-1.5'>
                <div className='h-4 w-28 rounded bg-slate-800' />
                <div className='h-3 w-20 rounded bg-slate-800' />
              </div>
            </div>
            <div className='flex animate-pulse items-center gap-1 rounded-lg bg-slate-800/50 p-2'>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className='size-7 rounded bg-slate-700' />
              ))}
            </div>
            <div className='flex animate-pulse flex-col gap-3 rounded-lg bg-slate-800/30 p-4'>
              <div className='h-4 w-full rounded bg-slate-800' />
              <div className='h-4 w-3/4 rounded bg-slate-800' />
              <div className='h-4 w-5/6 rounded bg-slate-800' />
            </div>
          </div>
        ) : teacherNotes.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {teacherNotes.error?.message || 'Failed to load teacher notes'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => teacherNotes.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <TeacherNotesEditor
            content={teacherNotes.data?.content ?? ''}
            status={status}
            onSave={handleSave}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onPreview={() => {}}
            isSaving={updateMutation.isPending}
            isPublishing={publishMutation.isPending}
            isUnpublishing={unpublishMutation.isPending}
          />
        )}
      </section>

      {/* Section 3: AI Generated Notes */}
      <section>
        <SectionHeader
          title='AI Generated Notes'
          accent='bg-sky-500'
          description='Review AI-generated notes before publishing'
        />
        <AiNotesReview
          key={aiNotes.dataUpdatedAt}
          notes={aiNotes.data}
          loading={aiNotes.isLoading}
          onApprove={handleApproveAiNote}
          onEdit={handleEditAiNote}
          onReject={handleRejectAiNote}
          isApproving={approveMutation.isPending}
        />
      </section>

      {/* Section 4: External References */}
      <section>
        <SectionHeader
          title='External References'
          accent='bg-amber-500'
          description='Manage supporting resources'
        />
        <ReferencesTable
          references={references.data}
          loading={references.isLoading}
          topicId={topicId}
          onAdd={handleAddReference}
          onDelete={handleDeleteReference}
          onToggleVisibility={handleToggleVisibility}
          isDeleting={deleteRefMutation.isPending}
        />
      </section>

      {/* Section 5: Quick Actions */}
      <section>
        <SectionHeader
          title='Quick Actions'
          accent='bg-emerald-500'
          description='Common educator workflows'
        />
        <QuickActionsBar
          onPreviewAsStudent={() => {}}
          onMarkReviewed={handlePublish}
          onTemporarilyHide={handleUnpublish}
          onGenerateAiSummary={() => {}}
          onExportNotes={() => {}}
          onDuplicateNotes={() => {}}
          previewDisabled
          generateDisabled
          exportDisabled
          duplicateDisabled
        />
      </section>
    </div>
  )
}
