'use client'
import { useEditorStore } from '../../../store/editorStore'
import type { HeadingBlock as THeadingBlock } from '@beritakarya/types'

const SIZE: Record<number, string> = {
  1: 'text-3xl font-black tracking-tight',
  2: 'text-2xl font-bold tracking-tight',
  3: 'text-xl font-bold',
  4: 'text-lg font-semibold',
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
          className={`outline-none leading-tight text-slate-900 dark:text-white ${SIZE[safeLevel]} empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 dark:empty:before:text-white/10 empty:before:font-normal`}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      </div>
    </div>
  )
}