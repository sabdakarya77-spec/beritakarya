'use client'

import { useCallback } from 'react'
import { useEditorStore } from '../../../../../store/editorStore'
import { sanitizeParagraphPaste } from './sanitizeParagraphPaste'

// Module-level ref for restoring cursor after mergeWithPrevious
let __mergeCursor: { blockId: string; offset: number } | null = null

export function getMergeCursor() {
  return __mergeCursor
}

export function setMergeCursor(value: { blockId: string; offset: number } | null) {
  __mergeCursor = value
}

/**
 * useParagraphBehavior — Behavior handler untuk paragraph block.
 *
 * Menangani:
 * - Enter → split block
 * - Shift+Enter → soft line break
 * - Backspace at start → merge with previous
 * - Delete at end → merge with next
 * - ArrowUp/ArrowDown → navigasi antar block
 * - Tab → indent
 * - Paste → sanitize
 */
export function useParagraphBehavior(
  blockId: string,
  editorRef: React.RefObject<HTMLDivElement | null>,
  focusNextBlock: () => void,
  focusPrevBlock: () => void,
) {
  const {
    updateBlock,
    splitBlock,
    mergeWithPrevious,
    getAdjacentBlockId,
    removeBlock,
  } = useEditorStore()

  const handleFormat = useCallback(() => {
    const element = editorRef.current
    if (element) {
      updateBlock(blockId, { content: element.innerHTML })
    }
  }, [blockId, editorRef, updateBlock])

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const htmlData = e.clipboardData.getData('text/html')
    const textData = e.clipboardData.getData('text/plain')
    let sanitized: string

    if (htmlData) {
      sanitized = sanitizeParagraphPaste(htmlData)
    } else if (textData) {
      sanitized = textData
        .replace(/&/g, '&#38;')
        .replace(/</g, '&#60;')
        .replace(/>/g, '&#62;')
        .replace(/\n/g, '&#60;br&#62;')
        .replace(/\r/g, '')
        .replace(/&#60;br&#62;/g, '<br>')
    } else {
      return
    }

    document.execCommand('insertHTML', false, sanitized)
    handleFormat()
  }, [handleFormat])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current
    if (!editor) return

    // Ctrl+B/I/U → inline formatting
    if ((e.ctrlKey || e.metaKey) && ['b', 'i', 'u'].includes(e.key)) {
      e.preventDefault()
      document.execCommand(e.key === 'b' ? 'bold' : e.key === 'i' ? 'italic' : 'underline', false)
      handleFormat()
      return
    }

    // A. Enter → split block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)

      const isEmpty = !editor.textContent?.trim()
      if (isEmpty) {
        const newBlockId = splitBlock(blockId, '', '')
        if (newBlockId) {
          requestAnimationFrame(() => {
            const allWrappers = document.querySelectorAll('[data-block-wrapper]')
            for (const w of allWrappers) {
              const el = w.querySelector('[contenteditable]') as HTMLElement | null
              if (el && el.dataset.blockId === newBlockId) {
                el.focus()
                const sel = window.getSelection()
                if (sel) {
                  sel.removeAllRanges()
                  const r = document.createRange()
                  r.setStart(el.firstChild || el, 0)
                  r.collapse(true)
                  sel.addRange(r)
                }
                return
              }
            }
          })
        }
        return
      }

      range.collapse(true)
      const beforeRange = range.cloneRange()
      beforeRange.selectNodeContents(editor)
      beforeRange.setEnd(range.endContainer, range.endOffset)
      const contentBefore = beforeRange.cloneContents()
      const tempBefore = document.createElement('div')
      tempBefore.appendChild(contentBefore)

      const afterRange = range.cloneRange()
      afterRange.selectNodeContents(editor)
      afterRange.setStart(range.endContainer, range.endOffset)
      const contentAfter = afterRange.cloneContents()
      const tempAfter = document.createElement('div')
      tempAfter.appendChild(contentAfter)

      const beforeHtml = tempBefore.innerHTML
      const afterHtml = tempAfter.innerHTML

      const newBlockId = splitBlock(blockId, beforeHtml, afterHtml)
      if (newBlockId) {
        requestAnimationFrame(() => {
          const allWrappers = document.querySelectorAll('[data-block-wrapper]')
          for (const w of allWrappers) {
            const el = w.querySelector('[contenteditable]') as HTMLElement | null
            if (el && el.dataset.blockId === newBlockId) {
              el.focus()
              const sel = window.getSelection()
              if (sel) {
                sel.removeAllRanges()
                const r = document.createRange()
                r.setStart(el.firstChild || el, 0)
                r.collapse(true)
                sel.addRange(r)
              }
              return
            }
          }
        })
      }
      return
    }

    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      document.execCommand('insertHTML', false, '<br>')
      return
    }

    // C. Backspace at start → merge with previous block
    if (e.key === 'Backspace') {
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)

      const isEditorEmpty = !editor.textContent?.trim().length
      const cursorAtStart = isEditorEmpty || (
        range.startOffset === 0 &&
        (!editor.contains(range.startContainer) || range.startContainer === editor ||
         (range.startContainer.nodeType === Node.TEXT_NODE && range.startContainer === editor.firstChild && range.startOffset === 0))
      )

      if (cursorAtStart) {
        e.preventDefault()
        const result = mergeWithPrevious(blockId)
        if (result) {
          __mergeCursor = { blockId: result.targetBlockId, offset: result.cursorOffset }
        }
        return
      }
    }

    if (e.key === 'Delete') {
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)
      const totalTextLen = editor.textContent?.length || 0
      const cursorOffset = range.startOffset
      const isAtEnd = totalTextLen > 0 && cursorOffset >= totalTextLen

      if (isAtEnd) {
        const nextId = getAdjacentBlockId(blockId, 'down')
        if (nextId) {
          const nextBlock = useEditorStore.getState().blocks.find(b => b.id === nextId)
          const isNextText = nextBlock?.type === 'paragraph' || nextBlock?.type === 'heading' || nextBlock?.type === 'quote'

          if (isNextText) {
            e.preventDefault()
            const nextContent = (nextBlock as any)?.content || ''
            const mergedContent = editor.innerHTML + nextContent
            updateBlock(blockId, { content: mergedContent })
            removeBlock(nextId)

            requestAnimationFrame(() => {
              const sel = window.getSelection()
              if (!sel) return
              sel.removeAllRanges()
              const r = document.createRange()
              const node = editor.firstChild
              if (node && node.nodeType === Node.TEXT_NODE) {
                r.setStart(node, node.textContent?.length || 0)
              } else {
                r.setStart(editor, editor.childNodes.length)
              }
              r.collapse(true)
              sel.addRange(r)
            })
          }
        }
        return
      }
    }

    if (e.key === 'ArrowUp') {
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)
      const totalTextLen = editor.textContent?.length || 0
      const cursorOffset = range.startOffset
      const isAtAbsoluteStart = totalTextLen === 0 || (cursorOffset === 0 && (range.startContainer === editor.firstChild || range.startContainer === editor))

      if (isAtAbsoluteStart) {
        const prevId = getAdjacentBlockId(blockId, 'up')
        if (prevId) {
          e.preventDefault()
          focusPrevBlock()
        }
        return
      }

      const rects = range.getClientRects()
      if (rects.length > 0 && rects[0].top >= editor.getBoundingClientRect().top && cursorOffset === 0) {
        const prevId = getAdjacentBlockId(blockId, 'up')
        if (prevId) {
          e.preventDefault()
          focusPrevBlock()
        }
      }
    }

    if (e.key === 'ArrowDown') {
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)
      const totalTextLen = editor.textContent?.length || 0
      const cursorOffset = range.startOffset
      const isAtAbsoluteEnd = totalTextLen > 0 && cursorOffset >= totalTextLen

      if (isAtAbsoluteEnd) {
        const nextId = getAdjacentBlockId(blockId, 'down')
        if (nextId) {
          e.preventDefault()
          focusNextBlock()
        }
        return
      }

      const rects = range.getClientRects()
      if (rects.length > 0) {
        const editorRect = editor.getBoundingClientRect()
        const lastRect = rects[rects.length - 1]
        if (lastRect.bottom >= editorRect.bottom - 1 && cursorOffset >= totalTextLen - 1) {
          const nextId = getAdjacentBlockId(blockId, 'down')
          if (nextId) {
            e.preventDefault()
            focusNextBlock()
          }
        }
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
      return
    }
  }, [blockId, editorRef, focusNextBlock, focusPrevBlock, updateBlock, splitBlock, mergeWithPrevious, getAdjacentBlockId, removeBlock, handleFormat])

  return {
    handleKeyDown,
    handlePaste,
    handleFormat,
  }
}