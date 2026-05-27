'use client'

import React from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import { classicExtensions } from './classicExtensions'

export interface ClassicEditorProps {
  blockId: string
  initialContent?: string
  className?: string
  onUpdate?: (content: string) => void
}

export function ClassicEditor({ blockId, initialContent = '', className = '', onUpdate }: ClassicEditorProps) {
  const editor = useEditor({
    extensions: classicExtensions,
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none min-h-[300px] font-serif',
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
      <EditorContent editor={editor} className="p-4" />
    </div>
  )
}

export default ClassicEditor