/**
 * LEGACY TRANSITION FILE
 *
 * This legacy file has been refactored to remove WordPress branching.
 * WordPress mode logic now lives in `modes/wordpress/` and uses its own wrapper.
 * GridBlock mode uses `modes/gridblock/GridBlockWrapper.tsx`.
 *
 * This file remains as a simple wrapper for backward compatibility during migration.
 * New code should use `modes/gridblock/GridBlockWrapper` directly.
 *
 * @deprecated Use `modes/gridblock/GridBlockWrapper` for new development.
 */
'use client'
import { type ReactNode } from 'react'
import { useEditorStore } from '../../store/editorStore'
import type { Block } from '@beritakarya/types'

// Re-export GridBlockWrapper as BlockWrapper for legacy compatibility
import { GridBlockWrapper } from './modes/gridblock/GridBlockWrapper'

interface Props {
  block: Block
  index: number
  children: ReactNode
}

export function BlockWrapper({ block, index, children }: Props) {
  const { editorMode } = useEditorStore()

  // In WordPress mode, render a minimal wrapper without block controls
  if (editorMode === 'wordpress') {
    return (
      <div className="py-0.5" data-block-wrapper={`block-${block.id}`}>
        {children}
      </div>
    )
  }

  // GridBlock mode: delegate to the modular GridBlockWrapper
  return (
    <GridBlockWrapper block={block} index={index}>
      {children}
    </GridBlockWrapper>
  )
}