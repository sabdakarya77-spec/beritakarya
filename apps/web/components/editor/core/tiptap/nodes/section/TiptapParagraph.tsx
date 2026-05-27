'use client'

import React, { useMemo } from 'react'
import { EditorContent, type Editor } from '@tiptap/react'
import { useTiptapBridge } from '../../bridges/useTiptapBridge'

/**
 * TiptapParagraph Component
 
 * React component wrapper for Tiptap paragraph node.
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
    return <div className={wrapperClasses}><div className="text-gray-400">{placeholder}</div></div>
  }

  return (
    <div className={wrapperClasses} data-block-id={blockId} data-block-type="paragraph">
      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapParagraph