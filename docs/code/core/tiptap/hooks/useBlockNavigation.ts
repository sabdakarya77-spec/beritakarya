'use client'

import { useCallback } from 'react'
import type { Editor } from '@tiptap/react'

/**
 * Hook for navigating between blocks in the editor
 */
export function useBlockNavigation(editor: Editor | null) {
  const goToPreviousBlock = useCallback(() => {
    if (!editor) return false
    editor.commands.focus('start')
    return true
  }, [editor])

  const goToNextBlock = useCallback(() => {
    if (!editor) return false
    editor.commands.focus('end')
    return true
  }, [editor])

  const isAtFirstBlock = useCallback(() => {
    if (!editor) return true
    return editor.state.selection.from <= 1
  }, [editor])

  const isAtLastBlock = useCallback(() => {
    if (!editor) return true
    return editor.state.selection.to >= editor.state.doc.content.size - 1
  }, [editor])

  const getBlockCount = useCallback(() => {
    if (!editor) return 0
    return editor.state.doc.childCount
  }, [editor])

  const getCurrentBlockIndex = useCallback(() => {
    if (!editor) return -1
    return editor.state.selection.$from.index()
  }, [editor])

  return {
    goToPreviousBlock,
    goToNextBlock,
    isAtFirstBlock,
    isAtLastBlock,
    getBlockCount,
    getCurrentBlockIndex,
  }
}

export default useBlockNavigation