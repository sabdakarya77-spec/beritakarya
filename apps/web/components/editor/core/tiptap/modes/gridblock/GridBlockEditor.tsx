'use client'

import React from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import { gridblockExtensions } from './gridblockExtensions'

export interface GridBlockEditorProps {
  blockId: string
  initialContent?: string
  className?: string
  onUpdate?: (content: string) => void
}

export function GridBlockEditor({ blockId, initialContent = '', className = '', onUpdate }: GridBlockEditorProps) {
  const editor = useEditor({
    extensions: gridblockExtensions,
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none min-h-[200px]',
        'data-block-id': blockId,
      },
    },
    onUpdate: ({ editor: ed }) => {
      onUpdate?.(ed.getHTML())
    },
  })

  if (!editor) return <div className={className}>Loading...</div>

  return (
    <div className={className}>
      <GridBlockToolbar editor={editor} />
      <EditorContent editor={editor} className="mt-4" />
    </div>
  )
}

// Simple toolbar placeholder
function GridBlockToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex items-center gap-2 border-b pb-2">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-gray-200' : ''}>
        <span className="font-bold">B</span>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-gray-200' : ''}>
        <span className="italic">I</span>
      </button>
    </div>
  )
}

export default GridBlockEditor