'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, Heading1, Heading2, Heading3, Type, Highlighter, Palette, Eraser } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { Block } from '@beritakarya/types'
import { cn } from '../../lib/utils'

type TextAlign = 'left' | 'center' | 'right' | 'justify'

const FORMAT_OPTIONS: { type: Block['type']; level?: number; label: string; icon: typeof Type }[] = [
  { type: 'paragraph', label: 'Paragraf', icon: Type },
  { type: 'heading', label: 'Subjudul H2', level: 2, icon: Heading2 },
  { type: 'heading', label: 'Sub-Subjudul H3', level: 3, icon: Heading3 },
  { type: 'heading', label: 'H4', level: 4, icon: Heading1 },
]

const ALIGNMENTS: { value: TextAlign; icon: typeof AlignLeft; label: string }[] = [
  { value: 'left', icon: AlignLeft, label: 'Rata Kiri' },
  { value: 'center', icon: AlignCenter, label: 'Rata Tengah' },
  { value: 'right', icon: AlignRight, label: 'Rata Kanan' },
  { value: 'justify', icon: AlignJustify, label: 'Rata Kiri-Kanan' },
]

const HIGHLIGHT_COLORS: { label: string; value: string }[] = [
  { label: 'Kuning', value: '#FEF08A' },
  { label: 'Hijau', value: '#BBF7D0' },
  { label: 'Biru Muda', value: '#BAE6FD' },
  { label: 'Pink', value: '#FECDD3' },
  { label: 'Hapus', value: '' },
]

const TEXT_COLORS: { label: string; value: string }[] = [
  { label: 'Merah', value: '#DC2626' },
  { label: 'Biru', value: '#2563EB' },
  { label: 'Abu-abu', value: '#6B7280' },
  { label: 'Hijau Tua', value: '#059669' },
  { label: 'Hapus', value: '' },
]

export function EditorialToolbar() {
  const { blocks, activeBlockId, updateBlock, replaceBlock, setActiveBlockId } = useEditorStore()
  const [showFormatDropdown, setShowFormatDropdown] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeBlock = blocks.find(b => b.id === activeBlockId)
  const isTextActive = activeBlock && ['paragraph', 'heading', 'quote'].includes(activeBlock.type)
  const blockType = activeBlock?.type || 'paragraph'
  const blockLevel = activeBlock?.type === 'heading' ? (activeBlock as any).level : undefined
  const textAlign = (activeBlock as any)?.textAlign as TextAlign | undefined

  const activeFormatLabel = blockType === 'paragraph' 
    ? 'Paragraf' 
    : blockType === 'heading' 
      ? blockLevel === 2 ? 'Subjudul H2' : blockLevel === 3 ? 'Sub-Subjudul H3' : 'H4'
      : 'Paragraf'

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowFormatDropdown(false)
        setShowHighlightPicker(false)
        setShowColorPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const execCommand = useCallback((command: string, value?: string) => {
    const editor = document.querySelector('[contenteditable]:focus') as HTMLElement | null
    if (editor) {
      document.execCommand(command, false, value)
      // Sync back to store
      if (activeBlockId) {
        updateBlock(activeBlockId, { content: editor.innerHTML } as any)
      }
    }
  }, [activeBlockId, updateBlock])

  const handleFormatChange = (type: Block['type'], level?: number) => {
    if (!activeBlockId) return
    if (type === 'paragraph') {
      replaceBlock(activeBlockId, 'paragraph')
    } else if (type === 'heading') {
      replaceBlock(activeBlockId, 'heading')
      // Set level after replace
      requestAnimationFrame(() => {
        updateBlock(activeBlockId, { level: level || 2 } as any)
      })
    }
    setShowFormatDropdown(false)
  }

  const handleAlignment = (align: TextAlign) => {
    if (!activeBlockId) return
    updateBlock(activeBlockId, { textAlign: align } as any)
  }

  const activeAlign = textAlign || 'left'

  if (!isTextActive) return null

  return (
    <div className="sticky top-0 z-40 -mx-1 mb-2 rounded-2xl border border-gray-200/80 bg-white/95 px-2 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
      <div className="flex flex-wrap items-center gap-1">
        {/* Format Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowFormatDropdown(!showFormatDropdown)
              setShowHighlightPicker(false)
              setShowColorPicker(false)
            }}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-black transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-slate-950/70 dark:text-white dark:hover:bg-white/5"
          >
            {blockType === 'paragraph' ? <Type size={13} /> : blockLevel === 2 ? <Heading2 size={13} /> : blockLevel === 3 ? <Heading3 size={13} /> : <Heading1 size={13} />}
            {activeFormatLabel}
            <svg width="10" height="10" viewBox="0 0 10 10" className="ml-0.5 text-gray-400">
              <path d="M2 3.5L5 6.5L8 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showFormatDropdown && (
            <div className="absolute left-0 top-full mt-1.5 z-50 w-44 overflow-hidden rounded-xl border border-gray-200/80 bg-white/95 py-1 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
              {FORMAT_OPTIONS.map(({ type, level, label, icon: Icon }) => (
                <button
                  key={`${type}-${level || ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleFormatChange(type, level)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-colors",
                    (blockType === type && blockLevel === level) || (blockType === type && type === 'paragraph' && !level)
                      ? "bg-brand-red/5 text-brand-red font-semibold"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                  )}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-white/10" />

        {/* Inline Format Buttons */}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('bold')}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
          title="Bold (Ctrl+B)"
        >
          <Bold size={13} strokeWidth={3} />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('italic')}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
          title="Italic (Ctrl+I)"
        >
          <Italic size={13} strokeWidth={3} />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('underline')}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
          title="Underline (Ctrl+U)"
        >
          <Underline size={13} strokeWidth={3} />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('strikeThrough')}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
          title="Strikethrough"
        >
          <Strikethrough size={13} strokeWidth={3} />
        </button>

        <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-white/10" />

        {/* Highlight & Color */}
        <div className="relative">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker)
              setShowColorPicker(false)
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
            title="Highlight (stabilo warna)"
          >
            <Highlighter size={13} />
          </button>
          {showHighlightPicker && (
            <div className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 z-50 flex items-center gap-1 rounded-xl border border-gray-200/80 bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
              {HIGHLIGHT_COLORS.map(({ label, value }) => (
                <button
                  key={value || 'clear'}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (value) {
                      execCommand('backColor', value)
                    } else {
                      execCommand('removeFormat')
                    }
                    setShowHighlightPicker(false)
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-medium transition-transform hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor: value || '#f3f4f6',
                    color: value ? '#000' : '#6b7280',
                    border: value ? '1px solid rgba(0,0,0,0.1)' : '1px dashed #d1d5db',
                  }}
                  title={label}
                >
                  {!value ? <Eraser size={10} /> : null}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowColorPicker(!showColorPicker)
              setShowHighlightPicker(false)
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
            title="Warna teks"
          >
            <Palette size={13} />
          </button>
          {showColorPicker && (
            <div className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 z-50 flex items-center gap-1 rounded-xl border border-gray-200/80 bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
              {TEXT_COLORS.map(({ label, value }) => (
                <button
                  key={value || 'clear'}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (value) {
                      execCommand('foreColor', value)
                    } else {
                      document.execCommand('removeFormat', false)
                    }
                    setShowColorPicker(false)
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-medium transition-transform hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor: value || '#f3f4f6',
                    color: value ? '#fff' : '#6b7280',
                    border: value ? '1px solid rgba(0,0,0,0.1)' : '1px dashed #d1d5db',
                  }}
                  title={label}
                >
                  {!value ? <Eraser size={10} /> : null}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-white/10" />

        {/* Alignment Buttons */}
        {ALIGNMENTS.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAlignment(value)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
              activeAlign === value
                ? "bg-brand-red/10 text-brand-red"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white active:bg-gray-200"
            )}
            title={label}
          >
            <Icon size={13} />
          </button>
        ))}
      </div>
    </div>
  )
}