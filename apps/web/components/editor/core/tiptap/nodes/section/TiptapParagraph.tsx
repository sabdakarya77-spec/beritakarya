'use client'

import React, { useMemo } from 'react'
import { BubbleMenu, EditorContent, type Editor } from '@tiptap/react'
import { useTiptapBridge } from '../../bridges/useTiptapBridge'

/**
 * TiptapParagraph Component
 * 
 * React component wrapper for Tiptap paragraph node.
 * This is a replacement for the existing ParagraphEditor.tsx.
 */
export interface TiptapParagraphProps {
  blockId: string
  initialContent?: string
  placeholder?: string
  className?: string
  showBubbleMenu?: boolean
  onContentChange?: (content: string) => void
}

/**
 * Inline Toolbar Component for formatting
 */
function InlineToolbarComponent({ editor }: { editor: Editor }) {
  if (!editor) return null
  
  return (
    <div className="flex items-center gap-1 bg-white shadow-lg rounded-lg border p-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
      >
        <span className="font-bold text-sm">B</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
      >
        <span className="italic text-sm">I</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
      >
        <span className="underline text-sm">U</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleLink({ href: '' }).run()}
        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
      >
        <span className="text-sm">🔗</span>
      </button>
    </div>
  )
}

/**
 * TiptapParagraph Component
 */
export function TiptapParagraph({
  blockId,
  initialContent = '',
  placeholder = 'Tulis paragraf...',
  className = '',
  showBubbleMenu = true,
  onContentChange,
}: TiptapParagraphProps) {
  const editor = useTiptapBridge({
    blockId,
    initialContent,
    placeholder,
    onUpdate: onContentChange,
  })

  const wrapperClasses = useMemo(() => {
    const classes = [
      'relative',
      'group',
      'paragraph-wrapper',
      'font-serif',
      'text-base',
      'leading-relaxed',
      'my-4',
    ]
    if (className) {
      classes.push(className)
    }
    return classes.join(' ')
  }, [className])

  if (!editor) {
    return (
      <div className={wrapperClasses}>
        <div className="text-gray-400">{placeholder}</div>
      </div>
    )
  }

  return (
    <div 
      className={wrapperClasses}
      data-block-id={blockId}
      data-block-type="paragraph"
    >
      {showBubbleMenu && (
        <BubbleMenu 
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bubble-menu"
        >
          <InlineToolbarComponent editor={editor} />
        </BubbleMenu>
      )}
      
      <div
        className="ProseMirror outline-none min-h-[1.75em]"
        data-placeholder={placeholder}
      >
        {/* Editor content is rendered by Tiptap */}
      </div>
      
      {/* Slash command indicator */}
      <div className="absolute left-0 top-0 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="p-1 text-gray-400 hover:text-gray-600"
          title="Tambah block"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default TiptapParagraph