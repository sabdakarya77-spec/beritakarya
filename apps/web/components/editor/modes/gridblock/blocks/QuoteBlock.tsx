'use client'

import { TiptapQuote } from '../../../core/tiptap'
import type { QuoteBlock as TQuoteBlock } from '@beritakarya/types'

/**
 * QuoteBlock — Thin wrapper using TiptapQuote for the new implementation.
 * 
 * Phase 7: Integrated with Tiptap for rich text editing.
 */
export function QuoteBlock({ block }: { block: TQuoteBlock }) {
  return (
    <TiptapQuote 
      blockId={block.id} 
      initialContent={block.content || ''} 
      attribution={block.attribution || ''}
    />
  )
}