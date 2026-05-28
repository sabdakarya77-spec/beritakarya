'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { Editor } from '@tiptap/react'

/**
 * Autosave configuration
 */
export interface AutosaveConfig {
  /** Delay in ms before saving after changes */
  debounceMs?: number
  /** Callback when content should be saved */
  onSave: (content: string) => void | Promise<void>
  /** Whether autosave is enabled */
  enabled?: boolean
}

/**
 * Hook for autosaving editor content
 */
export function useAutosave(
  editor: Editor | null,
  config: AutosaveConfig
) {
  const { debounceMs = 1000, onSave, enabled = true } = config
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedRef = useRef<string>('')

  const save = useCallback(async () => {
    if (!editor || !enabled) return
    
    const content = editor.getHTML()
    
    // Only save if content changed
    if (content !== lastSavedRef.current) {
      lastSavedRef.current = content
      await onSave(content)
    }
  }, [editor, enabled, onSave])

  useEffect(() => {
    if (!editor || !enabled) return

    const handleUpdate = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(save, debounceMs)
    }

    editor.on('update', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [editor, enabled, debounceMs, save])

  return {
    /** Force save immediately */
    saveNow: save,
    /** Get last saved content */
    getLastSaved: () => lastSavedRef.current,
  }
}

export default useAutosave