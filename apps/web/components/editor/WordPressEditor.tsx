'use client'
import { useCallback, useEffect, useRef } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { InlineToolbar } from './blocks/InlineToolbar'
import { cn } from '../../lib/utils'

/**
 * WordPressEditor — merender SEMUA blok teks sebagai satu div[contenteditable] kontinu.
 * Untuk mode WordPress: tidak ada split/merge block, tidak ada slash command,
 * tidak ada konsep block di UI. Layaknya editor WordPress asli.
 * 
 * - Enter → <p> baru dalam satu kontainer
 * - Backspace/Delete → normal, tidak ada merge/unmerge block
 * - Block non-teks (image, embed, dll) tetap di-render terpisah
 * - Formatting via toolbar execCommand
 */
export function WordPressEditor() {
  const { blocks, updateBlock, setActiveBlockId, removeBlock } = useEditorStore()
  const editorRef = useRef<HTMLDivElement>(null)
  const syncingRef = useRef(false)

  // Build HTML string from text blocks
  const getEditorHTML = useCallback(() => {
    return blocks
      .filter(b => isTextBlock(b.type))
      .map(b => {
        switch (b.type) {
          case 'paragraph': return `<p data-block-id="${b.id}">${b.content || ''}</p>`
          case 'heading': return `<h${(b as any).level || 2} data-block-id="${b.id}">${b.content || ''}</h${(b as any).level || 2}>`
          case 'quote': return `<blockquote data-block-id="${b.id}">${b.content || ''}</blockquote>`
          case 'list': {
            const items = (b as any).items || ['']
            const tag = (b as any).ordered ? 'ol' : 'ul'
            return `<${tag} data-block-id="${b.id}">${items.map((i: string) => `<li>${i}</li>`).join('')}</${tag}>`
          }
          default: return ''
        }
      })
      .join('\n')
  }, [blocks])

  // Sync HTML → blocks on input
  const syncToBlocks = useCallback(() => {
    const el = editorRef.current
    if (!el || syncingRef.current) return
    syncingRef.current = true

    try {
      const children = Array.from(el.children)
      const textBlocks = blocks.filter(b => isTextBlock(b.type))
      let textIdx = 0

      for (const child of children) {
        const htmlEl = child as HTMLElement
        const tag = htmlEl.tagName.toLowerCase()
        const blockId = htmlEl.dataset.blockId

        if (tag === 'p' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
          const targetId = blockId || (textBlocks[textIdx]?.id)
          if (targetId) updateBlock(targetId, { content: htmlEl.innerHTML } as any)
          textIdx++
        } else if (tag === 'blockquote') {
          const targetId = blockId || (textBlocks[textIdx]?.id)
          if (targetId) updateBlock(targetId, { content: htmlEl.innerHTML } as any)
          textIdx++
        } else if (tag === 'ul' || tag === 'ol') {
          const targetId = blockId || (textBlocks[textIdx]?.id)
          if (targetId) {
            const items = Array.from(htmlEl.querySelectorAll('li')).map(li => li.innerHTML)
            updateBlock(targetId, { items } as any)
          }
          textIdx++
        }
      }
    } finally {
      syncingRef.current = false
    }
  }, [blocks, updateBlock])

  // Set innerHTML from blocks (store → DOM), preserving cursor
  useEffect(() => {
    const el = editorRef.current
    if (!el || syncingRef.current) return

    const newHTML = getEditorHTML()
    if (el.innerHTML === newHTML) return

    // Check if the editor has focus — if so, user is actively typing, skip DOM reset
    if (document.activeElement === el) return

    // Save cursor offset
    const sel = window.getSelection()
    let savedOffset = -1
    if (sel && sel.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const range = sel.getRangeAt(0).cloneRange()
      range.selectNodeContents(el)
      range.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset)
      savedOffset = range.toString().length
    }

    el.innerHTML = newHTML

    // Restore cursor
    if (savedOffset >= 0) {
      requestAnimationFrame(() => {
        el.focus()
        const newSel = window.getSelection()
        if (!newSel) return
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
        let currentLen = 0
        while (walker.nextNode()) {
          const node = walker.currentNode as Text
          const nodeLen = node.textContent?.length || 0
          if (currentLen + nodeLen >= savedOffset) {
            const offsetInNode = Math.min(savedOffset - currentLen, nodeLen)
            newSel.removeAllRanges()
            const r = document.createRange()
            r.setStart(node, offsetInNode)
            r.collapse(true)
            newSel.addRange(r)
            break
          }
          currentLen += nodeLen
        }
      })
    }
  }, [getEditorHTML])

  const handleFormat = useCallback(() => {
    syncToBlocks()
  }, [syncToBlocks])

  const handleInput = useCallback(() => {
    syncToBlocks()
  }, [syncToBlocks])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Let Enter work normally — contentEditable will create <div> or <br>.
    // We handle sync in onInput.
    
    // But we DON'T want Backspace/Delete to trigger block merge logic
    // (the legacy ParagraphBlock handlers won't fire since this is a different component)
  }, [])

  // Determine active block from cursor position
  const handleCursorMove = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const node = sel.getRangeAt(0).startContainer
    const htmlEl: HTMLElement | null =
      node.nodeType === Node.ELEMENT_NODE
        ? (node as HTMLElement)
        : (node.parentElement as HTMLElement)
    if (!htmlEl) return
    const blockEl: HTMLElement | null = htmlEl.dataset.blockId
      ? htmlEl
      : htmlEl.closest('[data-block-id]') as HTMLElement | null
    if (blockEl && blockEl.dataset.blockId) {
      setActiveBlockId(blockEl.dataset.blockId)
    }
  }, [setActiveBlockId])

  // Non-text blocks
  const nonTextBlocks = blocks.filter(b => !isTextBlock(b.type))

  return (
    <div className="relative">
      <InlineToolbar editorRef={editorRef as React.RefObject<HTMLElement | null>} onFormat={handleFormat} />

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Mulai menulis..."
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onClick={handleCursorMove}
        onKeyUp={handleCursorMove}
        onBlur={() => syncToBlocks()}
        className={cn(
          "min-h-[400px] outline-none font-serif text-[1.02rem] leading-8 tracking-[0.01em] text-brand-black dark:text-gray-200",
          "lg:text-[1.08rem] lg:leading-[2rem] xl:text-[1.14rem] xl:leading-[2.1rem]",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 dark:empty:before:text-white/20 empty:before:pointer-events-none",
          "[&_p]:my-0 [&_p]:py-0",
          "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2",
          "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-brand-red [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2",
          "[&_li]:my-1",
          "[&_b]:font-bold [&_strong]:font-bold",
          "[&_i]:italic [&_em]:italic",
          "[&_u]:underline",
          "[&_s]:line-through",
          "[&_a]:text-brand-red [&_a]:underline"
        )}
      />

      {/* Non-text blocks (image, embed, etc.) */}
      {nonTextBlocks.length > 0 && (
        <div className="mt-6 space-y-3">
          {nonTextBlocks.map((block) => (
            <div key={block.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{block.type}</span>
                <button
                  onClick={() => removeBlock(block.id)}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700"
                >
                  Hapus
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500 truncate">
                {block.type === 'image' && ((block as any).url || 'Belum ada gambar')}
                {block.type === 'embed' && ((block as any).url || 'Belum ada embed')}
                {block.type === 'callout' && ((block as any).content || '')}
                {block.type === 'mediaText' && ((block as any).content || '')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function isTextBlock(type: string): boolean {
  return ['paragraph', 'heading', 'quote', 'list'].includes(type)
}