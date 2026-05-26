'use client'

import { useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useEditorStore } from '../../store/editorStore'
import { cn } from '../../lib/utils'
import { EditorHelpHint } from './EditorHelpHint'

interface EditorTitleStageProps {
  isFocusMode: boolean
}

export function EditorTitleStage({ isFocusMode }: EditorTitleStageProps) {
  const { excerpt, setExcerpt } = useEditorStore()

  if (isFocusMode) {
    return (
      <div className="mb-10 sm:mb-12 md:mb-14">
        <TitleInput compact />
        <div className="mt-4 sm:mt-5">
          <ExcerptInput compact value={excerpt} onChange={setExcerpt} />
        </div>
      </div>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-[28px] border border-gray-200/80 bg-white/95 p-4 shadow-[0_32px_100px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/60 sm:mb-10 sm:p-6 md:rounded-[32px] md:p-8 lg:p-10"
    >
      <div className="mb-6 border-b border-gray-100 pb-6 dark:border-white/5 sm:mb-8 sm:pb-8">
        <div className="max-w-6xl">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-red text-xs font-black text-white shadow-lg shadow-brand-red/20 sm:h-10 sm:w-10 sm:text-sm">
              BK
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400 sm:text-[10px] sm:tracking-[0.3em]">
                Ruang Editor
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-brand-black dark:text-white sm:text-sm">
                Mulai dari judul yang spesifik, jelas, dan kuat secara editorial.
              </p>
            </div>
          </div>
          <TitleInput />
          <div className="mt-4 sm:mt-5">
            <ExcerptInput value={excerpt} onChange={setExcerpt} />
          </div>
          <p className="mt-4 max-w-2xl text-xs leading-6 text-gray-500 dark:text-gray-400 sm:text-sm">
            Gunakan judul yang cepat dipahami pembaca, informatif untuk mesin pencari, dan tetap enak dibaca di halaman depan.
          </p>
        </div>
      </div>
    </motion.section>
  )
}

function TitleInput({ compact = false }: { compact?: boolean }) {
  const { title, setTitle } = useEditorStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const element = textareaRef.current
    if (!element) return

    element.style.height = '0px'
    element.style.height = `${element.scrollHeight}px`
  }, [title])

  return (
    <textarea
      ref={textareaRef}
      value={title}
      onChange={e => setTitle(e.target.value)}
      placeholder="Tulis Judul Berita yang Memikat..."
      rows={compact ? 2 : 3}
      className={cn(
        "w-full overflow-hidden border-none bg-transparent font-serif font-black leading-[1.05] tracking-tight text-slate-950 outline-none resize-none dark:text-white",
        "placeholder:text-gray-300 dark:placeholder:text-white/15",
        compact
          ? "min-h-[80px] text-[2rem] sm:min-h-[96px] sm:text-4xl md:min-h-[120px] md:text-5xl"
          : "min-h-[96px] text-[2.25rem] sm:min-h-[132px] sm:text-[2.9rem] md:min-h-[176px] md:text-6xl lg:text-[4.5rem]"
      )}
    />
  )
}

function ExcerptInput({
  value,
  onChange,
  compact = false
}: {
  value: string
  onChange: (value: string) => void
  compact?: boolean
}) {
  return (
    <div className="rounded-[22px] border border-gray-200/80 bg-gray-50/70 p-3.5 dark:border-white/10 dark:bg-slate-950/40 sm:rounded-[24px] sm:p-4">
      <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-2">
          <span>Deck / Excerpt</span>
          <EditorHelpHint text="Ringkasan singkat isi berita. Biasanya dipakai sebagai pembuka editorial dan fallback preview di kartu berita." />
        </span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ringkas inti berita dalam 1-2 kalimat yang kuat untuk pembaca dan distribusi."
        rows={compact ? 2 : 3}
        className={cn(
          "mt-3 w-full resize-none border-none bg-transparent text-sm leading-6 text-brand-black outline-none dark:text-white",
          "placeholder:text-gray-400 dark:placeholder:text-white/25",
          compact ? "min-h-[64px] sm:min-h-[68px]" : "min-h-[78px] sm:min-h-[88px]"
        )}
      />
      <div className="mt-3 flex flex-col gap-2 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
          Dipakai sebagai deck editorial dan bisa menjadi fallback ringkasan di kartu berita.
        </p>
        <span className="shrink-0 text-[11px] font-semibold text-gray-400 dark:text-gray-500">
          {value.trim().length} / 280
        </span>
      </div>
    </div>
  )
}
