'use client'
import { useEditorStore } from '../../../store/editorStore'
import type { CalloutBlock as TCalloutBlock } from '@beritakarya/types'
import { Info, AlertCircle, CheckCircle, Zap, Quote } from 'lucide-react'
import { cn } from '../../../lib/utils'

const VARIANTS = {
  info: { icon: Info, color: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30' },
  warning: { icon: AlertCircle, color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30' },
  error: { icon: AlertCircle, color: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' },
  success: { icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30' },
  editorial: { icon: Zap, color: 'bg-brand-red/5 text-brand-red border-brand-red/10 dark:bg-brand-red/10 dark:text-brand-red dark:border-brand-red/20' }
}

export function CalloutBlock({ block }: { block: TCalloutBlock }) {
  const { updateBlock } = useEditorStore()
  const config = VARIANTS[block.variant || 'editorial']
  const Icon = config.icon

  return (
    <div className={cn(
      "group/callout relative rounded-[28px] border p-6 transition-all duration-300 lg:p-8",
      config.color
    )}>
      {/* Variant Selector */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover/callout:opacity-100 transition-opacity">
        {Object.keys(VARIANTS).map((v) => (
          <button
            key={v}
            onClick={() => updateBlock(block.id, { variant: v as any })}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              block.variant === v ? "scale-125 border border-white" : "opacity-30 hover:opacity-100",
              v === 'info' ? 'bg-blue-500' :
              v === 'warning' ? 'bg-amber-500' :
              v === 'error' ? 'bg-red-500' :
              v === 'success' ? 'bg-emerald-500' : 'bg-brand-red'
            )}
          />
        ))}
      </div>

      <div className="flex gap-4 lg:gap-6">
        <div className="mt-1 shrink-0">
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <textarea
          value={block.content}
          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
          placeholder="Tulis informasi penting atau highlight di sini..."
          rows={2}
          className="flex-1 resize-none border-none bg-transparent font-serif text-[1.05rem] font-bold leading-8 outline-none placeholder-current/30 md:text-[1.12rem] lg:text-[1.18rem] lg:leading-[2rem]"
        />
      </div>
    </div>
  )
}
