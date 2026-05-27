'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../../../../../store/editorStore'
import { cn } from '../../../../../lib/utils'
import { InlineToolbar } from '../../../blocks/InlineToolbar'
import { useGridBlockNavigation } from '../shared/useGridBlockNavigation'
import { useParagraphBehavior, getMergeCursor, setMergeCursor } from './useParagraphBehavior'
import { ParagraphSlashMenu } from './ParagraphSlashMenu'
import type { ParagraphBlock as TParagraphBlock } from '@beritakarya/types'

/**
 * ParagraphEditor — Render editor paragraf dengan behavior lengkap.
 *
 * Menggunakan:
 * - useGridBlockNavigation → navigasi prev/next block
 * - useParagraphBehavior → enter, shift+enter, backspace, delete, arrow, paste, tab
 * - ParagraphSlashMenu → slash command (/)
 */
export function ParagraphEditor({ block }: { block: TParagraphBlock }) {
  const { updateBlock, activeBlockId, setActiveBlockId } = useEditorStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const { focusNextBlock, focusPrevBlock } = useGridBlockNavigation(editorRef)
  const { handleKeyDown, handlePaste, handleFormat } = useParagraphBehavior(
    block.id,
    editorRef,
    () => focusNextBlock(block.id),
    () => focusPrevBlock(block.id),
  )
  const isActive = activeBlockId === block.id

  // Sync DOM content when block.content changes
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    const nextValue = block.content || ''
    if (el.innerHTML !== nextValue) {
      el.innerHTML = nextValue
    }

    // After mergeWithPrevious: restore cursor at correct offset
    const cursor = getMergeCursor()
    if (cursor && cursor.blockId === block.id) {
      const offset = cursor.offset
      setMergeCursor(null)
      el.focus()
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        const r = document.createRange()
        const node = el.firstChild
        if (node && node.nodeType === Node.TEXT_NODE) {
          r.setStart(node, Math.min(offset, node.textContent?.length || 0))
        } else {
          r.setStart(el, 0)
        }
        r.collapse(true)
        sel.addRange(r)
      }
    }
  }, [block.content, block.id])

  return (
    <div ref={containerRef} className="relative group/p" data-block-wrapper>
      <InlineToolbar editorRef={editorRef} onFormat={handleFormat} active={isActive} />

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-block-id={block.id}
        onFocus={() => setActiveBlockId(block.id)}
        onClick={() => setActiveBlockId(block.id)}
        onInput={handleFormat}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{ textAlign: block.textAlign || 'left' }}
        onBlur={() => {
          const element = editorRef.current
          if (element) {
            updateBlock(block.id, { content: element.innerHTML })
          }
        }}
        data-placeholder="Tulis paragraf... (ketik '/' untuk opsi)"
        className={cn(
          "min-h-[1.75em] outline-none font-serif text-[1.02rem] leading-8 tracking-[0.01em] text-brand-black dark:text-gray-200 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 dark:empty:before:text-white/20 empty:before:pointer-events-none lg:text-[1.08rem] lg:leading-[2rem] xl:text-[1.14rem] xl:leading-[2.1rem]",
          "[&_b]:font-bold [&_strong]:font-bold",
          "[&_i]:italic [&_em]:italic",
          "[&_u]:underline",
          "[&_s]:line-through [&_strike]:line-through",
          "[&_a]:text-brand-red [&_a]:underline",
          block.dropCap && "[&::first-letter]:float-left [&::first-letter]:text-5xl [&::first-letter]:font-black [&::first-letter]:text-brand-red [&::first-letter]:leading-none [&::first-letter]:mr-2 [&::first-letter]:mt-1"
        )}
      />

      <ParagraphSlashMenu
        blockId={block.id}
        editorRef={editorRef}
        containerRef={containerRef}
      />
    </div>
  )
}