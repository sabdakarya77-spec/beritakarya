'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../../../../../store/editorStore'
import { buildEditorHtml, syncWordPressEditor } from '../adapter/WordPressSync'
import { isTextBlock } from '../../../core/blockGuards'
import type { WordPressWarning } from '../WordPressWarnings'

/**
 * useWordPressSync — bidirectional sync between contentEditable DOM and store.
 *
 * - store → DOM: rebuilds innerHTML when blocks change (with cursor preservation)
 * - DOM → store: parses editor HTML and applies block diffs via command layer
 * - returns warnings for mixed/unsupported structures
 */
export function useWordPressSync() {
  const {
    blocks,
    updateBlock,
    addBlock,
  } = useEditorStore()

  const editorRef = useRef<HTMLDivElement>(null)
  const syncingRef = useRef(false)
  const [warnings, setWarnings] = useState<WordPressWarning[]>([])
  const lastHtmlRef = useRef<string>('')

  // Build initial HTML from blocks
  const currentHtml = buildEditorHtml(blocks)

  // Set innerHTML from blocks (store → DOM), preserving cursor
  useEffect(() => {
    const el = editorRef.current
    if (!el || syncingRef.current) return
    if (el.innerHTML === currentHtml) return
    if (document.activeElement === el) return

    const sel = window.getSelection()
    let savedOffset = -1
    if (sel && sel.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const range = sel.getRangeAt(0).cloneRange()
      range.selectNodeContents(el)
      range.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset)
      savedOffset = range.toString().length
    }

    el.innerHTML = currentHtml
    lastHtmlRef.current = currentHtml

    if (savedOffset >= 0) {
      requestAnimationFrame(() => {
        el.focus()
        const newSel = window.getSelection()
        if (!newSel) return
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
        let currentLen = 0
        while (walker.nextNode()) {
          const node = walker.currentNode as Text
          const nodeLen = node.textContent?.length || 0
          if (currentLen + nodeLen >= savedOffset) {
            const offsetInNode = Math.min(savedOffset - currentLen, nodeLen)
            newSel.removeAllRanges()
            const r = document.createRange()
            r.setStart(node, offsetInNode)
            r.collapse(true)
            newSel.addRange(r)
            break
          }
          currentLen += nodeLen
        }
      })
    }
  }, [currentHtml])

  // Sync editor HTML → blocks via command layer
  const syncToBlocks = useCallback(() => {
    const el = editorRef.current
    if (!el || syncingRef.current) return
    syncingRef.current = true

    try {
      const editorHtml = el.innerHTML
      if (editorHtml === lastHtmlRef.current) return

      const result = syncWordPressEditor({
        editorHtml,
        currentBlocks: blocks,
        allowBlockCreation: true,
      })

      result.blocks.forEach((updatedBlock) => {
        const currentBlock = blocks.find((b) => b.id === updatedBlock.id)
        if (currentBlock) {
          for (const key of Object.keys(updatedBlock) as (keyof typeof updatedBlock)[]) {
            if (key !== 'id' && key !== 'type' && JSON.stringify(updatedBlock[key]) !== JSON.stringify(currentBlock[key as keyof typeof currentBlock])) {
              updateBlock(updatedBlock.id, updatedBlock as any)
              break
            }
          }
        }
      })

      if (result.blocks.length > blocks.length) {
        const newBlocks = result.blocks.filter(
          (nb) => !blocks.some((ob) => ob.id === nb.id)
        )
        for (const newBlock of newBlocks) {
          if (isTextBlock(newBlock.type)) {
            addBlock(newBlock.type, undefined)
          }
        }
      }

      const wpWarnings: WordPressWarning[] = []
      for (const msg of result.warnings) {
        wpWarnings.push({
          type: 'warning',
          message: msg,
        })
      }
      if (!result.isSafe) {
        wpWarnings.push({
          type: 'info',
          message: 'Artikel ini mungkin lebih cocok diedit di mode GridBlock untuk tata letak yang lebih presisi.',
        })
      }
      setWarnings(wpWarnings)
      lastHtmlRef.current = editorHtml
    } finally {
      syncingRef.current = false
    }
  }, [blocks, updateBlock, addBlock])

  return {
    editorRef,
    warnings,
    syncToBlocks,
  }
}