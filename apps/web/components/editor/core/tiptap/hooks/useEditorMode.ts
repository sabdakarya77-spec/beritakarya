'use client'

import { useCallback } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import type { EditorMode } from '../types'

/**
 * Hook for accessing and controlling the editor mode
 */
export function useEditorMode() {
  const { editorMode, setEditorMode } = useEditorStore()

  /**
   * Switch to a different editor mode
   */
  const switchMode = useCallback((mode: EditorMode) => {
    setEditorMode(mode)
  }, [setEditorMode])

  /**
   * Toggle between GridBlock and Classic modes
   */
  const toggleMode = useCallback(() => {
    const newMode: EditorMode = editorMode === 'gridblock' ? 'classic' : 'gridblock'
    setEditorMode(newMode)
  }, [editorMode, setEditorMode])

  /**
   * Check if current mode is GridBlock
   */
  const isGridBlock = editorMode === 'gridblock'

  /**
   * Check if current mode is Classic
   */
  const isClassic = editorMode === 'classic'

  return {
    // Current mode
    editorMode,
    
    // Mode checks
    isGridBlock,
    isClassic,
    
    // Mode switching
    switchMode,
    toggleMode,
  }
}

export default useEditorMode