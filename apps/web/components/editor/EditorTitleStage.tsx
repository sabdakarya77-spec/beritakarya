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
      <div className="mb-8 sm:mb-10">
        <TitleInput compact />
        <div className="mt-3 sm:mt-4">
          <ExcerptInput compact value={excerpt} onChange={setExcerpt} />
        </div>
      </div>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border border-gray-200/70 bg-white/95 px-4 py-5 shadow-xl dark:border-white/10 dark:bg-slate-900/90 sm:mb-8 sm:px-6 sm:py-6"
    >
      <div className="mb-5 border-b border-gray-100 pb-5 dark:border-white/5 sm:mb-6 sm:pb-6">
        <div className="max-w-6xl">
          <TitleInput />
          <div className="mt-4 sm:mt-5">
            <ExcerptInput value={excerpt} onChange={setExcerpt} />
          </div>
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
    <div className="rounded-xl border border-gray-200/70 bg-gray-50/50 p-3 dark:border-white/10 dark:bg-slate-950/30 sm:rounded-xl sm:p-3.5">
      <label className="block text-[9px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
        Deck / Excerpt
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ringkas inti berita..."
        rows={compact ? 2 : 3}
        className={cn(
          "mt-2 w-full resize-none border-none bg-transparent text-[13px] leading-6 text-brand-black outline-none dark:text-white",
          "placeholder:text-gray-400 dark:placeholder:text-white/20",
          compact ? "min-h-[56px]" : "min-h-[68px] sm:min-h-[72px]"
        )}
      />
      <div className="mt-2 flex items-center justify-end">
        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
          {value.trim().length} / 280
        </span>
      </div>
    </div>
  )
}
