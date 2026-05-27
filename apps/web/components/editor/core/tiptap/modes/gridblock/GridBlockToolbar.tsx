'use client'

import React from 'react'
import type { Editor } from '@tiptap/react'
import { HEADING_LEVELS } from '../../constants'

/**
 * GridBlockToolbar Props
 */
export interface GridBlockToolbarProps {
  editor: Editor
}

/**
 * Heading Level Button Component
 */
function HeadingButton({ 
  editor, 
  level, 
  label 
}: { 
  editor: Editor
  level: number
  label: string
}) {
  const isActive = editor.isActive('heading', { level })
  
  return (
    <button
      type="button"
      onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
      className={`px-2 py-1 text-sm rounded transition-colors ${
        isActive 
          ? 'bg-blue-100 text-blue-700 font-medium' 
          : 'hover:bg-gray-100 text-gray-600'
      }`}
      title={`Heading ${level}`}
    >
      {label}
    </button>
  )
}

/**
 * Format Button Component
 */
function FormatButton({
  editor,
  format,
  shortcut,
  children,
}: {
  editor: Editor
  format: string
  shortcut: string
  children: React.ReactNode
}) {
  const isActive = (editor as any).isActive?.(format) || false
  
  return (
    <button
      type="button"
      onClick={() => {
        const chain = editor.chain().focus()
        switch (format) {
          case 'bold':
            chain.toggleBold().run()
            break
          case 'italic':
            chain.toggleItalic().run()
            break
          case 'underline':
            chain.toggleUnderline().run()
            break
          case 'code':
            chain.toggleCode().run()
            break
          case 'blockquote':
            chain.toggleBlockquote().run()
            break
        }
      }}
      className={`p-1.5 rounded transition-colors ${
        isActive 
          ? 'bg-gray-200 text-gray-900' 
          : 'hover:bg-gray-100 text-gray-600'
      }`}
      title={shortcut}
    >
      {children}
    </button>
  )
}

/**
 * GridBlockToolbar Component
 * 
 * Toolbar for GridBlock mode with formatting options.
 */
export function GridBlockToolbar({ editor }: GridBlockToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-2 pb-3 border-b border-gray-200 flex-wrap">
      {/* Heading Level Selector */}
      <div className="flex items-center gap-1">
        {HEADING_LEVELS.map(({ level, label }) => (
          <HeadingButton 
            key={level} 
            editor={editor} 
            level={level} 
            label={label.replace('Heading ', 'H')} 
          />
        ))}
      </div>
      
      <div className="w-px h-6 bg-gray-200" />
      
      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <FormatButton editor={editor} format="bold" shortcut="Bold (Ctrl+B)">
          <span className="font-bold">B</span>
        </FormatButton>
        
        <FormatButton editor={editor} format="italic" shortcut="Italic (Ctrl+I)">
          <span className="italic">I</span>
        </FormatButton>
        
        <FormatButton editor={editor} format="underline" shortcut="Underline (Ctrl+U)">
          <span className="underline">U</span>
        </FormatButton>
        
        <FormatButton editor={editor} format="code" shortcut="Code">
          <span className="font-mono text-xs">{'</>'}</span>
        </FormatButton>
        
        <FormatButton editor={editor} format="blockquote" shortcut="Quote">
          <span className="text-lg">"</span>
        </FormatButton>
      </div>
      
      <div className="w-px h-6 bg-gray-200" />
      
      {/* List Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bulletList') 
              ? 'bg-gray-200 text-gray-900' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Bullet List"
        >
          <span className="text-lg">•</span>
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('orderedList') 
              ? 'bg-gray-200 text-gray-900' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Numbered List"
        >
          <span className="text-lg">1.</span>
        </button>
      </div>
      
      <div className="w-px h-6 bg-gray-200" />
      
      {/* Text Alignment */}
      <div className="flex items-center gap-1">
        {['left', 'center', 'right', 'justify'].map((align) => (
          <button
            key={align}
            type="button"
            onClick={() => editor.chain().focus().setTextAlign(align).run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive({ textAlign: align }) 
                ? 'bg-gray-200 text-gray-900' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={`Align ${align}`}
          >
            {align === 'left' && '⬅'}
            {align === 'center' && '⬌'}
            {align === 'right' && '➡'}
            {align === 'justify' && '⬝'}
          </button>
        ))}
      </div>
      
      {/* Undo/Redo */}
      <div className="flex items-center gap-1 ml-auto">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30"
          title="Redo (Ctrl+Shift+Z)"
        >
          ↷
        </button>
      </div>
    </div>
  )
}

export default GridBlockToolbar