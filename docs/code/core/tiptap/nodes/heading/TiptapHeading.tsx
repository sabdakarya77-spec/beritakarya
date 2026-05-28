'use client'

import React, { useMemo } from 'react'
import { EditorContent, type Editor } from '@tiptap/react'
import { useTiptapBridge } from '../../bridges/useTiptapBridge'
import { useEditorStore } from '../../../../../../store/editorStore'
import { BubbleMenuToolbar } from '../../menus/TiptapBubbleMenu'

export interface TiptapHeadingProps {
  blockId: string
  initialContent?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  onContentChange?: (content: string) => void
}

const SIZE_CLASSES: Record<number, string> = {
  1: 'font-serif text-3xl font-black tracking-tight md:text-4xl leading-[1.1]',
  2: 'font-serif text-[1.7rem] font-black tracking-tight md:text-[2rem] lg:text-[2.2rem] leading-[1.1]',
  3: 'font-serif text-[1.35rem] font-bold tracking-tight md:text-[1.55rem] lg:text-[1.7rem] leading-[1.2]',
  4: 'text-lg font-semibold tracking-tight md:text-xl leading-tight',
  5: 'text-base font-semibold leading-tight',
  6: 'text-sm font-semibold leading-tight',
}

const LABELS: Record<number, string> = {
  2: 'Judul Seksi',
  3: 'Subjudul',
  4: 'Judul Kecil',
}

export function TiptapHeading({ 
  blockId, 
  initialContent = '', 
  level = 2, 
  className = '',
  onContentChange 
}: TiptapHeadingProps) {
  const { updateBlock } = useEditorStore()
  
  const editor = useTiptapBridge({
    blockId,
    initialContent,
    placeholder: level >= 2 && level <= 4 ? `${LABELS[level] || 'Heading'}...` : `Heading ${level}...`,
    onUpdate: onContentChange,
  })

  // Convert level for Tiptap (Tiptap uses 1-6, but editorial uses 2-4)
  const tiptapLevel = level >= 2 && level <= 4 ? level : 2
  
  const wrapperClasses = useMemo(() => {
    const classes = [
      'relative',
      'group',
      'heading-wrapper',
      'flex',
      'items-start',
      'gap-3',
      'py-1',
    ]
    if (className) classes.push(className)
    return classes.join(' ')
  }, [className])

  const editorClasses = useMemo(() => {
    const classes = [
      'flex-1',
      'outline-none',
      SIZE_CLASSES[level] || SIZE_CLASSES[2],
      'text-slate-900',
      'dark:text-white',
      'ProseMirror-heading',
    ]
    return classes.join(' ')
  }, [level])

  // Get the label for the select dropdown
  const safeLevel = Math.max(2, Math.min(4, level))

  if (!editor) {
    return (
      <div className={wrapperClasses} data-block-id={blockId} data-block-type="heading">
        <div className={editorClasses}>{initialContent || `Heading ${level}`}</div>
      </div>
    )
  }

  return (
    <div className={wrapperClasses} data-block-id={blockId} data-block-type="heading">
      {/* Level selector - visible on hover */}
      <div className="absolute -left-24 top-2 hidden w-20 justify-end group-hover:flex">
        <select
          value={safeLevel}
          onChange={e => {
            const newLevel = Number(e.target.value) as 2 | 3 | 4
            updateBlock(blockId, { level: newLevel })
          }}
          className="cursor-pointer bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-400 outline-none hover:text-brand-red transition-colors"
        >
          {Object.entries(LABELS).map(([val, label]) => (
            <option key={val} value={val} className="text-gray-900">
              {label}
            </option>
          ))}
        </select>
      </div>

      <BubbleMenuToolbar editor={editor} />
      <EditorContent 
        editor={editor} 
        className={editorClasses}
      />
    </div>
  )
}

export default TiptapHeading