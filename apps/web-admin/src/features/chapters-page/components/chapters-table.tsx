import type { ChapterItem } from '@aspiron/api-client'
import { ArrowRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { ProgressBar } from '@/components/ui/progress-bar'
import { RecallBadge } from '@/components/ui/recall-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ChaptersTableProps {
  chapters: ChapterItem[]
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
  totalFiltered: number
  onSearchChange: (value: string) => void
  onSortByChange: (value: string) => void
  onSortOrderChange: () => void
  onPageChange: (page: number) => void
  onViewChapter?: (chapterId: string) => void
}

export function ChaptersTable({
  chapters,
  search,
  sortBy,
  sortOrder,
  page,
  limit,
  totalFiltered,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onPageChange,
  onViewChapter,
}: ChaptersTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalFiltered / limit))

  return (
    <div className='min-w-0 space-y-4'>
      {/* Search & sort controls */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative w-full max-w-xs'>
          <Search className='pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500' />
          <Input
            placeholder='Search chapters...'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className='h-9 border-white/10 bg-slate-900/50 pl-9 text-slate-300 text-xs placeholder:text-slate-600'
          />
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-slate-500 text-xs'>Sort by</span>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className='h-8 w-32 border-white/10 bg-slate-900/50 text-slate-300 text-xs'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='coverage'>Coverage</SelectItem>
              <SelectItem value='recall'>Recall</SelectItem>
              <SelectItem value='accuracy'>Accuracy</SelectItem>
              <SelectItem value='status'>Status</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant='ghost'
            size='xs'
            className='h-8 px-2 text-slate-400 text-xs'
            onClick={onSortOrderChange}
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </Button>
        </div>
      </div>

      {/* Table */}
      {chapters.length === 0 ? (
        <EmptyState
          title='No chapters found'
          description={
            search
              ? 'Try adjusting your search query.'
              : 'No chapters have been created for this subject.'
          }
        />
      ) : (
        <>
          <div className='min-w-0 overflow-x-auto rounded-xl border border-white/5'>
            <Table>
              <TableHeader>
                <TableRow className='border-white/5 hover:bg-transparent'>
                  <TableHead className='sticky top-0 z-10 h-9 bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
                    Chapter Name
                  </TableHead>
                  <TableHead className='sticky top-0 z-10 h-9 bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
                    Topics
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
                    Last Updated
                  </TableHead>
                  <TableHead className='sticky top-0 z-10 h-9 bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chapters.map((chapter) => (
                  <TableRow
                    key={chapter.id}
                    className='border-white/5 transition-colors hover:bg-white/[0.02]'
                  >
                    <TableCell className='px-3 py-3.5 font-medium text-slate-200 text-sm'>
                      {chapter.name}
                    </TableCell>
                    <TableCell className='px-3 py-3.5 font-mono text-slate-400 text-sm tabular-nums'>
                      {Number(chapter.published_topics)} /{' '}
                      {Number(chapter.total_topics)} published
                    </TableCell>
                    <TableCell className='px-3 py-3.5'>
                      <ProgressBar value={chapter.coverage} showLabel />
                    </TableCell>
                    <TableCell className='px-3 py-3.5'>
                      <RecallBadge value={chapter.avg_recall} />
                    </TableCell>
                    <TableCell className='px-3 py-3.5 font-mono text-slate-300 text-sm tabular-nums'>
                      {Math.round(chapter.practice_accuracy)}%
                    </TableCell>
                    <TableCell className='px-3 py-3.5'>
                      <StatusBadge status={chapter.status} />
                    </TableCell>
                    <TableCell className='px-3 py-3.5 text-slate-400 text-xs'>
                      {chapter.last_updated}
                    </TableCell>
                    <TableCell className='px-3 py-3.5'>
                      <Button
                        variant='ghost'
                        size='xs'
                        className='h-7 gap-1.5 px-2 font-medium text-indigo-400 text-xs hover:text-indigo-300'
                        onClick={() => onViewChapter?.(chapter.id)}
                      >
                        View Topics
                        <ArrowRight className='size-3' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className='flex items-center justify-between'>
            <p className='text-slate-500 text-xs'>
              Page {page} of {totalPages}
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='xs'
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className='h-7 border-white/10 text-slate-400 text-xs'
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='xs'
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className='h-7 border-white/10 text-slate-400 text-xs'
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
