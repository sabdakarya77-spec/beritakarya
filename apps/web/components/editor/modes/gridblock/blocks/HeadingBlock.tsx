'use client'
import { useRef } from 'react'
import { useEditorStore } from '../../../../../store/editorStore'
import { useGridBlockNavigation } from '../shared/useGridBlockNavigation'
import type { HeadingBlock as THeadingBlock } from '@beritakarya/types'
// Import Tiptap components
import { TiptapHeading } from '../../../core/tiptap'

const SIZE: Record<number, string> = {
  1: 'font-serif text-3xl font-black tracking-tight md:text-4xl',
  2: 'font-serif text-[1.7rem] font-black tracking-tight md:text-[2rem] lg:text-[2.2rem]',
  3: 'font-serif text-[1.35rem] font-bold tracking-tight md:text-[1.55rem] lg:text-[1.7rem]',
  4: 'text-lg font-semibold tracking-tight md:text-xl',
  5: 'text-base font-semibold',
  6: 'text-sm font-semibold'
}

const LABELS: Record<number, string> = {
  2: 'Judul Seksi',
  3: 'Subjudul',
  4: 'Judul Kecil'
}

export function HeadingBlock({ block }: { block: THeadingBlock }) {
  // Always call hooks at the top level
  const editorRef = useRef<HTMLDivElement>(null)
  const { updateBlock, replaceBlock, addBlock, setActiveBlockId, getAdjacentBlockId } = useEditorStore()
  const { focusNextBlock, focusPrevBlock } = useGridBlockNavigation(editorRef)

  // Use TiptapHeading for the new implementation
  if (block.type === 'heading') {
    return <TiptapHeading 
      blockId={block.id} 
      initialContent={block.content || ''} 
      level={block.level}
    />
  }
  
  // Ensure level is within editorial bounds (2-4)
  const safeLevel = Math.max(2, Math.min(4, block.level))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current
    if (!editor) return

    // Enter → create a new paragraph below the heading
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Flush current content to store before adding new block
      updateBlock(block.id, { content: editor.innerText })
      addBlock('paragraph', block.id)
      // Focus the new paragraph block (it will have activeBlockId set by store)
      requestAnimationFrame(() => {
        focusNextBlock(block.id)
      })
      return
    }

    // Shift+Enter → soft line break within heading (like Word)
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      document.execCommand('insertHTML', false, '<br>')
      return
    }

    // Backspace at start of empty heading → convert to paragraph
    if (e.key === 'Backspace') {
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)
      
      const isEditorEmpty = !editor.textContent?.trim().length
      const cursorAtStart = isEditorEmpty || (
        range.startOffset === 0 &&
        (range.startContainer === editor || 
         (range.startContainer.nodeType === Node.TEXT_NODE && range.startContainer === editor.firstChild && range.startOffset === 0))
      )
      
      if (cursorAtStart) {
        e.preventDefault()
        replaceBlock(block.id, 'paragraph')
        return
      }
    }

    // Arrow Up at start → move to previous block
    if (e.key === 'ArrowUp') {
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)
      
      const totalTextLen = editor.textContent?.length || 0
      const cursorAtStart = totalTextLen === 0 || (
        range.startOffset === 0 &&
        (range.startContainer === editor.firstChild || range.startContainer === editor)
      )
      
      if (cursorAtStart) {
        const prevId = getAdjacentBlockId(block.id, 'up')
        if (prevId) {
          e.preventDefault()
          focusPrevBlock(block.id)
        }
        return
      }
    }

    // Arrow Down at end → move to next block
    if (e.key === 'ArrowDown') {
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)
      
      const totalTextLen = editor.textContent?.length || 0
      const cursorAtEnd = totalTextLen > 0 && range.startOffset >= totalTextLen
      
      if (cursorAtEnd) {
        const nextId = getAdjacentBlockId(block.id, 'down')
        if (nextId) {
          e.preventDefault()
          focusNextBlock(block.id)
        }
        return
      }
    }
  }

  return (
    <div className="group relative flex items-start gap-3 py-1">
      <div className="absolute -left-24 top-2 hidden w-20 justify-end group-hover:flex">
        <select
          value={safeLevel}
          onChange={e => updateBlock(block.id, { level: Number(e.target.value) as any })}
          className="cursor-pointer bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-400 outline-none hover:text-brand-red transition-colors"
        >
          {Object.entries(LABELS).map(([val, label]) => (
            <option key={val} value={val} className="text-gray-900">
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-block-id={block.id}
          onFocus={() => setActiveBlockId(block.id)}
          onBlur={e => updateBlock(block.id, { content: e.currentTarget.innerHTML })}
          onKeyDown={handleKeyDown}
          style={{ textAlign: block.textAlign || 'left' }}
          data-placeholder={`${LABELS[safeLevel as keyof typeof LABELS] || 'Heading'}...`}
          className={`outline-none text-slate-900 dark:text-white ${SIZE[safeLevel]} empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 dark:empty:before:text-white/10 empty:before:font-normal ${safeLevel === 2 ? 'leading-[1.1]' : safeLevel === 3 ? 'leading-[1.2]' : 'leading-tight'}`}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      </div>
    </div>
  )
}