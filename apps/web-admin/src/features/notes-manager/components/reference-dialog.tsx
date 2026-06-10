import { uploadService } from '@aspiron/api-client'
import { FileUp, Link, Loader2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useAppForm } from '@/components/forms/form-core'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SelectContent, SelectItem } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { referenceFormOption } from '@/features/notes-manager/form-option'

interface ReferenceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    source: string
    referenceType: string
    url: string
  }) => Promise<void>
}

const referenceTypes = [
  { value: 'PDF', label: 'PDF' },
  { value: 'Document', label: 'Document' },
  { value: 'URL', label: 'URL' },
  { value: 'Video', label: 'Video' },
  { value: 'Research Paper', label: 'Research Paper' },
]

function extractFileName(url: string): string {
  try {
    const segments = new URL(url).pathname.split('/')
    const last = segments[segments.length - 1] ?? ''
    // Strip UUID prefix if present (e.g., "uuid_filename.ext" -> "filename.ext")
    const underscoreIdx = last.indexOf('_')
    if (underscoreIdx > 0 && underscoreIdx < last.length - 1) {
      const uuid = last.slice(0, underscoreIdx)
      if (/^[a-f0-9-]{36}$/i.test(uuid)) {
        return last.slice(underscoreIdx + 1)
      }
    }
    return last
  } catch {
    return url
  }
}

export function ReferenceDialog({
  open,
  onOpenChange,
  onSubmit,
}: ReferenceDialogProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useAppForm({
    ...referenceFormOption,
    onSubmit: async ({ value, formApi }) => {
      await onSubmit({
        title: value.title,
        source: value.source || value.url,
        referenceType: value.referenceType,
        url: value.url,
      })
      formApi.reset()
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const result = await uploadService.uploadFile(
        file.name,
        file.type || 'application/octet-stream',
        file,
      )
      form.setFieldValue('url', result.url)
      const currentTitle = form.getFieldValue('title')
      if (!currentTitle) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        form.setFieldValue('title', nameWithoutExt)
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Upload failed. Please try again.',
      )
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          form.reset()
          setUploadError(null)
          setMode('url')
        }
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className='max-w-[95vw] overflow-hidden p-6 sm:max-w-[90vw] md:max-w-[720px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-white'>
            <Link className='size-4 text-amber-400' />
            Add Reference
          </DialogTitle>
          <DialogDescription>
            Link an external resource or upload a file to this topic.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as 'url' | 'upload')}
          className='w-full'
        >
          <TabsList className='grid w-full min-w-0 grid-cols-2'>
            <TabsTrigger value='url' className='min-w-0'>
              <Link className='size-3.5 shrink-0' />
              <span className='truncate'>Link Resource</span>
            </TabsTrigger>
            <TabsTrigger value='upload' className='min-w-0'>
              <Upload className='size-3.5 shrink-0' />
              <span className='truncate'>Upload File</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form.AppForm>
          <form
            onSubmit={handleSubmit}
            className='flex w-full max-w-full flex-col gap-4'
          >
            <form.AppField name='title'>
              {(field) => (
                <field.FormInput
                  placeholder='Enter reference title'
                  labelProps={{ children: 'Title' }}
                />
              )}
            </form.AppField>

            <form.AppField name='source'>
              {(field) => (
                <field.FormInput
                  placeholder='e.g., Wikipedia, Khan Academy'
                  labelProps={{ children: 'Source' }}
                />
              )}
            </form.AppField>

            <form.AppField name='referenceType'>
              {(field) => (
                <field.FormSelect labelProps={{ children: 'Type' }}>
                  <SelectContent>
                    {referenceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </field.FormSelect>
              )}
            </form.AppField>

            {mode === 'url' ? (
              <form.AppField name='url'>
                {(field) => (
                  <field.FormInput
                    type='url'
                    placeholder='https://example.com/resource'
                    labelProps={{ children: 'URL' }}
                  />
                )}
              </form.AppField>
            ) : (
              <div className='flex w-full max-w-full flex-col gap-4'>
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className='flex w-full cursor-pointer items-center justify-center gap-2 self-stretch rounded-lg border-2 border-white/10 border-dashed p-4 text-slate-400 text-sm transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
                  style={{ minHeight: 120, maxHeight: 140 }}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className='size-5 animate-spin' />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileUp className='size-5' />
                      Choose a file to upload
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type='file'
                  className='hidden'
                  onChange={handleFilePicked}
                  accept='.pdf,.doc,.docx,.txt,.pptx,.xlsx,.csv,.png,.jpg,.jpeg,.webp'
                />

                {uploadError && (
                  <p className='text-red-400 text-xs'>{uploadError}</p>
                )}

                <form.AppField name='url'>
                  {(field) => {
                    const value = field.state.value
                    if (!value) return null
                    return (
                      <div className='flex w-full max-w-full items-center gap-2 overflow-hidden rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2'>
                        <Upload className='size-3.5 shrink-0 text-emerald-400' />
                        <span
                          className='min-w-0 shrink truncate text-emerald-300 text-xs'
                          title={value}
                        >
                          {extractFileName(value)}
                        </span>
                      </div>
                    )
                  }}
                </form.AppField>
              </div>
            )}

            <DialogFooter className='mt-2'>
              <DialogClose asChild>
                <button
                  type='button'
                  className='w-full cursor-pointer rounded-lg border border-white/10 px-4 py-2 text-slate-400 text-sm transition-colors hover:bg-white/5 hover:text-white sm:w-auto'
                >
                  Cancel
                </button>
              </DialogClose>
              <form.SubmitButton className='w-full sm:w-auto'>
                {mode === 'upload' ? (
                  <Upload className='size-3.5' />
                ) : (
                  <Link className='size-3.5' />
                )}
                Add Reference
              </form.SubmitButton>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}
