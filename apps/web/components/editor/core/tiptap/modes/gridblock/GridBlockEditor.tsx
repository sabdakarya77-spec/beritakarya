'use client'

import React, { useMemo, useCallback } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { useEditorStore } from '../../../../../store/editorStore'
import { GridBlockToolbar } from './GridBlockToolbar'
import { GridBlockSlashMenu } from './GridBlockSlashMenu'

/**
 * GridBlockEditor Props
 */
export interface GridBlockEditorProps {
  blockId: string
  initialContent?: string
  className?: string
  onUpdate?: (content: string) => void
}

/**
 * GridBlockEditor Component
 * 
 * Main editor shell for GridBlock mode.
 * Provides full block-based editing experience with slash commands.
 */
export function GridBlockEditor({
  blockId,
  initialContent = '',
  className = '',
  onUpdate,
}: GridBlockEditorProps) {
  const { updateBlock } = useEditorStore()
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'blockquote'],
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Ketik judul...'
          }
          return 'Tulis paragraf... (ketik / untuk perintah)'
        },
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[200px]',
        'data-block-id': blockId,
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      updateBlock(blockId, { content: html })
      onUpdate?.(html)
    },
  })

  const wrapperClasses = useMemo(() => {
    return [
      'gridblock-editor',
      'relative',
      'border',
      'border-gray-200',
      'rounded-lg',
      'p-4',
      'bg-white',
      className,
    ].filter(Boolean).join(' ')
  }, [className])

  if (!editor) {
    return (
      <div className={wrapperClasses}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={wrapperClasses}>
      {/* Toolbar */}
      <GridBlockToolbar editor={editor} />
      
      {/* Slash Menu */}
      <GridBlockSlashMenu editor={editor} />
      
      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="mt-4 min-h-[150px]"
      />
    </div>
  )
}

export default GridBlockEditor