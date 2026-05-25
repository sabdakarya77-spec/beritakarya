'use client'

import { FileText } from 'lucide-react'
import { BlockList } from './BlockList'
import { AddBlockMenu } from './AddBlockMenu'
import { cn } from '../../lib/utils'

interface EditorCanvasProps {
  isFocusMode: boolean
}

export function EditorCanvas({ isFocusMode }: EditorCanvasProps) {
  return (
    <section
      className={cn(
        "relative",
        !isFocusMode && "rounded-[28px] border border-gray-200/70 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900/55"
      )}
    >
      {!isFocusMode && (
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
              Kanvas Artikel
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Susun isi berita, tambahkan blok, dan rapikan alur baca sebelum dikirim ke redaksi.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-500 dark:border-white/10 dark:bg-slate-950/60 dark:text-gray-300 md:flex">
            <FileText size={14} className="text-brand-red" />
            Editor blok aktif
          </div>
        </div>
      )}

      <div className={cn(
        "relative article-content", // article-content triggers our global editorial styles
        isFocusMode ? "prose-premium" : "px-6 py-8 md:px-8 md:py-10"
      )}>
        <BlockList />
        
        {!isFocusMode && (
          <div className="mt-16 flex justify-center border-t border-gray-100 pt-12 dark:border-white/5">
            <AddBlockMenu afterId={undefined} />
          </div>
        )}
      </div>
    </section>
  )
}
