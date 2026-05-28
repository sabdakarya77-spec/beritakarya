'use client'

import React, { useMemo } from 'react'
import { EditorContent, type Editor } from '@tiptap/react'
import { useTiptapBridge } from '../../bridges/useTiptapBridge'
import { BubbleMenuToolbar } from '../../menus/TiptapBubbleMenu'

/**
 * TiptapParagraph Component
 * 
 * React component wrapper for Tiptap paragraph node.
 * Integrated into the GridBlock editor system.
 */
export interface TiptapParagraphProps {
  blockId: string
  initialContent?: string
  placeholder?: string
  className?: string
  onContentChange?: (content: string) => void
}

/**
 * TiptapParagraph Component
 * 
 * @example
 * ```tsx
 * <TiptapParagraph 
 *   blockId="block-123" 
 *   initialContent="<p>Hello world</p>"
 *   placeholder="Tulis paragraf..."
 * />
 * ```
 */
export function TiptapParagraph({
  blockId,
  initialContent = '',
  placeholder = 'Tulis paragraf...',
  className = '',
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
    if (className) classes.push(className)
    return classes.join(' ')
  }, [className])

  if (!editor) {
    return (
      <div className={wrapperClasses} data-block-id={blockId} data-block-type="paragraph">
        <div className="text-gray-400 min-h-[1.75em]">{placeholder}</div>
      </div>
    )
  }

  return (
    <div className={wrapperClasses} data-block-id={blockId} data-block-type="paragraph">
      <BubbleMenuToolbar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="min-h-[1.75em] outline-none font-serif text-[1.05rem] leading-[1.85] text-slate-800 dark:text-slate-100"
      />
    </div>
  )
}

export default TiptapParagraph
