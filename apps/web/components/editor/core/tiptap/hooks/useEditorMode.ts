'use client'

import { useCallback } from 'react'
import { useEditorStore } from '../../../../../store/editorStore'

/**
 * Hook for accessing and controlling the editor mode
 * 
 * Uses the Zustand store for centralized state management.
 * Naming convention: 'gridblock' (Tiptap) vs 'wordpress' (Classic)
 */
export function useEditorMode() {
  const editorMode = useEditorStore((s) => s.editorMode)
  const setEditorMode = useEditorStore((s) => s.setEditorMode)

  const switchMode = useCallback((mode: 'gridblock' | 'wordpress') => {
    // Map 'gridblock' to store's 'gridblok' naming
    const storeMode = mode === 'gridblock' ? 'gridblok' : 'wordpress'
    setEditorMode(storeMode)
  }, [setEditorMode])

  const toggleMode = useCallback(() => {
    // Map store's 'gridblok' to 'gridblock' for toggle logic
    const newMode: 'gridblok' | 'wordpress' = editorMode === 'gridblok' ? 'wordpress' : 'gridblok'
    setEditorMode(newMode)
  }, [editorMode, setEditorMode])

  const isGridBlock = editorMode === 'gridblok'
  const isWordPress = editorMode === 'wordpress'

  return {
    editorMode,
    isGridBlock,
    isWordPress,
    switchMode,
    toggleMode,
  }
}

export default useEditorMode