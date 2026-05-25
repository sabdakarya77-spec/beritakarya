'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { cn } from '../../lib/utils'
import { EditorHelpHint } from './EditorHelpHint'

interface EditorTitleStageProps {
  isFocusMode: boolean
}

export function EditorTitleStage({ isFocusMode }: EditorTitleStageProps) {
  const { title, excerpt, setExcerpt, blocks } = useEditorStore()
  const paragraphCount = blocks.filter((block) => block.type === 'paragraph').length
  const titleLength = title.trim().length
  const excerptLength = excerpt.trim().length

  if (isFocusMode) {
    return (
      <div className="mb-14">
        <TitleInput compact />
        <div className="mt-5">
          <ExcerptInput compact value={excerpt} onChange={setExcerpt} />
        </div>
      </div>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 rounded-[32px] border border-gray-200/80 bg-white/95 p-6 shadow-[0_32px_100px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/60 md:p-8"
    >
      <div className="mb-8 flex flex-col gap-5 border-b border-gray-100 pb-8 dark:border-white/5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-red text-sm font-black text-white shadow-lg shadow-brand-red/20">
              BK
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                Ruang Editor
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-black dark:text-white">
                Mulai dari judul yang spesifik, jelas, dan kuat secara editorial.
              </p>
            </div>
          </div>
          <TitleInput />
          <div className="mt-5">
            <ExcerptInput value={excerpt} onChange={setExcerpt} />
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            Gunakan judul yang cepat dipahami pembaca, informatif untuk mesin pencari, dan tetap enak dibaca di halaman depan.
          </p>
        </div>

        <div className="grid gap-3 md:min-w-[220px]">
          <TitleMetaCard
            label="Status Judul"
            value={titleLength > 0 ? 'Sudah diisi' : 'Belum diisi'}
            hint={titleLength > 0 ? `${titleLength} karakter` : 'Isi judul untuk mulai autosave'}
            tone={titleLength > 0 ? 'success' : 'muted'}
          />
          <TitleMetaCard
            label="Blok Paragraf"
            value={`${paragraphCount} blok`}
            hint="Pantau ritme awal tulisan sebelum menambah media"
            tone="muted"
          />
          <TitleMetaCard
            label="Deck / Excerpt"
            value={excerptLength > 0 ? 'Sudah diisi' : 'Belum diisi'}
            hint={excerptLength > 0 ? `${excerptLength} karakter` : 'Ringkas inti berita dalam 1-2 kalimat pembuka'}
            tone={excerptLength > 0 ? 'success' : 'muted'}
          />
        </div>
      </div>
    </motion.section>
  )
}

function TitleInput({ compact = false }: { compact?: boolean }) {
  const { title, setTitle } = useEditorStore()
  return (
    <textarea
      value={title}
      onChange={e => setTitle(e.target.value)}
      placeholder="Tulis Judul Berita yang Memikat..."
      rows={2}
      className={cn(
        "w-full border-none bg-transparent font-serif font-black leading-[1.05] tracking-tight text-slate-950 outline-none resize-none dark:text-white",
        "placeholder:text-gray-300 dark:placeholder:text-white/15",
        compact ? "text-4xl md:text-5xl" : "text-4xl md:text-6xl"
      )}
    />
  )
}

function TitleMetaCard({
  label,
  value,
  hint,
  tone
}: {
  label: string
  value: string
  hint: string
  tone: 'success' | 'muted'
}) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-slate-950/50">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {tone === 'success' && <CheckCircle2 size={15} className="text-emerald-500" />}
        <p className="text-sm font-bold text-brand-black dark:text-white">
          {value}
        </p>
      </div>
      <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
        {hint}
      </p>
    </div>
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
    <div className="rounded-[24px] border border-gray-200/80 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-slate-950/40">
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
          compact ? "min-h-[68px]" : "min-h-[88px]"
        )}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Dipakai sebagai deck editorial dan bisa menjadi fallback ringkasan di kartu berita.
        </p>
        <span className="shrink-0 text-[11px] font-semibold text-gray-400 dark:text-gray-500">
          {value.trim().length} / 280
        </span>
      </div>
    </div>
  )
}
