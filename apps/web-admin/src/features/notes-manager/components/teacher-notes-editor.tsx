import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Braces,
  Code,
  Eye,
  FileX,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo,
  Send,
  Undo,
} from 'lucide-react'
import { useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface TeacherNotesEditorProps {
  content: string
  status: string
  onSave: (content: string) => Promise<void>
  onPublish: () => Promise<void>
  onUnpublish: () => Promise<void>
  onPreview: () => void
  isSaving: boolean
  isPublishing: boolean
  isUnpublishing: boolean
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
}

function ToolbarButton({
  onClick,
  isActive,
  icon: Icon,
  label,
}: ToolbarButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`flex size-8 items-center justify-center rounded-md transition-colors hover:bg-slate-800 hover:text-white ${
        isActive ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400'
      }`}
      title={label}
    >
      <Icon className='size-3.5' />
    </button>
  )
}

export function TeacherNotesEditor({
  content,
  status,
  onSave,
  onPublish,
  onUnpublish,
  onPreview,
  isSaving,
  isPublishing,
  isUnpublishing,
}: TeacherNotesEditorProps) {
  const _saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your notes here...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none',
      },
    },
  })

  const handleSave = useCallback(() => {
    if (!editor) return
    onSave(editor.getHTML())
  }, [editor, onSave])

  if (!editor) {
    return (
      <div className='flex min-h-[400px] items-center justify-center rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-sm'>
        <Loader2 className='size-6 animate-spin text-slate-500' />
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
      <div className='tiptap-editor overflow-hidden rounded-xl border border-white/5 bg-slate-950/60'>
        <div className='tiptap-toolbar'>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={Bold}
            label='Bold'
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={Italic}
            label='Italic'
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            icon={Code}
            label='Code'
          />
          <div className='toolbar-separator' />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive('heading', { level: 1 })}
            icon={Heading1}
            label='Heading 1'
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
            label='Heading 2'
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive('heading', { level: 3 })}
            icon={Heading3}
            label='Heading 3'
          />
          <div className='toolbar-separator' />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={List}
            label='Bullet List'
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={ListOrdered}
            label='Ordered List'
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={Quote}
            label='Blockquote'
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            icon={Braces}
            label='Code Block'
          />
          <div className='toolbar-separator' />
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon={Undo}
            label='Undo'
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={Redo}
            label='Redo'
          />
        </div>

        <EditorContent editor={editor} />
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <Button
          variant='brand'
          size='sm'
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className='size-3.5 animate-spin' />
          ) : (
            <Send className='size-3.5' />
          )}
          Save Changes
        </Button>
        <Button
          variant='secondary'
          size='sm'
          onClick={onPublish}
          disabled={isPublishing || status === 'published'}
        >
          {isPublishing ? (
            <Loader2 className='size-3.5 animate-spin' />
          ) : (
            <Send className='size-3.5' />
          )}
          Publish Notes
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={onUnpublish}
          disabled={isUnpublishing || status === 'draft'}
        >
          {isUnpublishing ? (
            <Loader2 className='size-3.5 animate-spin' />
          ) : (
            <FileX className='size-3.5' />
          )}
          Unpublish Notes
        </Button>
        <Button variant='ghost' size='sm' onClick={onPreview}>
          <Eye className='size-3.5' />
          Preview Student View
        </Button>
      </div>
    </div>
  )
}
