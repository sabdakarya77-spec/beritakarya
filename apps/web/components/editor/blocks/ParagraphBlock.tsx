'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Type, Heading1, List, Quote, Sparkles, Image, Grid2X2, GalleryVertical, PlaySquare } from 'lucide-react'
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
]

export function ParagraphBlock({ block }: { block: TParagraphBlock }) {
  const { updateBlock, replaceBlock, addBlock, activeBlockId, setActiveBlockId } = useEditorStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const slashRangeRef = useRef<Range | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 40, left: 0 })
  const isActive = activeBlockId === block.id

  useEffect(() => {
    const element = editorRef.current
    if (!element) return

    const nextValue = block.content || ''
    if (element.innerHTML !== nextValue) {
      element.innerHTML = nextValue
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

  return (
    <div ref={containerRef} className="relative group/p">
      <InlineToolbar editorRef={editorRef} onFormat={handleFormat} active={isActive} />

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setActiveBlockId(block.id)}
        onClick={() => setActiveBlockId(block.id)}
        onInput={handleInput}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setShowMenu(false)
            setSlashQuery('')
            slashRangeRef.current = null
          }
          if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            document.execCommand('bold', false)
            handleFormat('bold')
          }
          if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            document.execCommand('italic', false)
            handleFormat('italic')
          }
          if (e.key === 'u' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            document.execCommand('underline', false)
            handleFormat('underline')
          }
        }}
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
          "[&_a]:text-brand-red [&_a]:underline"
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
