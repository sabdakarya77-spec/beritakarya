'use client'
import { useEditorStore } from '../../../store/editorStore'
import type { HeadingBlock as THeadingBlock } from '@beritakarya/types'

const SIZE: Record<number, string> = {
  1: 'font-serif text-3xl font-black tracking-tight md:text-4xl',
  2: 'font-serif text-[1.7rem] font-black tracking-tight md:text-[2rem] lg:text-[2.2rem]',
  3: 'font-serif text-[1.35rem] font-bold tracking-tight md:text-[1.55rem] lg:text-[1.7rem]',
  4: 'text-lg font-semibold tracking-tight md:text-xl',
  5: 'text-base font-semibold',
  6: 'text-sm font-semibold'
}

const LABELS: Record<number, string> = {
  2: 'Judul Seksi',
  3: 'Subjudul',
  4: 'Judul Kecil'
}

export function HeadingBlock({ block }: { block: THeadingBlock }) {
  const { updateBlock } = useEditorStore()

  // Ensure level is within editorial bounds (2-4)
  const safeLevel = Math.max(2, Math.min(4, block.level))

  return (
    <div className="group relative flex items-start gap-3 py-1">
      <div className="absolute -left-24 top-2 hidden w-20 justify-end group-hover:flex">
        <select
          value={safeLevel}
          onChange={e => updateBlock(block.id, { level: Number(e.target.value) as any })}
          className="cursor-pointer bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-400 outline-none hover:text-brand-red transition-colors"
        >
          {Object.entries(LABELS).map(([val, label]) => (
            <option key={val} value={val} className="text-gray-900">
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={e => updateBlock(block.id, { content: e.currentTarget.innerText })}
          data-placeholder={`${LABELS[safeLevel as keyof typeof LABELS] || 'Heading'}...`}
          className={`outline-none text-slate-900 dark:text-white ${SIZE[safeLevel]} empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 dark:empty:before:text-white/10 empty:before:font-normal ${safeLevel === 2 ? 'leading-[1.1]' : safeLevel === 3 ? 'leading-[1.2]' : 'leading-tight'}`}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      </div>
    </div>
  )
}
