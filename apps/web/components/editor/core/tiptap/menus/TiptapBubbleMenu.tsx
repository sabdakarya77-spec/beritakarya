'use client'

import React from 'react'
import type { Editor } from '@tiptap/react'

/**
 * BubbleMenu Props
 */
export interface TiptapBubbleMenuProps {
  editor: Editor
  children: React.ReactNode
  className?: string
}

/**
 * TiptapBubbleMenu Component
 * 
 * Wrapper component for Tiptap's BubbleMenu.
 * Shows a floating menu when text is selected.
 */
export function TiptapBubbleMenu({ 
  editor, 
  children, 
  className = '' 
}: TiptapBubbleMenuProps) {
  // BubbleMenu functionality is handled by @tiptap/extension-bubble-menu
  // This component can be used with the BubbleMenu component from @tiptap/react
  
  return (
    <div 
      className={`bubble-menu-container ${className}`}
      data-visible="true"
    >
      {children}
    </div>
  )
}

/**
 * Simple BubbleMenu Toolbar Component
 * 
 * A simple floating toolbar for text formatting.
 */
export function BubbleMenuToolbar({ editor }: { editor: Editor }) {
  if (!editor) return null

  const isActive = (format: string) => {
    return editor.isActive(format)
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-white rounded-lg shadow-lg border">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded hover:bg-gray-100 ${isActive('bold') ? 'bg-gray-200' : ''}`}
        title="Bold"
      >
        <span className="font-bold text-sm">B</span>
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded hover:bg-gray-100 ${isActive('italic') ? 'bg-gray-200' : ''}`}
        title="Italic"
      >
        <span className="italic text-sm">I</span>
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1 rounded hover:bg-gray-100 ${isActive('underline') ? 'bg-gray-200' : ''}`}
        title="Underline"
      >
        <span className="underline text-sm">U</span>
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1 rounded hover:bg-gray-100 ${isActive('code') ? 'bg-gray-200' : ''}`}
        title="Code"
      >
        <span className="font-mono text-xs">{'</>'}</span>
      </button>

      <div className="w-px h-4 bg-gray-200 mx-1" />

      <button
        type="button"
        onClick={() => {
          const url = window.prompt('Enter URL:')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={`p-1 rounded hover:bg-gray-100 ${isActive('link') ? 'bg-gray-200' : ''}`}
        title="Link"
      >
        🔗
      </button>
    </div>
  )
}

export default TiptapBubbleMenu