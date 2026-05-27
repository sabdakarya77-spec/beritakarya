'use client'

import { useState, useCallback } from 'react'
import type { Editor } from '@tiptap/react'

/**
 * Hook for managing editor selection state
 */
export function useSelection(editor: Editor | null) {
  const [selection, setSelection] = useState({ from: 0, to: 0 })

  const updateSelection = useCallback(() => {
    if (!editor) return
    const { from, to } = editor.state.selection
    setSelection({ from, to })
  }, [editor])

  const isSelected = useCallback((from: number, to: number) => {
    return selection.from === from && selection.to === to
  }, [selection])

  const hasSelection = useCallback(() => {
    return selection.from !== selection.to
  }, [selection])

  const getSelectedText = useCallback(() => {
    if (!editor) return ''
    return editor.state.doc.textBetween(selection.from, selection.to)
  }, [editor, selection])

  return {
    selection,
    updateSelection,
    isSelected,
    hasSelection,
    getSelectedText,
  }
}

export default useSelection