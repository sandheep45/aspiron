import { Link, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ReferenceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    source: string
    referenceType: string
    url: string
  }) => Promise<void>
  isSubmitting: boolean
}

const referenceTypes = [
  { value: 'PDF', label: 'PDF' },
  { value: 'Document', label: 'Document' },
  { value: 'URL', label: 'URL' },
  { value: 'Video', label: 'Video' },
  { value: 'Research Paper', label: 'Research Paper' },
]

export function ReferenceDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: ReferenceDialogProps) {
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [referenceType, setReferenceType] = useState('URL')
  const [url, setUrl] = useState('')

  const handleSubmit = async () => {
    if (!title.trim() || !url.trim()) return
    await onSubmit({
      title: title.trim(),
      source: source.trim() || url.trim(),
      referenceType,
      url: url.trim(),
    })
    setTitle('')
    setSource('')
    setReferenceType('URL')
    setUrl('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-white'>
            <Link className='size-4 text-amber-400' />
            Add Reference
          </DialogTitle>
          <DialogDescription>
            Link an external resource to this topic.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='ref-title' className='text-slate-400 text-xs'>
              Title
            </label>
            <Input
              id='ref-title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Enter reference title'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='ref-source' className='text-slate-400 text-xs'>
              Source
            </label>
            <Input
              id='ref-source'
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder='e.g., Wikipedia, Khan Academy'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='ref-type' className='text-slate-400 text-xs'>
              Type
            </label>
            <Select value={referenceType} onValueChange={setReferenceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {referenceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='ref-url' className='text-slate-400 text-xs'>
              URL
            </label>
            <Input
              id='ref-url'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='https://example.com/resource'
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='brand'
            size='sm'
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !url.trim()}
          >
            {isSubmitting ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Link className='size-3.5' />
            )}
            Add Reference
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
