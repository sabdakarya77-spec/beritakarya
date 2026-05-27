'use client'

import React from 'react'
import type { Editor } from '@tiptap/react'

/**
 * ClassicToolbar Props
 */
export interface ClassicToolbarProps {
  editor: Editor
}

/**
 * ClassicToolbar Component
 * 
 * Minimal toolbar for Classic mode with only essential formatting options.
 */
export function ClassicToolbar({ editor }: ClassicToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
      {/* Heading Selector */}
      <select
        value={editor.isActive('heading', { level: 1 }) ? '1' : 
               editor.isActive('heading', { level: 2 }) ? '2' :
               editor.isActive('heading', { level: 3 }) ? '3' : 'p'}
        onChange={(e) => {
          const value = e.target.value
          if (value === 'p') {
            editor.chain().focus().setParagraph().run()
          } else {
            editor.chain().focus().toggleHeading({ level: parseInt(value) as 1 | 2 | 3 }).run()
          }
        }}
        className="px-2 py-1 text-sm border rounded bg-white"
      >
        <option value="p">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      <div className="w-px h-4 bg-gray-300 mx-2" />

      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Bold (Ctrl+B)"
      >
        <span className="font-bold">B</span>
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Italic (Ctrl+I)"
      >
        <span className="italic">I</span>
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded ${editor.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Underline (Ctrl+U)"
      >
        <span className="underline">U</span>
      </button>

      {/* Link */}
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('Enter URL:')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={`p-1.5 rounded ${editor.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Insert Link"
      >
        🔗
      </button>

      <div className="w-px h-4 bg-gray-300 mx-2" />

      {/* Undo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
        title="Undo (Ctrl+Z)"
      >
        ↶
      </button>

      {/* Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
        title="Redo (Ctrl+Shift+Z)"
      >
        ↷
      </button>
    </div>
  )
}

export default ClassicToolbar