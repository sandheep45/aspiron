import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Braces,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo,
  Undo,
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (json: string) => void
  placeholder?: string
  minHeight?: string
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

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  minHeight = '160px',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: content ? JSON.parse(content) : '',
    onUpdate: ({ editor: ed }) => {
      onChange(JSON.stringify(ed.getJSON()))
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[160px]',
      },
    },
  })

  if (!editor) {
    return (
      <div className='flex min-h-[160px] items-center justify-center rounded-xl border border-white/5 bg-slate-950/60'>
        <Loader2 className='size-5 animate-spin text-slate-500' />
      </div>
    )
  }

  return (
    <div
      className='overflow-hidden rounded-xl border border-white/5 bg-slate-950/60'
      style={{ minHeight }}
    >
      <div className='flex flex-wrap items-center gap-0.5 border-white/5 border-b px-2 py-1.5'>
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
        <div className='mx-1 h-5 w-px bg-white/10' />
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
        <div className='mx-1 h-5 w-px bg-white/10' />
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
        <div className='mx-1 h-5 w-px bg-white/10' />
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
      <div className='px-4 py-3'>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
