'use client'

import type { ParagraphBlock as TParagraphBlock } from '@beritakarya/types'
// Import Tiptap components
import { TiptapParagraph } from '../../../core/tiptap'
import { ParagraphEditor } from '../paragraph/ParagraphEditor'

/**
 * ParagraphBlock — Thin re-export to ParagraphEditor (split target).
 *
 * Semua logic pindah ke:
 * - paragraph/ParagraphEditor.tsx
 * - paragraph/ParagraphSlashMenu.tsx
 * - paragraph/useParagraphBehavior.ts
 * - paragraph/sanitizeParagraphPaste.ts
 */
export function ParagraphBlock({ block }: { block: TParagraphBlock }) {
  // Use TiptapParagraph for the new implementation
  if (block.type === 'paragraph') {
    return <TiptapParagraph 
      blockId={block.id} 
      initialContent={block.content || ''} 
    />
  }
  
  // Fallback to legacy implementation
  return <ParagraphEditor block={block} />
}
