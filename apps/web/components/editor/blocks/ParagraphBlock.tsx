'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import { cn } from '../../../lib/utils'
import { InlineToolbar } from './InlineToolbar'
import type { ParagraphBlock as TParagraphBlock, Block } from '@beritakarya/types'

const BLOCK_TYPES: { type: Block['type']; label: string; desc: string; aliases: string[] }[] = [
  { type: 'heading', label: 'Subjudul', desc: 'Bagi artikel jadi bagian yang jelas', aliases: ['judul', 'heading', 'h2', 'subjudul'] },
  { type: 'list', label: 'Daftar', desc: 'Poin fakta, kronologi, atau rangkuman', aliases: ['list', 'bullet', 'daftar', 'poin'] },
  { type: 'quote', label: 'Kutipan', desc: 'Sorot pernyataan narasumber', aliases: ['quote', 'kutipan', 'narasumber'] },
  { type: 'callout', label: 'Highlight', desc: 'Tegaskan informasi paling penting', aliases: ['highlight', 'callout', 'sorot'] },
  { type: 'image', label: 'Gambar', desc: 'Masukkan satu foto utama', aliases: ['gambar', 'foto', 'image'] },
  { type: 'imageGrid', label: 'Grid Gambar', desc: 'Tampilkan dua atau tiga visual sejajar', aliases: ['grid', 'galeri', 'foto'] },
  { type: 'gallery', label: 'Galeri', desc: 'Kumpulkan foto dalam satu blok', aliases: ['gallery', 'galeri', 'slideshow'] },
  { type: 'embed', label: 'Embed', desc: 'Sisipkan YouTube atau konten eksternal', aliases: ['embed', 'youtube', 'video'] },
]

export function ParagraphBlock({ block }: { block: TParagraphBlock }) {
  const { updateBlock, replaceBlock } = useEditorStore()
  const editorRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')

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

  const handleInput = () => {
    const element = editorRef.current
    if (!element) return

    const html = element.innerHTML
    updateBlock(block.id, { content: html })

    const text = element.textContent || ''
    const command = extractSlashCommand(text)
    setShowMenu(command.isCommand)
    setSlashQuery(command.query)
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
    <div className="relative group/p">
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
        <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200/70 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 animate-fade-in">
          <div className="mb-1 px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
            {slashQuery ? `Perintah: /${slashQuery}` : 'Pilih Tipe Blok'}
          </div>
          <div className="flex flex-col gap-0.5">
            {matchingBlocks.map(t => (
              <button
                key={t.type}
                onClick={() => handleSelect(t.type)}
                className="flex flex-col px-3 py-2 text-left transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <span className="text-sm font-bold text-brand-black dark:text-white">{t.label}</span>
                <span className="text-[10px] text-gray-400">{t.desc}</span>
              </button>
            ))}
            {matchingBlocks.length === 0 && (
              <div className="px-3 py-2 text-xs text-gray-400">
                Tidak ada tipe blok yang cocok.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}