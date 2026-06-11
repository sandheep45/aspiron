import type { Extensions } from '@tiptap/react'
import type { ComponentProps } from 'react'
import type { Label } from '@/components/ui/label'

export type ContentFormat = 'html' | 'text' | 'json'

export type FormTiptapEditorProps = {
  labelProps?: ComponentProps<typeof Label>
  placeholder?: string
  hideToolbar?: boolean
  contentFormat?: ContentFormat
  editable?: boolean
  minHeight?: number
  extensions?: Extensions
}
