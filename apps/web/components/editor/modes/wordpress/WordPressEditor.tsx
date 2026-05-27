'use client'

import { useCallback } from 'react'
import { useEditorStore } from '../../../../store/editorStore'
import { InlineToolbar } from '../../blocks/InlineToolbar'
import { cn } from '../../../../lib/utils'
import { WordPressWarnings } from './WordPressWarnings'
import { useWordPressSync } from './hooks/useWordPressSync'
import { useWordPressSelection } from './hooks/useWordPressSelection'
import { useWordPressCompatibility } from './hooks/useWordPressCompatibility'
import { isTextBlock } from '../../core/blockGuards'
import { projectBlocksToWordPressFlow } from './adapter/WordPressProjection'

/**
 * WordPressEditor — Thin container/orchestrator for WordPress mode.
 *
 * Delegates logic to hooks:
 * - useWordPressSync: bidirectional store ↔ DOM sync
 * - useWordPressSelection: cursor position → active block
 * - useWordPressCompatibility: article structure evaluation
 *
 * Renders:
 * - Warnings/CTA
 * - Inline toolbar
 * - Continuous contentEditable
 * - Non-text blocks section
 */
export function WordPressEditor() {
  const {
    blocks,
    setEditorMode,
    removeBlock,
  } = useEditorStore()

  const { editorRef, warnings, syncToBlocks } = useWordPressSync()
  const { handleCursorMove } = useWordPressSelection()
  const compatibility = useWordPressCompatibility()

  const handleInput = useCallback(() => {
    syncToBlocks()
  }, [syncToBlocks])

  const handleFormat = useCallback(() => {
    syncToBlocks()
  }, [syncToBlocks])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl+Shift+Enter → switch to GridBlock mode
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
      e.preventDefault()
      setEditorMode('gridblok' as any)
    }
  }, [setEditorMode])

  // Non-text blocks
  const nonTextBlocks = blocks.filter((b) => !isTextBlock(b.type))

  return (
    <div className="relative space-y-4">
      {/* Warnings */}
      {warnings.length > 0 && (
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
              Blok Media & Lainnya
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