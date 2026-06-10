import { CheckCheck, Copy, Download, Eye, EyeOff, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuickActionsBarProps {
  onPreviewAsStudent: () => void
  onMarkReviewed: () => void
  onTemporarilyHide: () => void
  onGenerateAiSummary: () => void
  onExportNotes: () => void
  onDuplicateNotes: () => void
  previewDisabled?: boolean
  generateDisabled?: boolean
  exportDisabled?: boolean
  duplicateDisabled?: boolean
}

export function QuickActionsBar({
  onPreviewAsStudent,
  onMarkReviewed,
  onTemporarilyHide,
  onGenerateAiSummary,
  onExportNotes,
  onDuplicateNotes,
  previewDisabled,
  generateDisabled,
  exportDisabled,
  duplicateDisabled,
}: QuickActionsBarProps) {
  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6'>
        <Button
          variant='outline'
          size='sm'
          className='h-auto flex-col gap-1.5 py-3'
          onClick={onPreviewAsStudent}
          disabled={previewDisabled}
        >
          <Eye className='size-4' />
          <span className='font-normal text-[0.625rem]'>
            Preview as Student
          </span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='h-auto flex-col gap-1.5 py-3'
          onClick={onMarkReviewed}
        >
          <CheckCheck className='size-4' />
          <span className='font-normal text-[0.625rem]'>Mark as Reviewed</span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='h-auto flex-col gap-1.5 py-3'
          onClick={onTemporarilyHide}
        >
          <EyeOff className='size-4' />
          <span className='font-normal text-[0.625rem]'>Temporarily Hide</span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='h-auto flex-col gap-1.5 py-3'
          onClick={onGenerateAiSummary}
          disabled={generateDisabled}
        >
          <Sparkles className='size-4' />
          <span className='font-normal text-[0.625rem]'>
            Generate AI Summary
          </span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='h-auto flex-col gap-1.5 py-3'
          onClick={onExportNotes}
          disabled={exportDisabled}
        >
          <Download className='size-4' />
          <span className='font-normal text-[0.625rem]'>Export Notes</span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='h-auto flex-col gap-1.5 py-3'
          onClick={onDuplicateNotes}
          disabled={duplicateDisabled}
        >
          <Copy className='size-4' />
          <span className='font-normal text-[0.625rem]'>Duplicate Notes</span>
        </Button>
      </div>
    </div>
  )
}
