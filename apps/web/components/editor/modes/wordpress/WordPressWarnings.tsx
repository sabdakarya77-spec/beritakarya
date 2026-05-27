'use client'

import { AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react'

export interface WordPressWarning {
  type: 'info' | 'warning' | 'error'
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface WordPressWarningsProps {
  warnings: WordPressWarning[]
  onSwitchToGridBlock?: () => void
}

export function WordPressWarnings({ warnings, onSwitchToGridBlock }: WordPressWarningsProps) {
  if (warnings.length === 0 && !onSwitchToGridBlock) return null

  return (
    <div className="space-y-2">
      {warnings.map((w, idx) => (
        <div
          key={idx}
          className={`rounded-2xl border px-4 py-3 text-sm ${
            w.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
              : w.type === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
              : 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200'
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">
              {w.type === 'error' ? (
                <AlertCircle size={14} className="text-red-500" />
              ) : w.type === 'warning' ? (
                <AlertTriangle size={14} className="text-amber-500" />
              ) : null}
            </span>
            <div className="flex-1">
              <p className="text-xs leading-relaxed">{w.message}</p>
              {w.action && (
                <button
                  onClick={w.action.onClick}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-red hover:text-red-700"
                >
                  {w.action.label}
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {onSwitchToGridBlock && (
        <button
          onClick={onSwitchToGridBlock}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-transparent px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 transition-all hover:border-brand-red/30 hover:text-brand-red dark:border-white/10 dark:text-gray-400 dark:hover:text-brand-red"
        >
          <ArrowRight size={14} />
          Lanjut edit di GridBlock
        </button>
      )}
    </div>
  )
}