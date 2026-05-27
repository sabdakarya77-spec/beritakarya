'use client'
import { useRef } from 'react'
import { useEditorStore } from '../../../../../store/editorStore'
import type { QuoteBlock as TQuoteBlock } from '@beritakarya/types'

export function QuoteBlock({ block }: { block: TQuoteBlock }) {
  const { updateBlock, addBlock, replaceBlock, setActiveBlockId, getAdjacentBlockId } = useEditorStore()
  const editorRef = useRef<HTMLDivElement>(null)
  const attributionRef = useRef<HTMLDivElement>(null)

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

    // Enter → exit quote mode (convert to paragraph) or create paragraph below
    if (e.key === 'Enter' && !e.shiftKey) {
      const isEditorEmpty = !editor.textContent?.trim().length
      
      if (isEditorEmpty) {
        // Empty quote → convert to paragraph (exit quote mode like Word)
        e.preventDefault()
        replaceBlock(block.id, 'paragraph')
        return
      }
      
      // Non-empty quote: flush content and create new paragraph below
      e.preventDefault()
      updateBlock(block.id, { content: editor.innerText })
      addBlock('paragraph', block.id)
      requestAnimationFrame(() => {
        focusNextBlock()
      })
      return
    }

    // Shift+Enter → soft line break within quote
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      document.execCommand('insertHTML', false, '<br>')
      return
    }

    // Backspace at start of empty quote → convert to paragraph
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
    <div className="border-l-4 border-blue-400 py-2 pl-5 lg:pl-6">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-block-id={block.id}
        onFocus={() => setActiveBlockId(block.id)}
        onBlur={e => updateBlock(block.id, { content: e.currentTarget.innerHTML })}
        onKeyDown={handleKeyDown}
        data-placeholder="Tulis kutipan..."
        className="font-serif text-[1.15rem] italic leading-8 text-gray-700 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:not-italic dark:text-gray-100 lg:text-[1.25rem] lg:leading-[2.2rem]"
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
      <div
        ref={attributionRef}
        contentEditable
        suppressContentEditableWarning
        data-block-id={block.id}
        onBlur={e => updateBlock(block.id, { attribution: e.currentTarget.innerText })}
        data-placeholder="— Nama narasumber"
        className="mt-3 text-sm uppercase tracking-[0.14em] text-gray-400 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
        dangerouslySetInnerHTML={{ __html: block.attribution || '' }}
      />
    </div>
  )
}