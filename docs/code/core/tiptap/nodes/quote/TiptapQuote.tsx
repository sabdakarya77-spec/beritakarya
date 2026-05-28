'use client'

import React, { useMemo } from 'react'
import { EditorContent, type Editor } from '@tiptap/react'
import { useTiptapBridge } from '../../bridges/useTiptapBridge'
import { useEditorStore } from '../../../../../../store/editorStore'
import { BubbleMenuToolbar } from '../../menus/TiptapBubbleMenu'

export interface TiptapQuoteProps {
  blockId: string
  initialContent?: string
  attribution?: string
  className?: string
  onContentChange?: (content: string) => void
  onAttributionChange?: (attribution: string) => void
}

/**
 * TiptapQuote Component
 * 
 * React component wrapper for Tiptap Blockquote node.
 * Integrated into the GridBlock editor system.
 */
export function TiptapQuote({
  blockId,
  initialContent = '',
  attribution = '',
  className = '',
  onContentChange,
  onAttributionChange,
}: TiptapQuoteProps) {
  const { updateBlock } = useEditorStore()

  const editor = useTiptapBridge({
    blockId,
    initialContent,
    placeholder: 'Tulis kutipan...',
    onUpdate: onContentChange,
  })

  const wrapperClasses = useMemo(() => {
    const classes = [
      'relative',
      'group',
      'quote-wrapper',
      'border-l-4',
      'border-blue-400',
      'py-2',
      'pl-5',
      'lg:pl-6',
    ]
    if (className) classes.push(className)
    return classes.join(' ')
  }, [className])

  const editorClasses = useMemo(() => {
    const classes = [
      'font-serif',
      'text-[1.15rem]',
      'italic',
      'leading-8',
      'text-gray-700',
      'dark:text-gray-100',
      'lg:text-[1.25rem]',
      'lg:leading-[2.2rem]',
      'outline-none',
    ]
    return classes.join(' ')
  }, [])

  if (!editor) {
    return (
      <div className={wrapperClasses} data-block-id={blockId} data-block-type="quote">
        <div className={editorClasses}>
          {initialContent || 'Kutipan...'}
        </div>
        {attribution && (
          <div className="mt-3 text-sm uppercase tracking-[0.14em] text-gray-400">
            — {attribution}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={wrapperClasses} data-block-id={blockId} data-block-type="quote">
      <BubbleMenuToolbar editor={editor} />
      <EditorContent 
        editor={editor} 
        className={editorClasses}
      />
      <div className="mt-3">
        <input
          type="text"
          value={attribution}
          onChange={(e) => {
            updateBlock(blockId, { attribution: e.target.value })
            onAttributionChange?.(e.target.value)
          }}
          placeholder="— Nama narasumber"
          className="text-sm uppercase tracking-[0.14em] text-gray-400 outline-none bg-transparent placeholder:text-gray-300 dark:placeholder:text-white/10 w-full"
        />
      </div>
    </div>
  )
}

export default TiptapQuote