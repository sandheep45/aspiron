import type { TopicItem } from '@aspiron/api-client'
import { ArrowRight, ChevronDown, ChevronUp, Search, Video } from 'lucide-react'
import { useCallback } from 'react'
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
import { ContentStatusBadge } from './content-status-badge'
import { EmptyState } from './empty-state'
import { RecallBadge } from './recall-badge'
import { StatusBadge } from './status-badge'

interface TopicsTableProps {
  topics: TopicItem[]
  search: string
  onSearchChange: (value: string) => void
  sortBy: string | undefined
  onSortByChange: (value: string | undefined) => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: () => void
  statusFilter: string | undefined
  onStatusFilterChange: (value: string | undefined) => void
  contentStatusFilter: string | undefined
  onContentStatusFilterChange: (value: string | undefined) => void
  recallFilter: string | undefined
  onRecallFilterChange: (value: string | undefined) => void
  videoFilter: string | undefined
  onVideoFilterChange: (value: string | undefined) => void
  page: number
  onPageChange: (page: number) => void
  limit: number
  onViewTopic?: (topicId: string) => void
}

export function TopicsTable({
  topics,
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  statusFilter,
  onStatusFilterChange,
  contentStatusFilter,
  onContentStatusFilterChange,
  recallFilter,
  onRecallFilterChange,
  videoFilter,
  onVideoFilterChange,
  page,
  onPageChange,
  limit,
  onViewTopic,
}: TopicsTableProps) {
  const handleViewTopic = useCallback(
    (topicId: string) => {
      onViewTopic?.(topicId)
    },
    [onViewTopic],
  )

  const totalFiltered = topics.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / limit))
  const hasFilters =
    search ||
    sortBy ||
    statusFilter ||
    contentStatusFilter ||
    recallFilter ||
    videoFilter
  const isSearchEmpty = totalFiltered === 0 && hasFilters
  const isTrulyEmpty = totalFiltered === 0 && !hasFilters

  if (isTrulyEmpty) {
    return (
      <EmptyState
        title='No topics yet'
        description='This chapter does not have any topics yet. Topics will appear here once they are created in the content management system.'
      />
    )
  }

  if (isSearchEmpty) {
    return (
      <EmptyState
        title='No matching topics'
        description='Try adjusting your search or filters to find what you are looking for.'
      />
    )
  }

  return (
    <div className='space-y-4'>
      {/* Filters row */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative min-w-[200px] max-w-xs flex-1'>
          <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500' />
          <Input
            placeholder='Search topics...'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className='border-white/10 bg-slate-900/50 pl-9 text-slate-200 text-sm placeholder:text-slate-500'
          />
        </div>

        <Select
          value={statusFilter ?? 'all'}
          onValueChange={(v) =>
            onStatusFilterChange(v === 'all' ? undefined : v)
          }
        >
          <SelectTrigger className='w-[150px] border-white/10 bg-slate-900/50 text-slate-200 text-sm'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='healthy'>Healthy</SelectItem>
            <SelectItem value='needs_attention'>Needs Attention</SelectItem>
            <SelectItem value='critical'>Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={contentStatusFilter ?? 'all'}
          onValueChange={(v) =>
            onContentStatusFilterChange(v === 'all' ? undefined : v)
          }
        >
          <SelectTrigger className='w-[160px] border-white/10 bg-slate-900/50 text-slate-200 text-sm'>
            <SelectValue placeholder='Content Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Content</SelectItem>
            <SelectItem value='published'>Published</SelectItem>
            <SelectItem value='draft'>Draft</SelectItem>
            <SelectItem value='review_pending'>Review Pending</SelectItem>
            <SelectItem value='archived'>Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={recallFilter ?? 'all'}
          onValueChange={(v) =>
            onRecallFilterChange(v === 'all' ? undefined : v)
          }
        >
          <SelectTrigger className='w-[150px] border-white/10 bg-slate-900/50 text-slate-200 text-sm'>
            <SelectValue placeholder='Recall' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Recall</SelectItem>
            <SelectItem value='strong'>Strong</SelectItem>
            <SelectItem value='medium'>Medium</SelectItem>
            <SelectItem value='weak'>Weak</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={videoFilter ?? 'all'}
          onValueChange={(v) =>
            onVideoFilterChange(v === 'all' ? undefined : v)
          }
        >
          <SelectTrigger className='w-[150px] border-white/10 bg-slate-900/50 text-slate-200 text-sm'>
            <SelectValue placeholder='Video' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Video</SelectItem>
            <SelectItem value='true'>Has Video</SelectItem>
            <SelectItem value='false'>No Video</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant='ghost'
          size='sm'
          onClick={onSortOrderChange}
          className='text-slate-400'
          aria-label='Toggle sort direction'
        >
          {sortOrder === 'asc' ? (
            <ChevronUp className='size-4' />
          ) : (
            <ChevronDown className='size-4' />
          )}
          <span className='ml-1 text-xs'>Sort</span>
        </Button>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-xl border border-white/5'>
        <Table>
          <TableHeader className='bg-slate-900/80'>
            <TableRow className='border-white/5 hover:bg-transparent'>
              <TableHead className='h-10 px-4 text-slate-400 text-xs'>
                Topic Name
              </TableHead>
              <TableHead className='h-10 px-4 text-slate-400 text-xs'>
                Content Status
              </TableHead>
              <TableHead className='h-10 px-4 text-slate-400 text-xs'>
                Video
              </TableHead>
              <TableHead className='h-10 px-4 text-slate-400 text-xs'>
                <button
                  type='button'
                  onClick={() =>
                    onSortByChange(sortBy === 'recall' ? undefined : 'recall')
                  }
                  className='flex items-center gap-1 hover:text-white'
                >
                  Recall Strength
                  {sortBy === 'recall' &&
                    (sortOrder === 'asc' ? (
                      <ChevronUp className='size-3' />
                    ) : (
                      <ChevronDown className='size-3' />
                    ))}
                </button>
              </TableHead>
              <TableHead className='h-10 px-4 text-slate-400 text-xs'>
                <button
                  type='button'
                  onClick={() =>
                    onSortByChange(
                      sortBy === 'accuracy' ? undefined : 'accuracy',
                    )
                  }
                  className='flex items-center gap-1 hover:text-white'
                >
                  Practice Accuracy
                  {sortBy === 'accuracy' &&
                    (sortOrder === 'asc' ? (
                      <ChevronUp className='size-3' />
                    ) : (
                      <ChevronDown className='size-3' />
                    ))}
                </button>
              </TableHead>
              <TableHead className='h-10 px-4 text-slate-400 text-xs'>
                <button
                  type='button'
                  onClick={() =>
                    onSortByChange(
                      sortBy === 'last_activity' ? undefined : 'last_activity',
                    )
                  }
                  className='flex items-center gap-1 hover:text-white'
                >
                  Last Activity
                  {sortBy === 'last_activity' &&
                    (sortOrder === 'asc' ? (
                      <ChevronUp className='size-3' />
                    ) : (
                      <ChevronDown className='size-3' />
                    ))}
                </button>
              </TableHead>
              <TableHead className='h-10 px-4 text-slate-400 text-xs'>
                <button
                  type='button'
                  onClick={() =>
                    onSortByChange(sortBy === 'status' ? undefined : 'status')
                  }
                  className='flex items-center gap-1 hover:text-white'
                >
                  Status
                  {sortBy === 'status' &&
                    (sortOrder === 'asc' ? (
                      <ChevronUp className='size-3' />
                    ) : (
                      <ChevronDown className='size-3' />
                    ))}
                </button>
              </TableHead>
              <TableHead className='h-10 px-4 text-slate-400 text-xs'>
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((topic) => (
              <TableRow
                key={topic.id}
                className='border-white/5 transition-colors hover:bg-slate-800/30'
              >
                <TableCell className='px-4 py-3'>
                  <p className='font-medium text-slate-200 text-sm'>
                    {topic.name}
                  </p>
                </TableCell>
                <TableCell className='px-4 py-3'>
                  <ContentStatusBadge status={topic.content_status} />
                </TableCell>
                <TableCell className='px-4 py-3'>
                  {topic.video_available ? (
                    <span className='inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-emerald-400 text-xs'>
                      <Video className='size-3' />
                      Video Available
                    </span>
                  ) : (
                    <span className='text-slate-500 text-xs'>None</span>
                  )}
                </TableCell>
                <TableCell className='px-4 py-3'>
                  <RecallBadge value={topic.recall_strength} />
                </TableCell>
                <TableCell className='px-4 py-3'>
                  <span className='text-slate-300 text-sm tabular-nums'>
                    {topic.practice_accuracy}%
                  </span>
                </TableCell>
                <TableCell className='px-4 py-3'>
                  <span className='text-slate-400 text-xs'>
                    {topic.last_activity}
                  </span>
                </TableCell>
                <TableCell className='px-4 py-3'>
                  <StatusBadge status={topic.status} />
                </TableCell>
                <TableCell className='px-4 py-3'>
                  <button
                    type='button'
                    onClick={() => handleViewTopic(topic.id)}
                    className='inline-flex items-center gap-1 text-indigo-400 text-xs transition-colors hover:text-indigo-300'
                  >
                    View Topic
                    <ArrowRight className='size-3' />
                  </button>
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
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className='border-white/10 text-slate-400'
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className='border-white/10 text-slate-400'
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
