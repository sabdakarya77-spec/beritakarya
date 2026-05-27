'use client'

import React, { useMemo } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { useEditorStore } from '../../../../../store/editorStore'
import { ClassicToolbar } from './ClassicToolbar'

/**
 * ClassicEditor Props
 */
export interface ClassicEditorProps {
  blockId: string
  initialContent?: string
  className?: string
  onUpdate?: (content: string) => void
}

/**
 * ClassicEditor Component
 * 
 * Main editor shell for Classic/WordPress mode.
 * Provides continuous writing experience similar to classic editors.
 */
export function ClassicEditor({
  blockId,
  initialContent = '',
  className = '',
  onUpdate,
}: ClassicEditorProps) {
  const { updateBlock } = useEditorStore()
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Mulai menulis...',
        showOnlyWhenEditable: true,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none min-h-[300px] font-serif text-lg leading-relaxed',
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
      'classic-editor',
      'relative',
      'bg-white',
      'rounded-lg',
      className,
    ].filter(Boolean).join(' ')
  }, [className])

  if (!editor) {
    return (
      <div className={wrapperClasses}>
        <div className="animate-pulse p-8">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={wrapperClasses}>
      {/* Minimal Toolbar */}
      <ClassicToolbar editor={editor} />
      
      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="p-6"
      />
    </div>
  )
}

export default ClassicEditor