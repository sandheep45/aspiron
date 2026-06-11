import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RichTextEditor } from '@/features/create-question/components/rich-text-editor'

describe('RichTextEditor', () => {
  it('renders toolbar buttons', () => {
    render(<RichTextEditor content='' onChange={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    const labels = buttons.map((b) => b.getAttribute('title'))
    expect(labels).toContain('Bold')
    expect(labels).toContain('Italic')
    expect(labels).toContain('Code')
    expect(labels).toContain('Heading 1')
    expect(labels).toContain('Heading 2')
    expect(labels).toContain('Heading 3')
    expect(labels).toContain('Bullet List')
    expect(labels).toContain('Ordered List')
    expect(labels).toContain('Blockquote')
    expect(labels).toContain('Code Block')
    expect(labels).toContain('Undo')
    expect(labels).toContain('Redo')
  })

  it('renders editor content area', () => {
    const { container } = render(
      <RichTextEditor
        content='{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Test"}]}]}'
        onChange={vi.fn()}
      />,
    )
    const editorDiv = container.querySelector('.ProseMirror')
    expect(editorDiv).not.toBeNull()
  })

  it('renders editor element with custom placeholder', () => {
    const { container } = render(
      <RichTextEditor
        content=''
        onChange={vi.fn()}
        placeholder='Custom placeholder'
      />,
    )
    const editorDiv = container.querySelector('.ProseMirror')
    expect(editorDiv).not.toBeNull()
  })
})
