import type { SubjectPageItem } from '@aspiron/api-client'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ProgressBar } from '@/components/ui/progress-bar'
import { RecallBadge } from '@/components/ui/recall-badge'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SubjectsTableProps {
  subjects: SubjectPageItem[]
  onViewChapters?: (subjectId: string) => void
}

export function SubjectsTable({
  subjects,
  onViewChapters,
}: SubjectsTableProps) {
  if (subjects.length === 0) {
    return (
      <EmptyState
        title='No subjects found'
        description='Subjects will appear once content is added.'
      />
    )
  }

  return (
    <div className='min-w-0 overflow-x-auto rounded-xl border border-white/5'>
      <Table>
        <TableHeader>
          <TableRow className='border-white/5 hover:bg-transparent'>
            <TableHead className='sticky top-0 z-10 h-9 bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
              Subject Name
            </TableHead>
            <TableHead className='sticky top-0 z-10 h-9 bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
              Chapters
            </TableHead>
            <TableHead className='sticky top-0 z-10 h-9 bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
              Topics Published
            </TableHead>
            <TableHead className='sticky top-0 z-10 h-9 bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
              Coverage
            </TableHead>
            <TableHead className='sticky top-0 z-10 h-9 bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
              Avg Recall
            </TableHead>
            <TableHead className='sticky top-0 z-10 h-9 bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
              Practice Accuracy
            </TableHead>
            <TableHead className='sticky top-0 z-10 h-9 bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
              Status
            </TableHead>
            <TableHead className='sticky top-0 z-10 h-9 bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subject) => (
            <TableRow
              key={subject.id}
              className='border-white/5 transition-colors hover:bg-white/[0.02]'
            >
              <TableCell className='px-3 py-3.5 font-medium text-slate-200 text-sm'>
                {subject.name}
              </TableCell>
              <TableCell className='px-3 py-3.5 font-mono text-slate-400 text-sm tabular-nums'>
                {Number(subject.chapters_count)}
              </TableCell>
              <TableCell className='px-3 py-3.5 font-mono text-slate-400 text-sm tabular-nums'>
                {Number(subject.topics_published)}
              </TableCell>
              <TableCell className='px-3 py-3.5'>
                <div className='flex items-center gap-3'>
                  <div className='flex-1'>
                    <ProgressBar value={subject.coverage} />
                  </div>
                  <span className='w-10 text-right font-mono text-slate-400 text-xs tabular-nums'>
                    {Math.round(subject.coverage)}%
                  </span>
                </div>
              </TableCell>
              <TableCell className='px-3 py-3.5'>
                <RecallBadge value={subject.average_recall} />
              </TableCell>
              <TableCell className='px-3 py-3.5 font-mono text-sm tabular-nums'>
                {subject.practice_accuracy != null ? (
                  <span className='text-slate-300'>
                    {Math.round(subject.practice_accuracy * 100)}%
                  </span>
                ) : (
                  <span className='text-slate-600'>—</span>
                )}
              </TableCell>
              <TableCell className='px-3 py-3.5'>
                <StatusBadge status={subject.status} />
              </TableCell>
              <TableCell className='px-3 py-3.5'>
                <Button
                  variant='ghost'
                  size='xs'
                  className='h-7 gap-1.5 px-2 font-medium text-indigo-400 text-xs hover:text-indigo-300'
                  onClick={() => onViewChapters?.(subject.id)}
                >
                  View Chapters
                  <ArrowRight className='size-3' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
