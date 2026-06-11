import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Redo,
  Underline as UnderlineIcon,
  Undo,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import {
  FieldWrapper,
  useFieldMeta,
} from '@/components/forms/field-elements/field-wrapper'
import type { FormTiptapEditorProps } from '@/components/forms/types/form-tiptap-editor'
import { FieldLabel } from '@/components/ui/field'

function ToolbarButton({
  onClick,
  isActive,
  icon: Icon,
  label,
}: {
  onClick: () => void
  isActive?: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={isActive ? 'is-active' : ''}
      title={label}
    >
      <Icon className='size-3.5' />
    </button>
  )
}

function Toolbar({
  editor,
}: {
  editor: NonNullable<ReturnType<typeof useEditor>>
}) {
  return (
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
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        icon={UnderlineIcon}
        label='Underline'
      />
      <div className='toolbar-separator' />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        icon={Heading2}
        label='Heading 2'
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
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
  )
}

function parseContent(
  value: string,
  format: 'html' | 'text' | 'json',
): string | Record<string, unknown> {
  if (format === 'json' && value) {
    try {
      return JSON.parse(value) as Record<string, unknown>
    } catch {
      return value
    }
  }
  return value || ''
}

function serializeContent(
  editor: NonNullable<ReturnType<typeof useEditor>>,
  format: 'html' | 'text' | 'json',
): string {
  switch (format) {
    case 'text':
      return editor.getText()
    case 'json':
      return JSON.stringify(editor.getJSON())
    default:
      return editor.getHTML()
  }
}

export const FormTiptapEditor = ({
  labelProps,
  placeholder = 'Start writing...',
  hideToolbar = false,
  contentFormat = 'html',
  editable = true,
  minHeight,
  extensions: extraExtensions,
}: FormTiptapEditorProps) => {
  const { field, isInvalid, inputId } = useFieldMeta<string>()
  const editorValueRef = useRef(field.state.value)

  const editor = useEditor({
    content: parseContent(field.state.value, contentFormat),
    editable,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
      ...(extraExtensions ?? []),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none',
        ...(minHeight ? { style: `min-height: ${minHeight}px` } : {}),
      },
    },
    onUpdate: ({ editor: ed }) => {
      const newValue = serializeContent(ed, contentFormat)
      editorValueRef.current = newValue
      field.handleChange(newValue)
    },
  })

  useEffect(() => {
    if (!editor) return

    const currentValue = serializeContent(editor, contentFormat)
    if (
      field.state.value !== editorValueRef.current &&
      field.state.value !== currentValue
    ) {
      editorValueRef.current = field.state.value
      editor.commands.setContent(parseContent(field.state.value, contentFormat))
    }
  }, [editor, field.state.value, contentFormat])

  if (!editor) {
    return (
      <FieldWrapper isInvalid={isInvalid} errors={field.state.meta.errors}>
        {labelProps?.children && (
          <FieldLabel {...labelProps} htmlFor={inputId}>
            <span>{labelProps.children}</span>
          </FieldLabel>
        )}
        <div className='flex min-h-[200px] items-center justify-center rounded-xl border border-white/5 bg-slate-900/50'>
          <div className='size-5 animate-pulse rounded-full bg-slate-700' />
        </div>
      </FieldWrapper>
    )
  }

  return (
    <FieldWrapper isInvalid={isInvalid} errors={field.state.meta.errors}>
      {labelProps?.children && (
        <FieldLabel {...labelProps} htmlFor={inputId}>
          <span>{labelProps.children}</span>
        </FieldLabel>
      )}
      <div className='tiptap-editor overflow-hidden rounded-xl border border-white/5 bg-slate-950/60'>
        {!hideToolbar && <Toolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
    </FieldWrapper>
  )
}
