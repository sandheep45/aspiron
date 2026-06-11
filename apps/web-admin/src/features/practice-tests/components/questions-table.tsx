import type { QuestionItem, QuestionsQueryParams } from '@aspiron/api-client'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  FileArchive,
  Pencil,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useCallback, useState } from 'react'
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
import { DifficultyBadge } from '@/features/practice-tests/components/difficulty-badge'
import { QuestionsTableSkeleton } from '@/features/practice-tests/components/loading-skeleton'
import { QuestionStatusBadge } from '@/features/practice-tests/components/question-status-badge'
import { cn } from '@/lib/utils'

interface QuestionsTableProps {
  items: QuestionItem[] | undefined
  total: number
  page: number
  limit: number
  totalPages: number
  loading?: boolean
  onParamsChange: (params: Partial<QuestionsQueryParams>) => void
  className?: string
}

const questionTypes = [
  'MCQ',
  'Numerical',
  'Assertion Reason',
  'Multiple Select',
  'Subjective',
]
const difficulties = ['Easy', 'Medium', 'Hard']
const statuses = ['Active', 'Draft', 'Archived']

function SortIcon({ direction }: { direction: 'asc' | 'desc' | undefined }) {
  if (!direction) return null
  return direction === 'asc' ? (
    <ArrowUp className='size-3 text-slate-400' />
  ) : (
    <ArrowDown className='size-3 text-slate-400' />
  )
}

function CorrectRateDisplay({ rate }: { rate: number | null | undefined }) {
  if (rate === null || rate === undefined) {
    return <span className='text-slate-500 text-xs'>\u2014</span>
  }
  const color =
    rate >= 80
      ? 'text-emerald-400'
      : rate >= 60
        ? 'text-amber-400'
        : 'text-red-400'
  return (
    <span className={cn('font-medium text-xs tabular-nums', color)}>
      {rate}%
    </span>
  )
}

export function QuestionsTable({
  items,
  total,
  page,
  limit,
  totalPages,
  loading,
  onParamsChange,
  className,
}: QuestionsTableProps) {
  const [searchValue, setSearchValue] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value)
      onParamsChange({ search: value || undefined, page: 1 })
    },
    [onParamsChange],
  )

  const handleTypeFilter = useCallback(
    (value: string) => {
      setTypeFilter(value)
      onParamsChange({ question_type: value || undefined, page: 1 })
    },
    [onParamsChange],
  )

  const handleDifficultyFilter = useCallback(
    (value: string) => {
      setDifficultyFilter(value)
      onParamsChange({ difficulty: value || undefined, page: 1 })
    },
    [onParamsChange],
  )

  const handleStatusFilter = useCallback(
    (value: string) => {
      setStatusFilter(value)
      onParamsChange({ status: value || undefined, page: 1 })
    },
    [onParamsChange],
  )

  const handleSort = useCallback(
    (column: string) => {
      const newOrder =
        sortBy === column && sortOrder === 'desc' ? 'asc' : 'desc'
      setSortBy(column)
      setSortOrder(newOrder)
      onParamsChange({ sort_by: column, sort_order: newOrder })
    },
    [sortBy, sortOrder, onParamsChange],
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        onParamsChange({ page: newPage })
      }
    },
    [totalPages, onParamsChange],
  )

  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative min-w-[200px] flex-1'>
          <Search className='pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-500' />
          <Input
            placeholder='Search questions...'
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className='h-8 pl-8 text-xs'
          />
        </div>
        <Select value={typeFilter} onValueChange={handleTypeFilter}>
          <SelectTrigger size='sm' className='h-8 w-36 text-xs'>
            <SlidersHorizontal className='size-3' />
            <SelectValue placeholder='Type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Types</SelectItem>
            {questionTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={handleDifficultyFilter}>
          <SelectTrigger size='sm' className='h-8 w-36 text-xs'>
            <SlidersHorizontal className='size-3' />
            <SelectValue placeholder='Difficulty' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Difficulties</SelectItem>
            {difficulties.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger size='sm' className='h-8 w-36 text-xs'>
            <SlidersHorizontal className='size-3' />
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-2xl border border-white/5'>
        {loading ? (
          <QuestionsTableSkeleton />
        ) : items && items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className='border-white/5 hover:bg-transparent'>
                <TableHead className='h-9 text-[0.65rem] text-slate-500 uppercase'>
                  Identifier
                </TableHead>
                <TableHead className='h-9 text-[0.65rem] text-slate-500 uppercase'>
                  Question
                </TableHead>
                <TableHead className='h-9 text-[0.65rem] text-slate-500 uppercase'>
                  Type
                </TableHead>
                <TableHead
                  className='h-9 cursor-pointer select-none text-[0.65rem] text-slate-500 uppercase'
                  onClick={() => handleSort('difficulty')}
                >
                  <div className='flex items-center gap-1'>
                    Difficulty
                    {sortBy === 'difficulty' && (
                      <SortIcon direction={sortOrder} />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className='h-9 cursor-pointer select-none text-[0.65rem] text-slate-500 uppercase'
                  onClick={() => handleSort('correct_rate')}
                >
                  <div className='flex items-center gap-1'>
                    Correct Rate
                    {sortBy === 'correct_rate' && (
                      <SortIcon direction={sortOrder} />
                    )}
                  </div>
                </TableHead>
                <TableHead className='h-9 text-[0.65rem] text-slate-500 uppercase'>
                  Status
                </TableHead>
                <TableHead className='h-9 text-right text-[0.65rem] text-slate-500 uppercase'>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((question) => (
                <TableRow
                  key={question.id}
                  className='border-white/5 transition-colors hover:bg-white/[0.02]'
                >
                  <TableCell className='font-mono text-[0.65rem] text-slate-500'>
                    {question.identifier}
                  </TableCell>
                  <TableCell className='max-w-xs truncate text-slate-300 text-xs'>
                    {question.question}
                  </TableCell>
                  <TableCell>
                    <span className='rounded-md bg-indigo-500/10 px-2 py-0.5 text-[0.65rem] text-indigo-400'>
                      {question.question_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DifficultyBadge difficulty={question.difficulty} />
                  </TableCell>
                  <TableCell>
                    <CorrectRateDisplay rate={question.correct_rate} />
                  </TableCell>
                  <TableCell>
                    <QuestionStatusBadge status={question.status} />
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='xs'
                        className='text-slate-500 hover:text-white'
                      >
                        <Pencil className='size-3' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='xs'
                        className='text-slate-500 hover:text-white'
                      >
                        <Eye className='size-3' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='xs'
                        className='text-slate-500 hover:text-white'
                      >
                        <FileArchive className='size-3' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='xs'
                        className='text-slate-500 hover:text-white'
                      >
                        <Copy className='size-3' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className='flex flex-col items-center gap-3 py-12 text-center'>
            <Search className='size-8 text-slate-600' />
            <p className='text-slate-400 text-sm'>No questions found</p>
            <p className='text-slate-500 text-xs'>
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <span className='text-slate-500 text-xs'>
            Showing {startItem}\u2013{endItem} of {total}
          </span>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='xs'
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className='text-slate-500'
            >
              <ChevronLeft className='size-3.5' />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const startPage = Math.max(1, page - 2)
              const pageNum = startPage + i
              if (pageNum > totalPages) return null
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'ghost'}
                  size='xs'
                  onClick={() => handlePageChange(pageNum)}
                  className='min-w-7'
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant='ghost'
              size='xs'
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className='text-slate-500'
            >
              <ChevronRight className='size-3.5' />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
