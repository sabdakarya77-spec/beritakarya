'use client'

import { useCallback } from 'react'
import { useEditorStore } from '../../../../../store/editorStore'

/**
 * useWordPressSelection — save/restore cursor position and set active block.
 *
 * Detects which block the cursor is currently inside based on `data-block-id`
 * attributes in the contentEditable, and updates `activeBlockId` accordingly.
 */
export function useWordPressSelection() {
  const setActiveBlockId = useEditorStore((s) => s.setActiveBlockId)

  const handleCursorMove = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return

    const node = sel.getRangeAt(0).startContainer
    const htmlEl: HTMLElement | null =
      node.nodeType === Node.ELEMENT_NODE
        ? (node as HTMLElement)
        : (node.parentElement as HTMLElement)
    if (!htmlEl) return

    const blockEl: HTMLElement | null = htmlEl.dataset.blockId
      ? htmlEl
      : htmlEl.closest('[data-block-id]') as HTMLElement | null

    if (blockEl && blockEl.dataset.blockId) {
      setActiveBlockId(blockEl.dataset.blockId)
    }
  }, [setActiveBlockId])

  return {
    handleCursorMove,
  }
}