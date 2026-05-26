'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import { cn } from '../../../lib/utils'
import type { ParagraphBlock as TParagraphBlock, Block } from '@beritakarya/types'

const BLOCK_TYPES: { type: Block['type']; label: string; desc: string; aliases: string[] }[] = [
  { type: 'heading', label: 'Subjudul', desc: 'Bagi artikel jadi bagian yang jelas', aliases: ['judul', 'heading', 'h2', 'subjudul'] },
  { type: 'list', label: 'Daftar', desc: 'Poin fakta, kronologi, atau rangkuman', aliases: ['list', 'bullet', 'daftar', 'poin'] },
  { type: 'quote', label: 'Kutipan', desc: 'Sorot pernyataan narasumber', aliases: ['quote', 'kutipan', 'narasumber'] },
  { type: 'callout', label: 'Highlight', desc: 'Tegaskan informasi paling penting', aliases: ['highlight', 'callout', 'sorot'] },
  { type: 'image', label: 'Gambar', desc: 'Masukkan satu foto utama', aliases: ['gambar', 'foto', 'image'] },
  { type: 'imageGrid', label: 'Grid Gambar', desc: 'Tampilkan dua atau tiga visual sejajar', aliases: ['grid', 'galeri', 'foto'] },
  { type: 'gallery', label: 'Galeri', desc: 'Kumpulan foto dalam satu blok', aliases: ['gallery', 'galeri', 'slideshow'] },
  { type: 'embed', label: 'Embed', desc: 'Sisipkan YouTube atau konten eksternal', aliases: ['embed', 'youtube', 'video'] },
]

export function ParagraphBlock({ block }: { block: TParagraphBlock }) {
  const { updateBlock, replaceBlock } = useEditorStore()
  const ref = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const nextValue = block.content || ''
    if (element.textContent !== nextValue) {
      element.textContent = nextValue
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
    const normalized = value.replace(/\u00a0/g, ' ')
    const match = normalized.match(/^\s*\/([a-zA-Z0-9-]*)$/)

    if (!match) {
      return { isCommand: false, query: '' }
    }

    return {
      isCommand: true,
      query: match[1] || ''
    }
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || ''
    updateBlock(block.id, { content: text })

    const command = extractSlashCommand(text)
    setShowMenu(command.isCommand)
    setSlashQuery(command.query)
  }

  const handleSelect = (type: Block['type']) => {
    replaceBlock(block.id, type)
    setShowMenu(false)
    setSlashQuery('')
  }

  const toggleDropCap = () => {
    updateBlock(block.id, { dropCap: !block.dropCap })
  }

  return (
    <div className="relative group/p">
      {/* DropCap Toggle */}
      <div className="absolute -left-12 top-0 opacity-0 group-hover/p:opacity-100 transition-opacity hidden md:block">
        <button 
          onClick={toggleDropCap}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border transition-all",
            block.dropCap 
              ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20" 
              : "bg-white dark:bg-white/5 text-gray-400 border-gray-100 dark:border-white/5 hover:border-brand-red hover:text-brand-red"
          )}
          title="Toggle Drop Cap"
        >
          DC
        </button>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setShowMenu(false)
            setSlashQuery('')
          }
        }}
        onBlur={(e) => {
          updateBlock(block.id, { content: e.currentTarget.textContent || '' })
          setTimeout(() => setShowMenu(false), 200)
        }}
        data-placeholder="Tulis paragraf... (ketik '/' untuk opsi)"
        className={cn(
          "min-h-[1.75em] outline-none font-serif text-[1.02rem] leading-8 tracking-[0.01em] text-brand-black dark:text-gray-200 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 dark:empty:before:text-white/20 empty:before:pointer-events-none lg:text-[1.08rem] lg:leading-[2rem] xl:text-[1.14rem] xl:leading-[2.1rem]",
          block.dropCap && "first-letter:float-left first-letter:mr-3 first-letter:mt-2 first-letter:text-5xl first-letter:font-black first-letter:leading-none first-letter:text-brand-red lg:first-letter:mr-4 lg:first-letter:text-6xl"
        )}
      />
      
      {showMenu && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl shadow-2xl z-50 p-2 overflow-hidden animate-fade-in">
          <div className="px-2 py-1.5 mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
            {slashQuery ? `Perintah: /${slashQuery}` : 'Pilih Tipe Blok'}
          </div>
          <div className="flex flex-col gap-0.5">
            {matchingBlocks.map(t => (
              <button
                key={t.type}
                onClick={() => handleSelect(t.type)}
                className="flex flex-col text-left px-3 py-2 rounded-lg hover:bg-brand-red/5 hover:text-brand-red dark:hover:bg-white/5 transition-colors group"
              >
                <span className="text-sm font-bold text-brand-black dark:text-white group-hover:text-brand-red transition-colors">{t.label}</span>
                <span className="text-[10px] text-gray-400">{t.desc}</span>
              </button>
            ))}
            {matchingBlocks.length === 0 && (
              <div className="px-3 py-2 text-xs text-gray-400">
                Tidak ada tipe blok yang cocok dengan perintah tersebut.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
