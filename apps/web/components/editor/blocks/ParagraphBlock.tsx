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
  const { updateBlock, replaceBlock } = useEditorStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 40, left: 0 })

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

  const extractSlashCommand = (value: string) => {
    const normalized = value.replace(/\u00a0/g, ' ').trim()
    if (normalized === '/') {
      return { isCommand: true, query: '' }
    }
    const match = normalized.match(/^\/([a-zA-Z0-9-]*)$/)
    if (!match) return { isCommand: false, query: '' }
    return { isCommand: true, query: match[1] || '' }
  }

  const updateSlashMenuPosition = () => {
    const container = containerRef.current
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!container || !editor || !selection || !selection.rangeCount) return

    const range = selection.getRangeAt(0).cloneRange()
    range.collapse(false)

    const rect = range.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const menuWidth = Math.min(416, Math.max(288, containerRect.width - 16))

    const fallbackTop = editor.offsetTop + 44
    const fallbackLeft = 0

    if (!rect.width && !rect.height && !rect.top && !rect.left) {
      setSlashMenuPosition({ top: fallbackTop, left: fallbackLeft })
      return
    }

    const nextTop = rect.bottom - containerRect.top + 10
    const rawLeft = rect.left - containerRect.left
    const maxLeft = Math.max(0, containerRect.width - menuWidth - 8)
    const nextLeft = Math.min(Math.max(0, rawLeft), maxLeft)

    setSlashMenuPosition({
      top: Math.max(fallbackTop, nextTop),
      left: nextLeft
    })
  }

  const handleInput = () => {
    const element = editorRef.current
    if (!element) return

    const html = element.innerHTML
    updateBlock(block.id, { content: html })

    const text = element.textContent || ''
    const command = extractSlashCommand(text)
    setShowMenu(command.isCommand)
    setSlashQuery(command.query)
    if (command.isCommand) {
      requestAnimationFrame(() => updateSlashMenuPosition())
    }
  }

  const handleSelect = (type: Block['type']) => {
    replaceBlock(block.id, type)
    setShowMenu(false)
    setSlashQuery('')
  }

  const handleFormat = (command: string) => {
    const element = editorRef.current
    if (element) {
      updateBlock(block.id, { content: element.innerHTML })
    }
  }

  return (
    <div ref={containerRef} className="relative group/p">
      <InlineToolbar editorRef={editorRef} onFormat={handleFormat} />

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setShowMenu(false)
            setSlashQuery('')
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
