'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useEditorStore } from '../../../../store/editorStore'
import { GridBlockList } from './GridBlockList'
import { handleGridBlockShortcut } from './gridblock.shortcuts'

/**
 * GridBlockEditor — Container mode untuk GridBlock.
 *
 * Shortcut scoped ke editor container (ref), bukan global window,
 * untuk menghindari konflik shortcut dengan mode lain.
 */
export function GridBlockEditor() {
  const { blocks, activeBlockId, moveBlock, removeBlock, addBlock, undo } = useEditorStore()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const action = handleGridBlockShortcut(event, { activeBlockId, blocks })
    
    switch (action.type) {
      case 'MOVE_BLOCK_UP':
        if (activeBlockId) moveBlock(activeBlockId, 'up')
        break
      case 'MOVE_BLOCK_DOWN':
        if (activeBlockId) moveBlock(activeBlockId, 'down')
        break
      case 'REMOVE_BLOCK':
        if (activeBlockId && confirm('Hapus blok ini?')) removeBlock(activeBlockId)
        break
      case 'ADD_BLOCK_AFTER':
        if (activeBlockId) addBlock(action.blockType, activeBlockId)
        break
      case 'UNDO':
        undo()
        break
      case 'NONE':
        break
    }
  }, [activeBlockId, blocks, moveBlock, removeBlock, addBlock, undo])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Scoped to editor container instead of global window
    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div ref={containerRef} tabIndex={0} className="outline-none">
      <GridBlockList />
    </div>
  )
}