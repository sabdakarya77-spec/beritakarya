'use client'

import { useCallback } from 'react'
import { useEditorStore } from '../../../../../store/editorStore'

/**
 * useGridBlockNavigation — Shared navigation hook for GridBlock text blocks.
 *
 * Fungsi:
 * - focusNextBlock: pindah kursor ke block berikutnya (posisi awal)
 * - focusPrevBlock: pindah kursor ke block sebelumnya (posisi akhir)
 *
 * Digunakan oleh ParagraphBlock, HeadingBlock, QuoteBlock, ListBlock.
 */
export function useGridBlockNavigation(editorRef: React.RefObject<HTMLDivElement | null>) {
  const getAdjacentBlockId = useEditorStore((s) => s.getAdjacentBlockId)

  const focusNextBlock = useCallback((fromBlockId: string) => {
    const editor = editorRef.current
    if (!editor) return
    const wrapper = editor.closest('[data-block-wrapper]') as HTMLElement | null
    if (!wrapper) return
    const target = wrapper.nextElementSibling as HTMLElement | null
    if (!target) return
    const targetEditor = target.querySelector('[contenteditable]') as HTMLElement | null
    if (!targetEditor) return
    targetEditor.focus()
    const sel = window.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    const range = document.createRange()
    range.setStart(targetEditor.firstChild || targetEditor, 0)
    range.collapse(true)
    sel.addRange(range)
  }, [editorRef])

  const focusPrevBlock = useCallback((fromBlockId: string) => {
    const editor = editorRef.current
    if (!editor) return
    const wrapper = editor.closest('[data-block-wrapper]') as HTMLElement | null
    if (!wrapper) return
    const target = wrapper.previousElementSibling as HTMLElement | null
    if (!target) return
    const targetEditor = target.querySelector('[contenteditable]') as HTMLElement | null
    if (!targetEditor) return
    targetEditor.focus()
    const sel = window.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    const range = document.createRange()
    if (targetEditor.textContent) {
      const len = targetEditor.textContent.length
      range.setStart(targetEditor.firstChild!, len)
      range.collapse(true)
    }
    sel.addRange(range)
  }, [editorRef])

  return {
    focusNextBlock,
    focusPrevBlock,
  }
}