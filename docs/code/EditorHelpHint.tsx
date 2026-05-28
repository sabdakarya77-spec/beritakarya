'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { cn } from '../../lib/utils'

interface EditorHelpHintProps {
  text: string
  className?: string
}

export function EditorHelpHint({ text, className }: EditorHelpHintProps) {
  const [open, setOpen] = useState(false)

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Lihat penjelasan singkat"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-red dark:hover:bg-white/10"
      >
        <Info size={12} />
      </button>

      {open && (
        <span className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-left text-[11px] font-medium normal-case tracking-normal text-gray-600 shadow-xl dark:border-white/10 dark:bg-slate-900 dark:text-gray-300">
          {text}
        </span>
      )}
    </span>
  )
}
