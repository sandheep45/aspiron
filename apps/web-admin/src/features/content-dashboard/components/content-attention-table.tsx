import type { ContentDashboardAttentionItem } from '@aspiron/api-client'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IssueBadge } from '@/features/content-dashboard/components/issue-badge'
import { AttentionTableSkeleton } from '@/features/content-dashboard/components/loading-skeleton'

type SortField = 'topic' | 'issue' | 'students'
type SortOrder = 'asc' | 'desc'

interface ContentAttentionTableProps {
  items: ContentDashboardAttentionItem[]
  total: number
  loading?: boolean
  onViewTopic?: (id: string) => void
  search: string
  onSearchChange: (value: string) => void
  issueFilter: string
  onIssueFilterChange: (value: string) => void
  sortBy: SortField
  sortOrder: SortOrder
  onSortChange: (field: SortField) => void
  page: number
  limit: number
  onPageChange: (page: number) => void
}

const issueOptions = [
  { value: '', label: 'All Issues' },
  { value: 'Low Recall', label: 'Low Recall' },
  { value: 'Poor Accuracy', label: 'Poor Accuracy' },
  { value: 'High Drop-off', label: 'High Drop-off' },
  { value: 'Weak Fundamentals', label: 'Weak Fundamentals' },
]

export function ContentAttentionTable({
  items,
  total,
  loading,
  onViewTopic,
  search,
  onSearchChange,
  issueFilter,
  onIssueFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  page,
  limit,
  onPageChange,
}: ContentAttentionTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null
    return (
      <span className='ml-1 text-[0.55rem]'>
        {sortOrder === 'asc' ? '\u25B2' : '\u25BC'}
      </span>
    )
  }

  if (loading) {
    return <AttentionTableSkeleton />
  }

  return (
    <section>
      <div className='mb-4 flex flex-wrap items-center gap-3'>
        <div className='relative flex-1 sm:max-w-xs'>
          <Search className='pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-500' />
          <Input
            variant='form'
            placeholder='Search topics or issues...'
            className='h-8 pl-8 text-xs'
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value)
            }}
          />
        </div>

        <div className='w-36'>
          <Select
            value={issueFilter}
            onValueChange={(v) => {
              onIssueFilterChange(v ?? '')
            }}
          >
            <SelectTrigger size='sm' className='h-8 w-full text-xs'>
              <SelectValue placeholder='All Issues' />
            </SelectTrigger>
            <SelectContent>
              {issueOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className='flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-10 text-center backdrop-blur-sm'>
          <div className='flex size-12 items-center justify-center rounded-full bg-slate-800/50'>
            <Search className='size-5 text-slate-500' />
          </div>
          <div>
            <p className='font-medium text-slate-300 text-sm'>
              No items need attention
            </p>
            <p className='mt-1 text-slate-500 text-xs'>
              Try adjusting your search or filters.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className='overflow-hidden rounded-xl border border-white/5'>
            <Table>
              <TableHeader>
                <TableRow className='border-white/5 hover:bg-transparent'>
                  <TableHead
                    className='sticky top-0 z-10 h-9 cursor-pointer bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'
                    onClick={() => onSortChange('topic')}
                  >
                    Topic
                    <SortIcon field='topic' />
                  </TableHead>
                  <TableHead
                    className='sticky top-0 z-10 h-9 cursor-pointer bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'
                    onClick={() => onSortChange('issue')}
                  >
                    Issue Detected
                    <SortIcon field='issue' />
                  </TableHead>
                  <TableHead className='sticky top-0 z-10 h-9 bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
                    Reason
                  </TableHead>
                  <TableHead
                    className='sticky top-0 z-10 h-9 cursor-pointer bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'
                    onClick={() => onSortChange('students')}
                  >
                    Students
                    <SortIcon field='students' />
                  </TableHead>
                  <TableHead className='sticky top-0 z-10 h-9 bg-slate-900 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className='border-white/5 transition-colors hover:bg-white/[0.02]'
                  >
                    <TableCell className='max-w-[200px] truncate px-3 py-3 font-medium text-slate-200 text-sm'>
                      {item.topic}
                    </TableCell>
                    <TableCell className='px-3 py-3'>
                      <IssueBadge issue={item.issue} />
                    </TableCell>
                    <TableCell className='max-w-[220px] truncate px-3 py-3 text-slate-400 text-xs'>
                      {item.reason}
                    </TableCell>
                    <TableCell className='px-3 py-3'>
                      <span className='font-mono text-slate-400 text-sm tabular-nums'>
                        {Number(item.students_affected)}
                      </span>
                    </TableCell>
                    <TableCell className='px-3 py-3'>
                      <Button
                        variant='ghost'
                        size='xs'
                        className='h-7 px-2 font-medium text-indigo-400 text-xs hover:text-indigo-300'
                        onClick={() => onViewTopic?.(item.id)}
                      >
                        View Topic
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className='flex items-center justify-between pt-3'>
            <p className='text-slate-500 text-xs'>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)}{' '}
              of {total}
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={page <= 1}
                onClick={() => onPageChange(Math.max(1, page - 1))}
                className='h-7 text-xs'
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className='h-7 text-xs'
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
