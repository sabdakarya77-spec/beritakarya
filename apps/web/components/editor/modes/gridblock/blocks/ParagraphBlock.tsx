'use client'

import type { ParagraphBlock as TParagraphBlock } from '@beritakarya/types'
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
  return <ParagraphEditor block={block} />
}