'use client'

import { FileText } from 'lucide-react'
import type { Block } from '@beritakarya/types'
import { useEditorStore } from '../../store/editorStore'
import { BlockList } from './BlockList'
import { AddBlockMenu } from './AddBlockMenu'
import { cn } from '../../lib/utils'
import { EditorHelpHint } from './EditorHelpHint'

interface EditorCanvasProps {
  isFocusMode: boolean
}

export function EditorCanvas({ isFocusMode }: EditorCanvasProps) {
  const { blocks } = useEditorStore()
  const isCanvasEmpty = blocks.every(isBlockEmpty)

  return (
    <section
      className={cn(
        "relative",
        !isFocusMode && "rounded-[28px] border border-gray-200/70 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900/55"
      )}
    >
      {!isFocusMode && (
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 dark:border-white/5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
              Kanvas Artikel
            </p>
            <p className="mt-1 inline-flex flex-wrap items-center gap-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
              Susun isi berita, tambahkan blok, dan rapikan alur baca sebelum dikirim ke redaksi.
              <EditorHelpHint text="Blok adalah unit penyusun artikel, misalnya paragraf, subjudul, kutipan, gambar, atau embed." />
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-500 dark:border-white/10 dark:bg-slate-950/60 dark:text-gray-300 md:flex">
            <FileText size={14} className="text-brand-red" />
            Editor blok aktif
          </div>
        </div>
      )}

      <div className={cn(
        "relative article-content", // article-content triggers our global editorial styles
        isFocusMode ? "prose-premium" : "px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 xl:px-12"
      )}>
        <BlockList />
        
        {!isFocusMode && isCanvasEmpty && (
          <div className="mt-12 flex justify-center border-t border-gray-100 pt-8 dark:border-white/5 sm:mt-16 sm:pt-12">
            <AddBlockMenu afterId={undefined} />
          </div>
        )}
      </div>
    </section>
  )
}

function isBlockEmpty(block: Block) {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
    case 'quote':
    case 'callout':
      return !block.content?.trim()
    case 'list':
      return !block.items?.some((item) => item?.trim())
    case 'image':
    case 'embed':
      return !(block as { url?: string }).url?.trim()
    case 'imageGrid':
    case 'gallery':
      return !block.images?.length
    case 'mediaText':
      return !block.content?.trim() && !block.url?.trim()
    default:
      return false
  }
}
