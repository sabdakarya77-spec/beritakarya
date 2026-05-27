'use client'

import { useMemo } from 'react'
import { useEditorStore } from '../../../../../store/editorStore'
import { isStructureSafe } from '../adapter/WordPressSync'

export type CompatibilityStatus = 'safe' | 'limited' | 'blocked'

export interface CompatibilityResult {
  status: CompatibilityStatus
  reason: string
  nonTextBlockCount: number
}

/**
 * useWordPressCompatibility — evaluate whether the current article
 * structure is safe/limited/blocked for WordPress editing.
 *
 * - `safe`:    ≤3 non-text blocks, no interleaving → full WordPress editing OK
 * - `limited`: >3 non-text blocks or interleaved → warnings shown, GridBlock recommended
 * - `blocked`: mixed structure heavily reliant on GridBlock features
 */
export function useWordPressCompatibility(): CompatibilityResult {
  const blocks = useEditorStore((s) => s.blocks)

  return useMemo(() => {
    const nonTextCount = blocks.filter((b) =>
      !['paragraph', 'heading', 'quote', 'list'].includes(b.type)
    ).length

    const isSafe = isStructureSafe(blocks)

    if (isSafe && nonTextCount === 0) {
      return {
        status: 'safe',
        reason: 'Artikel hanya berisi blok teks. Cocok untuk editing WordPress.',
        nonTextBlockCount: nonTextCount,
      }
    }

    if (isSafe && nonTextCount <= 3) {
      return {
        status: 'safe',
        reason: `Artikel memiliki ${nonTextCount} blok non-teks. Masih aman untuk editing WordPress.`,
        nonTextBlockCount: nonTextCount,
      }
    }

    if (nonTextCount > 3) {
      return {
        status: 'limited',
        reason: `Artikel memiliki ${nonTextCount} blok non-teks. GridBlock memberikan kontrol tata letak yang lebih baik.`,
        nonTextBlockCount: nonTextCount,
      }
    }

    return {
      status: 'blocked',
      reason: 'Struktur artikel tidak cocok untuk editor kontinu. Gunakan GridBlock.',
      nonTextBlockCount: nonTextCount,
    }
  }, [blocks])
}