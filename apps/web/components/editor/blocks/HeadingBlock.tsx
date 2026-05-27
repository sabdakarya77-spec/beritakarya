'use client'
import { useRef } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import type { HeadingBlock as THeadingBlock } from '@beritakarya/types'

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
  const { updateBlock, replaceBlock, addBlock, setActiveBlockId, getAdjacentBlockId } = useEditorStore()
  const editorRef = useRef<HTMLDivElement>(null)

  // Ensure level is within editorial bounds (2-4)
  const safeLevel = Math.max(2, Math.min(4, block.level))

  const focusNextBlock = () => {
    const editor = editorRef.current
    if (!editor) return
    const wrapper = editor.closest('[data-block-wrapper]') as HTMLElement | null
    if (!wrapper) return
    const target = wrapper.nextElementSibling as HTMLElement | null
    if (!target) return
    const targetEditor = target.querySelector('[contenteditable]') as HTMLElement | null
    if (!targetEditor) return
    targetEditor.focus()
    const sel = window.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    const range = document.createRange()
    range.setStart(targetEditor.firstChild || targetEditor, 0)
    range.collapse(true)
    sel.addRange(range)
  }

  const focusPrevBlock = () => {
    const editor = editorRef.current
    if (!editor) return
    const wrapper = editor.closest('[data-block-wrapper]') as HTMLElement | null
    if (!wrapper) return
    const target = wrapper.previousElementSibling as HTMLElement | null
    if (!target) return
    const targetEditor = target.querySelector('[contenteditable]') as HTMLElement | null
    if (!targetEditor) return
    targetEditor.focus()
    const sel = window.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    const range = document.createRange()
    if (targetEditor.textContent) {
      const len = targetEditor.textContent.length
      range.setStart(targetEditor.firstChild!, len)
      range.collapse(true)
    }
    sel.addRange(range)
  }

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
        focusNextBlock()
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
          focusPrevBlock()
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
          focusNextBlock()
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