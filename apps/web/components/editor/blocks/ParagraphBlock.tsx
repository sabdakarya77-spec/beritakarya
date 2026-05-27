'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Type, Heading1, List, Quote, Sparkles, Image, Grid2X2, GalleryVertical, PlaySquare, Newspaper } from 'lucide-react'
import { useEditorStore } from '../../../store/editorStore'
import { cn } from '../../../lib/utils'
import { InlineToolbar } from './InlineToolbar'
import type { ParagraphBlock as TParagraphBlock, Block } from '@beritakarya/types'

const BLOCK_TYPES: { type: Block['type']; label: string; desc: string; aliases: string[]; icon: typeof Type }[] = [
  { type: 'heading', label: 'Subjudul', desc: 'Bagi artikel jadi bagian yang jelas', aliases: ['judul', 'heading', 'h2', 'subjudul'], icon: Heading1 },
  { type: 'list', label: 'Daftar', desc: 'Poin fakta, kronologi, atau rangkuman', aliases: ['list', 'bullet', 'daftar', 'poin'], icon: List },
  { type: 'quote', label: 'Kutipan', desc: 'Sorot pernyataan narasumber', aliases: ['quote', 'kutipan', 'narasumber'], icon: Quote },
  { type: 'callout', label: 'Highlight', desc: 'Tegaskan informasi paling penting', aliases: ['highlight', 'callout', 'sorot'], icon: Sparkles },
  { type: 'image', label: 'Gambar', desc: 'Masukkan satu foto utama', aliases: ['gambar', 'foto', 'image'], icon: Image },
  { type: 'imageGrid', label: 'Grid Gambar', desc: 'Tampilkan dua atau tiga visual sejajar', aliases: ['grid', 'galeri', 'foto'], icon: Grid2X2 },
  { type: 'gallery', label: 'Galeri', desc: 'Kumpulkan foto dalam satu blok', aliases: ['gallery', 'galeri', 'slideshow'], icon: GalleryVertical },
  { type: 'embed', label: 'Embed', desc: 'Sisipkan YouTube atau konten eksternal', aliases: ['embed', 'youtube', 'video'], icon: PlaySquare },
  { type: 'mediaText', label: 'Media + Teks', desc: 'Gambar bersanding dengan paragraf', aliases: ['media', 'gambar', 'teks', 'media text', 'mediatext'], icon: Newspaper },
]

export function ParagraphBlock({ block }: { block: TParagraphBlock }) {
  const { updateBlock, replaceBlock, addBlock, activeBlockId, setActiveBlockId, splitBlock, mergeWithPrevious, getAdjacentBlockId, removeBlock } = useEditorStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const slashRangeRef = useRef<Range | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 40, left: 0 })
  const isActive = activeBlockId === block.id

  const pendingCursorRef = useRef<{ offset: number } | null>(null)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return

    const nextValue = block.content || ''
    if (el.innerHTML !== nextValue) {
      el.innerHTML = nextValue
    }

    // Restore cursor if this block was the merge target
    if (pendingCursorRef.current) {
      const offset = pendingCursorRef.current.offset
      pendingCursorRef.current = null
      el.focus()
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        const r = document.createRange()
        const node = el.firstChild
        if (node && node.nodeType === Node.TEXT_NODE) {
          r.setStart(node, Math.min(offset, node.textContent?.length || 0))
        } else {
          r.setStart(el, 0)
        }
        r.collapse(true)
        sel.addRange(r)
      }
    }
  }, [block.content])

  const matchingBlocks = useMemo(() => {
    const query = slashQuery.trim().toLowerCase()
    if (!query) return BLOCK_TYPES

    return BLOCK_TYPES.filter(({ label, desc, aliases }) =>
      [label, desc, ...aliases].some((value) => value.toLowerCase().includes(query))
    )
  }, [slashQuery])

  const getTextBeforeCaret = () => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection || !selection.rangeCount) return null

    const range = selection.getRangeAt(0)
    if (!editor.contains(range.commonAncestorContainer)) return null

    const beforeCaretRange = range.cloneRange()
    beforeCaretRange.selectNodeContents(editor)
    beforeCaretRange.setEnd(range.endContainer, range.endOffset)
    return beforeCaretRange.toString()
  }

  const extractSlashCommand = (value: string) => {
    // Normalisasi spasi dan ambil teks hingga kursor
    const normalized = value.replace(/\u00a0/g, ' ')
    // Cari '/' terakhir yang didahului oleh spasi atau awal baris
    const lastSlashIndex = normalized.lastIndexOf('/')
    
    if (lastSlashIndex === -1) {
      return { isCommand: false, query: '', textStart: -1, textEnd: -1 }
    }

    // Pastikan '/' didahului spasi atau awal baris
    const charBefore = lastSlashIndex > 0 ? normalized[lastSlashIndex - 1] : ' '
    if (charBefore !== ' ' && charBefore !== '\n') {
      return { isCommand: false, query: '', textStart: -1, textEnd: -1 }
    }

    const query = normalized.slice(lastSlashIndex + 1)
    // Query hanya boleh alphanumeric (opsional)
    if (!/^[a-zA-Z0-9-]*$/.test(query)) {
      return { isCommand: false, query: '', textStart: -1, textEnd: -1 }
    }

    return {
      isCommand: true,
      query: query,
      textStart: lastSlashIndex,
      textEnd: normalized.length
    }
  }

  const createRangeFromTextOffsets = (root: HTMLElement, start: number, end: number) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const range = document.createRange()
    let currentOffset = 0
    let lastTextNode: Text | null = null
    let startNode: Text | null = null
    let endNode: Text | null = null
    let startOffset = 0
    let endOffset = 0

    while (walker.nextNode()) {
      const node = walker.currentNode as Text
      const textLength = node.textContent?.length ?? 0
      const nextOffset = currentOffset + textLength
      lastTextNode = node

      if (!startNode && start <= nextOffset) {
        startNode = node
        startOffset = Math.max(0, start - currentOffset)
      }

      if (end <= nextOffset) {
        endNode = node
        endOffset = Math.max(0, end - currentOffset)
        break
      }

      currentOffset = nextOffset
    }

    if (!startNode || !endNode) {
      if (!lastTextNode) return null
      range.setStart(lastTextNode, lastTextNode.textContent?.length ?? 0)
      range.setEnd(lastTextNode, lastTextNode.textContent?.length ?? 0)
      return range
    }

    range.setStart(startNode, startOffset)
    range.setEnd(endNode, endOffset)
    return range
  }

  const updateSlashMenuPosition = () => {
    const container = containerRef.current
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!container || !editor || !selection || !selection.rangeCount) return

    const selectionRange = selection.getRangeAt(0)
    const resolvedRange = editor.contains(selectionRange.commonAncestorContainer)
      ? selectionRange.cloneRange()
      : slashRangeRef.current?.cloneRange()
    if (!resolvedRange) return

    resolvedRange.collapse(false)

    const rect = resolvedRange.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const menuWidth = Math.min(416, Math.max(288, containerRect.width - 16))

    // Fallback positioning if getBoundingClientRect returns zero (can happen in empty blocks)
    if (rect.top === 0 && rect.left === 0) {
      const editorRect = editor.getBoundingClientRect()
      setSlashMenuPosition({
        top: editorRect.bottom - containerRect.top + 5,
        left: 0
      })
      return
    }

    const nextTop = rect.bottom - containerRect.top + 10
    const rawLeft = rect.left - containerRect.left
    const maxLeft = Math.max(0, containerRect.width - menuWidth - 8)
    const nextLeft = Math.min(Math.max(0, rawLeft), maxLeft)

    setSlashMenuPosition({
      top: nextTop,
      left: nextLeft
    })
  }

  const handleInput = () => {
    const element = editorRef.current
    if (!element) return

    const html = element.innerHTML
    updateBlock(block.id, { content: html })

    const textBeforeCaret = getTextBeforeCaret()
    const command = extractSlashCommand(textBeforeCaret || '')
    slashRangeRef.current =
      command.isCommand && textBeforeCaret
        ? createRangeFromTextOffsets(element, command.textStart, command.textEnd)
        : null

    setShowMenu(command.isCommand)
    setSlashQuery(command.query)
    if (command.isCommand) {
      requestAnimationFrame(() => updateSlashMenuPosition())
    }
  }

  const handleSelect = (type: Block['type']) => {
    const element = editorRef.current
    const slashRange = slashRangeRef.current

    if (!element || !slashRange) {
      replaceBlock(block.id, type)
      setShowMenu(false)
      setSlashQuery('')
      slashRangeRef.current = null
      return
    }

    const cleanupRange = slashRange.cloneRange()
    cleanupRange.deleteContents()
    element.normalize()

    const nextHtml = element.innerHTML
    const remainingText = (element.textContent || '').replace(/\u00a0/g, ' ').trim()

    if (!remainingText) {
      replaceBlock(block.id, type)
    } else {
      updateBlock(block.id, { content: nextHtml })
      addBlock(type, block.id)
    }

    setShowMenu(false)
    setSlashQuery('')
    slashRangeRef.current = null
  }

  const handleFormat = (command: string) => {
    const element = editorRef.current
    if (element) {
      updateBlock(block.id, { content: element.innerHTML })
    }
  }

  const focusPrevNextBlock = (direction: 'up' | 'down') => {
    const editor = editorRef.current
    if (!editor) return
    const wrapper = editor.closest('[data-block-wrapper]') as HTMLElement | null
    if (!wrapper) return
    const target = direction === 'up'
      ? (wrapper.previousElementSibling as HTMLElement | null)
      : (wrapper.nextElementSibling as HTMLElement | null)
    if (!target) return
    const targetEditor = target.querySelector('[contenteditable]') as HTMLElement | null
    if (!targetEditor) return
    targetEditor.focus()
    const sel = window.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    const range = document.createRange()
    if (direction === 'up') {
      if (targetEditor.textContent) {
        const len = targetEditor.textContent.length
        range.setStart(targetEditor.firstChild!, len)
        range.collapse(true)
      }
    } else {
      range.setStart(targetEditor.firstChild || targetEditor, 0)
      range.collapse(true)
    }
    sel.addRange(range)
  }

  const focusAtOffset = (targetBlockId: string, offset: number) => {
    requestAnimationFrame(() => {
      const allWrappers = document.querySelectorAll('[data-block-wrapper]')
      for (const w of allWrappers) {
        const editorEl = w.querySelector('[contenteditable]') as HTMLElement | null
        if (!editorEl) continue
        if ((editorEl as HTMLElement).dataset.blockId === targetBlockId) {
          editorEl.focus()
          const sel = window.getSelection()
          if (!sel) return
          sel.removeAllRanges()
          const r = document.createRange()
          const node = editorEl.firstChild
          if (node && node.nodeType === Node.TEXT_NODE) {
            r.setStart(node, Math.min(offset, node.textContent?.length || 0))
          } else {
            r.setStart(editorEl, 0)
          }
          r.collapse(true)
          sel.addRange(r)
          return
        }
      }
    })
  }

  const sanitizePastedHTML = (html: string): string => {
    // Parse HTML dari clipboard
    const doc = new DOMParser().parseFromString(html, 'text/html')
    
    // Hapus semua tag yang tidak diizinkan, pertahankan hanya:
    // b, strong, i, em, u, s, a, br, span
    const allowedTags = new Set(['b', 'strong', 'i', 'em', 'u', 's', 'a', 'br', 'span'])
    
    // Walk all nodes and clean
    const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null)
    const nodesToRemove: Node[] = []
    
    while (walker.nextNode()) {
      const el = walker.currentNode as HTMLElement
      const tagName = el.tagName.toLowerCase()
      
      if (tagName === 'a') {
        // Only keep href attribute
        const href = el.getAttribute('href')
        // Remove all attributes
        while (el.attributes.length > 0) el.removeAttribute(el.attributes[0].name)
        if (href) el.setAttribute('href', href)
        continue
      }
      
      if (tagName === 'span') {
        // Only keep limited inline styles
        const style = el.getAttribute('style') || ''
        const allowedStyles = ['color', 'background-color', 'font-weight', 'font-style', 'text-decoration']
        const cleanedStyles = style.split(';')
          .map(s => s.trim())
          .filter(s => {
            const prop = s.split(':')[0]?.trim().toLowerCase()
            return prop && allowedStyles.some(allowed => prop.startsWith(allowed))
          })
          .join('; ')
        
        el.removeAttribute('style')
        if (cleanedStyles) el.setAttribute('style', cleanedStyles)
        
        // Remove all other attributes
        const attrsToRemove: string[] = []
        for (let i = 0; i < el.attributes.length; i++) {
          const name = el.attributes[i].name
          if (name !== 'style') attrsToRemove.push(name)
        }
        attrsToRemove.forEach(name => el.removeAttribute(name))
        continue
      }
      
      // Remove all attributes from allowed tags (except a and span handled above)
      if (allowedTags.has(tagName)) {
        while (el.attributes.length > 0) el.removeAttribute(el.attributes[0].name)
        continue
      }
      
      // For disallowed tags, mark for removal but preserve their text content
      nodesToRemove.push(el)
    }
    
    // Replace disallowed nodes with their text content
    for (const node of nodesToRemove) {
      const parent = node.parentNode
      if (parent) {
        while (node.firstChild) {
          parent.insertBefore(node.firstChild, node)
        }
        parent.removeChild(node)
      }
    }
    
    return doc.body.innerHTML
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    // Priority 1: Try to get HTML from clipboard
    const htmlData = e.clipboardData.getData('text/html')
    const textData = e.clipboardData.getData('text/plain')
    
    let sanitized: string
    
    if (htmlData) {
      // Sanitize HTML — strip disallowed tags, keep only basic formatting
      sanitized = sanitizePastedHTML(htmlData)
    } else if (textData) {
      // Plain text: escape HTML entities and replace newlines with <br>
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
    
    // Insert the sanitized content at cursor position
    document.execCommand('insertHTML', false, sanitized)
    
    // Sync content back to store
    handleFormat('paste')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current
    if (!editor) return

    if (showMenu) {
      if (e.key === 'Escape') {
        setShowMenu(false)
        setSlashQuery('')
        slashRangeRef.current = null
      }
      return
    }

    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      document.execCommand('bold', false)
      handleFormat('bold')
      return
    }
    if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      document.execCommand('italic', false)
      handleFormat('italic')
      return
    }
    if (e.key === 'u' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      document.execCommand('underline', false)
      handleFormat('underline')
      return
    }

    // A. Enter → split block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)
      
      // If the editor is empty, just split into two empty paragraphs
      const isEmpty = !editor.textContent?.trim()
      if (isEmpty) {
        const newBlockId = splitBlock(block.id, '', '')
        if (newBlockId) {
          requestAnimationFrame(() => {
            focusAtOffset(newBlockId, 0)
          })
        }
        return
      }
      
      // Collapse the range first to handle multi-character selections
      range.collapse(true)
      
      // Extract content before cursor
      const beforeRange = range.cloneRange()
      beforeRange.selectNodeContents(editor)
      beforeRange.setEnd(range.endContainer, range.endOffset)
      const contentBefore = beforeRange.cloneContents()
      const tempBefore = document.createElement('div')
      tempBefore.appendChild(contentBefore)
      
      // Extract content after cursor
      const afterRange = range.cloneRange()
      afterRange.selectNodeContents(editor)
      afterRange.setStart(range.endContainer, range.endOffset)
      const contentAfter = afterRange.cloneContents()
      const tempAfter = document.createElement('div')
      tempAfter.appendChild(contentAfter)
      
      const beforeHtml = tempBefore.innerHTML
      const afterHtml = tempAfter.innerHTML
      
      const newBlockId = splitBlock(block.id, beforeHtml, afterHtml)
      if (newBlockId) {
        // Focus the new block on the next frame — the old editor ref is stale
        focusAtOffset(newBlockId, 0)
      }
      return
    }

    // B. Shift+Enter → soft line break within paragraph
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
      
      // Determine if cursor is truly at the start of the editor content.
      // The startContainer might be a text node inside the editor, not the editor itself.
      const isEditorEmpty = !editor.textContent?.trim().length
      const cursorAtStart = isEditorEmpty || (
        range.startOffset === 0 &&
        (!editor.contains(range.startContainer) || range.startContainer === editor || 
         (range.startContainer.nodeType === Node.TEXT_NODE && range.startContainer === editor.firstChild && range.startOffset === 0))
      )
      
      if (cursorAtStart) {
        e.preventDefault()
        const result = mergeWithPrevious(block.id)
        if (result) {
          // Set cursor offset for the target block's useEffect to read after innerHTML sync
          // Wait one frame for the target block's component to mount/receive new block.content
          setTimeout(() => {
            const allWrappers = document.querySelectorAll('[data-block-wrapper]')
            for (const w of allWrappers) {
              const editorEl = w.querySelector('[contenteditable]') as HTMLElement | null
              if (!editorEl) continue
              if (editorEl.dataset.blockId === result!.targetBlockId) {
                editorEl.focus()
                const sel = window.getSelection()
                if (!sel) return
                sel.removeAllRanges()
                const r = document.createRange()
                const node = editorEl.firstChild
                if (node && node.nodeType === Node.TEXT_NODE) {
                  r.setStart(node, Math.min(result!.cursorOffset, node.textContent?.length || 0))
                } else {
                  r.setStart(editorEl, 0)
                }
                r.collapse(true)
                sel.addRange(r)
                return
              }
            }
          }, 0)
        }
        return
      }
    }

    // D. Delete at end → merge with next block
    if (e.key === 'Delete') {
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)
      
      // Check if cursor is at the very end of the text content
      const totalTextLen = editor.textContent?.length || 0
      const cursorOffset = range.startOffset
      
      // If cursor is at the end of the last text node (end of content)
      const isAtEnd = totalTextLen > 0 && cursorOffset >= totalTextLen
      
      if (isAtEnd) {
        const nextId = getAdjacentBlockId(block.id, 'down')
        if (nextId) {
          const nextBlock = useEditorStore.getState().blocks.find(b => b.id === nextId)
          const isNextText = nextBlock?.type === 'paragraph' || nextBlock?.type === 'heading' || nextBlock?.type === 'quote'
          
          if (isNextText) {
            e.preventDefault()
            const nextContent = (nextBlock as any)?.content || ''
            const mergedContent = editor.innerHTML + nextContent
            updateBlock(block.id, { content: mergedContent })
            removeBlock(nextId)
            
            // Keep cursor at the end of current block's content
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

    // E. Arrow Up at start → move to end of previous block
    if (e.key === 'ArrowUp') {
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)
      
      // Check if cursor is in the first line visually OR at the very top of the text content
      const totalTextLen = editor.textContent?.length || 0
      const cursorOffset = range.startOffset
      const isAtAbsoluteStart = totalTextLen === 0 || (cursorOffset === 0 && (range.startContainer === editor.firstChild || range.startContainer === editor))
      
      if (isAtAbsoluteStart) {
        const prevId = getAdjacentBlockId(block.id, 'up')
        if (prevId) {
          e.preventDefault()
          focusPrevNextBlock('up')
        }
        return
      }
      
      // Also use rect-based detection for multi-line paragraphs
      const rects = range.getClientRects()
      if (rects.length > 0 && rects[0].top >= editor.getBoundingClientRect().top && cursorOffset === 0) {
        const prevId = getAdjacentBlockId(block.id, 'up')
        if (prevId) {
          e.preventDefault()
          focusPrevNextBlock('up')
        }
      }
    }

    // E. Arrow Down at end → move to start of next block
    if (e.key === 'ArrowDown') {
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)
      
      // Check if cursor is at the very end of the text content
      const totalTextLen = editor.textContent?.length || 0
      const cursorOffset = range.startOffset
      const isAtAbsoluteEnd = totalTextLen > 0 && cursorOffset >= totalTextLen
      
      if (isAtAbsoluteEnd) {
        const nextId = getAdjacentBlockId(block.id, 'down')
        if (nextId) {
          e.preventDefault()
          focusPrevNextBlock('down')
        }
        return
      }
      
      // Also use rect-based detection for multi-line paragraphs
      const rects = range.getClientRects()
      if (rects.length > 0) {
        const editorRect = editor.getBoundingClientRect()
        const lastRect = rects[rects.length - 1]
        if (lastRect.bottom >= editorRect.bottom - 1 && cursorOffset >= totalTextLen - 1) {
          const nextId = getAdjacentBlockId(block.id, 'down')
          if (nextId) {
            e.preventDefault()
            focusPrevNextBlock('down')
          }
        }
      }
    }

    // F. Tab → insert indentation (4 spaces)
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
      return
    }
  }

  return (
    <div ref={containerRef} className="relative group/p">
      <InlineToolbar editorRef={editorRef} onFormat={handleFormat} active={isActive} />

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-block-id={block.id}
        onFocus={() => setActiveBlockId(block.id)}
        onClick={() => setActiveBlockId(block.id)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{ textAlign: block.textAlign || 'left' }}
        onKeyUp={() => {
          if (showMenu) {
            requestAnimationFrame(() => updateSlashMenuPosition())
          }
        }}
        onBlur={() => {
          const element = editorRef.current
          if (element) {
            updateBlock(block.id, { content: element.innerHTML })
          }
          setTimeout(() => setShowMenu(false), 200)
        }}
        data-placeholder="Tulis paragraf... (ketik '/' untuk opsi)"
        className={cn(
          "min-h-[1.75em] outline-none font-serif text-[1.02rem] leading-8 tracking-[0.01em] text-brand-black dark:text-gray-200 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 dark:empty:before:text-white/20 empty:before:pointer-events-none lg:text-[1.08rem] lg:leading-[2rem] xl:text-[1.14rem] xl:leading-[2.1rem]",
          "[&_b]:font-bold [&_strong]:font-bold",
          "[&_i]:italic [&_em]:italic",
          "[&_u]:underline",
          "[&_s]:line-through [&_strike]:line-through",
          "[&_a]:text-brand-red [&_a]:underline",
          block.dropCap && "[&::first-letter]:float-left [&::first-letter]:text-5xl [&::first-letter]:font-black [&::first-letter]:text-brand-red [&::first-letter]:leading-none [&::first-letter]:mr-2 [&::first-letter]:mt-1"
        )}
      />

      {showMenu && (
        <div
          className="absolute z-50 w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200/70 bg-white/95 p-2 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 animate-fade-in"
          style={{ top: slashMenuPosition.top, left: slashMenuPosition.left }}
        >
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-gray-200/70 bg-gray-50/70 px-3 py-2 dark:border-white/10 dark:bg-slate-950/50">
            <Search size={13} className="shrink-0 text-gray-400" />
            <span className="truncate text-[11px] text-gray-400 dark:text-gray-500">
              {slashQuery ? `/${slashQuery}` : 'Ketik untuk filter blok'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {matchingBlocks.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(type)}
                className="group flex items-center gap-2 rounded-xl border border-transparent px-2.5 py-2 text-left transition-all hover:border-gray-200 hover:bg-gray-50 dark:hover:border-white/10 dark:hover:bg-white/[0.04]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-gray-800 group-hover:text-white dark:bg-white/5 dark:group-hover:bg-white/15 dark:group-hover:text-white">
                  <Icon size={15} />
                </span>
                <span className="min-w-0 text-[12px] font-medium text-brand-black dark:text-white">{label}</span>
              </button>
            ))}
            {matchingBlocks.length === 0 && (
              <div className="col-span-2 rounded-xl border border-dashed border-gray-200 px-3 py-4 text-center text-[11px] text-gray-400 dark:border-white/10 dark:text-gray-500">
                Tidak ada tipe blok yang cocok.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}