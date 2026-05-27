'use client'

import { useCallback, useEffect } from 'react'
import { useEditorStore } from '../../../../store/editorStore'
import { GridBlockList } from './GridBlockList'
import { handleGridBlockShortcut } from './gridblock.shortcuts'

export function GridBlockEditor() {
  const { blocks, activeBlockId, moveBlock, removeBlock, addBlock, undo } = useEditorStore()

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
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return <GridBlockList />
}