'use client'

import React from 'react'
import type { Editor } from '@tiptap/react'
import { HEADING_LEVELS } from '../../constants'

interface GridBlockToolbarProps { editor: Editor }

export function GridBlockToolbar({ editor }: GridBlockToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-2 pb-3 border-b border-gray-200 flex-wrap">
      {HEADING_LEVELS.map(({ level, label }) => (
        <button key={level} type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          className={`px-2 py-1 text-sm rounded ${editor.isActive('heading', { level }) ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-600'}`}
          title={`Heading ${level}`}>
          {label.replace('Heading ', 'H')}
        </button>
      ))}
      <div className="w-px h-6 bg-gray-200" />
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>
        <span className="font-bold">B</span>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>
        <span className="italic">I</span>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded ${editor.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>
        <span className="underline">U</span>
      </button>
      <div className="w-px h-6 bg-gray-200" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>
        <span className="text-lg">•</span>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>
        <span className="text-lg">1.</span>
      </button>
    </div>
  )
}

export default GridBlockToolbar