import type { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DataTableColumnHeaderProps<TData> {
  column: Column<TData>
  title: string
  className?: string
}

export function DataTableColumnHeader<TData>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <Button
      variant='ghost'
      size='sm'
      className={cn('-ml-3 h-8 data-[state=open]:bg-accent', className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      <span>{title}</span>
      {column.getIsSorted() === 'desc' ? (
        <ArrowDown className='ml-1.5 size-3.5' />
      ) : column.getIsSorted() === 'asc' ? (
        <ArrowUp className='ml-1.5 size-3.5' />
      ) : (
        <ChevronsUpDown className='ml-1.5 size-3.5' />
      )}
    </Button>
  )
}
