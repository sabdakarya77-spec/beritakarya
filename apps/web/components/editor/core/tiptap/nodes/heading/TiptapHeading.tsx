'use client'

import React from 'react'
import { EditorContent, type Editor } from '@tiptap/react'

export interface TiptapHeadingProps {
  blockId: string
  initialContent?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}

export function TiptapHeading({ blockId, initialContent = '', level = 2, className = '' }: TiptapHeadingProps) {
  return (
    <div className={className} data-block-id={blockId} data-block-type="heading">
      <div contentEditable suppressContentEditableWarning className="outline-none">
        {initialContent || `Heading ${level}`}
      </div>
    </div>
  )
}

export default TiptapHeading