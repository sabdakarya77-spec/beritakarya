'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../../../../store/editorStore'
import { InlineToolbar } from '../../blocks/InlineToolbar'
import { cn } from '../../../../lib/utils'
import { WordPressWarnings, type WordPressWarning } from './WordPressWarnings'
import { syncWordPressEditor, buildEditorHtml, isStructureSafe } from './WordPressSync'
import { projectBlocksToWordPressFlow } from './WordPressProjection'
import { isTextBlock } from '../../core/blockGuards'

/**
 * WordPressEditor — Modular WordPress mode adapter.
 *
 * Renders text blocks as a single continuous contentEditable,
 * with non-text blocks rendered below. All changes go through
 * the command layer via WordPressSync.
 *
 * Features:
 * - Continuous writing experience for text-dominant articles
 * - Non-text blocks rendered separately with position markers
 * - Warnings for mixed/unsupported article structures
 * - Fallback to GridBlock for complex layouts
 */
export function WordPressEditor() {
  const {
    blocks,
    updateBlock,
    setActiveBlockId,
    setEditorMode,
    removeBlock,
    addBlock,
  } = useEditorStore()

  const editorRef = useRef<HTMLDivElement>(null)
  const syncingRef = useRef(false)
  const [warnings, setWarnings] = useState<WordPressWarning[]>([])
  const lastHtmlRef = useRef<string>('')

  // Build initial HTML from blocks
  const currentHtml = buildEditorHtml(blocks)

  // Set innerHTML from blocks (store → DOM), preserving cursor
  useEffect(() => {
    const el = editorRef.current
    if (!el || syncingRef.current) return
    if (el.innerHTML === currentHtml) return
    if (document.activeElement === el) return

    // Save cursor offset if editor has focus
    const sel = window.getSelection()
    let savedOffset = -1
    if (sel && sel.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const range = sel.getRangeAt(0).cloneRange()
      range.selectNodeContents(el)
      range.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset)
      savedOffset = range.toString().length
    }

    el.innerHTML = currentHtml
    lastHtmlRef.current = currentHtml

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
  }, [currentHtml])

  // Sync editor HTML → blocks via command layer
  const syncToBlocks = useCallback(() => {
    const el = editorRef.current
    if (!el || syncingRef.current) return
    syncingRef.current = true

    try {
      const editorHtml = el.innerHTML
      if (editorHtml === lastHtmlRef.current) return

      const result = syncWordPressEditor({
        editorHtml,
        currentBlocks: blocks,
        allowBlockCreation: true,
      })

      // Apply block updates
      result.blocks.forEach((updatedBlock) => {
        const currentBlock = blocks.find((b) => b.id === updatedBlock.id)
        if (currentBlock) {
          // Only update if something changed
          for (const key of Object.keys(updatedBlock) as (keyof typeof updatedBlock)[]) {
            if (key !== 'id' && key !== 'type' && JSON.stringify(updatedBlock[key]) !== JSON.stringify(currentBlock[key as keyof typeof currentBlock])) {
              updateBlock(updatedBlock.id, updatedBlock as any)
              break
            }
          }
        }
      })

      // Handle newly created blocks (from extra paragraphs)
      if (result.blocks.length > blocks.length) {
        const newBlocks = result.blocks.filter(
          (nb) => !blocks.some((ob) => ob.id === nb.id)
        )
        for (const newBlock of newBlocks) {
          if (isTextBlock(newBlock.type)) {
            addBlock(newBlock.type, undefined)
          }
        }
      }

      // Update warnings
      const wpWarnings: WordPressWarning[] = []
      for (const msg of result.warnings) {
        wpWarnings.push({
          type: 'warning',
          message: msg,
        })
      }
      if (!result.isSafe) {
        wpWarnings.push({
          type: 'info',
          message: 'Artikel ini mungkin lebih cocok diedit di mode GridBlock untuk tata letak yang lebih presisi.',
        })
      }
      setWarnings(wpWarnings)
      lastHtmlRef.current = editorHtml
    } finally {
      syncingRef.current = false
    }
  }, [blocks, updateBlock, addBlock])

  // Detect active block from cursor position
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

  const handleInput = useCallback(() => {
    syncToBlocks()
  }, [syncToBlocks])

  const handleFormat = useCallback(() => {
    syncToBlocks()
  }, [syncToBlocks])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Let Enter work normally — contentEditable creates <p> or <div>.
    // We handle sync in onInput.
    // Ctrl+Shift+Enter → switch to GridBlock mode
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
      e.preventDefault()
      setEditorMode('gridblok' as any)
    }
  }, [setEditorMode])

  // Non-text blocks
  const nonTextBlocks = blocks.filter((b) => !isTextBlock(b.type))
  const flow = projectBlocksToWordPressFlow(blocks)

  return (
    <div className="relative space-y-4">
      {/* Warnings */}
      {flow.warnings.length > 0 && (
        <WordPressWarnings
          warnings={warnings}
          onSwitchToGridBlock={() => setEditorMode('gridblok' as any)}
        />
      )}

      {/* Inline Toolbar */}
      <InlineToolbar
        editorRef={editorRef as React.RefObject<HTMLElement | null>}
        onFormat={handleFormat}
      />

      {/* Continuous Editor */}
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

      {/* Non-text blocks section */}
      {nonTextBlocks.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Blok Media &amp; Lainnya
            </span>
            <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
          </div>

          {nonTextBlocks.map((block) => (
            <div
              key={block.id}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {block.type}
                </span>
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
                {block.type === 'gallery' && `${(block as any).images?.length || 0} gambar`}
                {block.type === 'imageGrid' && `${(block as any).images?.length || 0} gambar`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}