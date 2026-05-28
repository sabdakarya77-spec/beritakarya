'use client'

import { useEditorStore } from '../../../store/editorStore'
import { GridBlockEditor } from '../modes/gridblock/GridBlockEditor'
import { WordPressEditor } from '../modes/wordpress/WordPressEditor'
import { FileText } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface EditorCanvasProps {
  isFocusMode: boolean
}

/**
 * Shell canvas — hanya route mode adapter.
 *
 * GridBlock mode → GridBlockEditor
 * WordPress mode → WordPressEditor
 *
 * Tidak ada branching logic untuk block types di sini.
 * Semua block logic didelegasikan ke mode-specific adapters.
 */
export function EditorCanvas({ isFocusMode }: EditorCanvasProps) {
  const { editorMode } = useEditorStore()

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
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-500 dark:border-white/10 dark:bg-slate-950/60 dark:text-gray-300 md:flex">
            <FileText size={14} className="text-brand-red" />
            {editorMode === 'wordpress' ? 'Editor kontinu aktif' : 'Editor blok aktif'}
          </div>
        </div>
      )}

      <div className={cn(
        "relative article-content",
        isFocusMode ? "prose-premium" : "px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 xl:px-12"
      )}>
        {editorMode === 'wordpress' ? (
          <WordPressEditor />
        ) : (
          <GridBlockEditor />
        )}
      </div>
    </section>
  )
}
