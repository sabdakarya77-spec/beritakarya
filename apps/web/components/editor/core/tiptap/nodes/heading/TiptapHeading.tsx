'use client'

import React, { useMemo } from 'react'
import { BubbleMenu, type Editor } from '@tiptap/react'
import { useTiptapBridge } from '../../bridges/useTiptapBridge'
import type { HeadingLevel } from '../../types'

/**
 * TiptapHeading Component Props
 */
export interface TiptapHeadingProps {
  blockId: string
  initialContent?: string
  level?: HeadingLevel
  placeholder?: string
  className?: string
  showBubbleMenu?: boolean
  onContentChange?: (content: string) => void
}

/**
 * Heading level styles
 */
const HEADING_STYLES: Record<number, string> = {
  1: 'text-4xl font-bold mb-4 mt-6',
  2: 'text-3xl font-bold mb-3 mt-5',
  3: 'text-2xl font-semibold mb-2 mt-4',
  4: 'text-xl font-semibold mb-2 mt-3',
  5: 'text-lg font-medium mb-1 mt-2',
  6: 'text-base font-medium mb-1 mt-2',
}

/**
 * Heading Level Selector Component
 */
function HeadingLevelSelector({ editor, currentLevel }: { editor: Editor; currentLevel: number }) {
  const levels: HeadingLevel[] = [1, 2, 3, 4, 5, 6]
  
  return (
    <div className="flex items-center gap-1 bg-white shadow-lg rounded-lg border p-1">
      {levels.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          className={`p-1.5 rounded hover:bg-gray-100 text-sm ${
            currentLevel === level ? 'bg-gray-200 font-bold' : ''
          }`}
          title={`Heading ${level}`}
        >
          H{level}
        </button>
      ))}
    </div>
  )
}

/**
 * TiptapHeading Component
 * 
 * React component wrapper for Tiptap heading node.
 */
export function TiptapHeading({
  blockId,
  initialContent = '',
  level = 2,
  placeholder = 'Ketik judul...',
  className = '',
  showBubbleMenu = true,
  onContentChange,
}: TiptapHeadingProps) {
  const editor = useTiptapBridge({
    blockId,
    initialContent,
    placeholder,
    onUpdate: onContentChange,
  })

  const headingStyle = HEADING_STYLES[level] || HEADING_STYLES[2]

  const wrapperClasses = useMemo(() => {
    const classes = [
      'relative',
      'group',
      'heading-wrapper',
      headingStyle,
    ]
    if (className) {
      classes.push(className)
    }
    return classes.join(' ')
  }, [className, headingStyle])

  if (!editor) {
    return (
      <div className={wrapperClasses}>
        <div className="text-gray-400">{placeholder}</div>
      </div>
    )
  }

  const isActive = editor.isActive('heading', { level })

  return (
    <div 
      className={wrapperClasses}
      data-block-id={blockId}
      data-block-type="heading"
      data-heading-level={level}
    >
      {showBubbleMenu && (
        <BubbleMenu 
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bubble-menu"
        >
          <HeadingLevelSelector editor={editor} currentLevel={level} />
        </BubbleMenu>
      )}
      
      <div
        className="ProseMirror outline-none"
        data-placeholder={placeholder}
      >
        {/* Editor content is rendered by Tiptap */}
      </div>
      
      {/* Drag handle indicator */}
      <div className="absolute left-0 top-0 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="p-1 text-gray-400 hover:text-gray-600"
          title="Pindahkan"
        >
          ⠿
        </button>
      </div>
    </div>
  )
}

export default TiptapHeading