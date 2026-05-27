'use client'

import { useCallback, useState } from 'react'
import type { EditorMode } from '../types'

/**
 * Hook for accessing and controlling the editor mode
 */
export function useEditorMode() {
  const [editorMode, setEditorMode] = useState<EditorMode>('gridblock')

  const switchMode = useCallback((mode: EditorMode) => {
    setEditorMode(mode)
  }, [])

  const toggleMode = useCallback(() => {
    const newMode: EditorMode = editorMode === 'gridblock' ? 'classic' : 'gridblock'
    setEditorMode(newMode)
  }, [editorMode])

  const isGridBlock = editorMode === 'gridblock'
  const isClassic = editorMode === 'classic'

  return {
    editorMode,
    isGridBlock,
    isClassic,
    switchMode,
    toggleMode,
  }
}

export default useEditorMode