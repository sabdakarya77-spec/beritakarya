'use client'

import type { Block } from '@beritakarya/types'

interface WordPressUnsupportedMarkerProps {
  block: Block
  onSwitchToGridBlock: () => void
}

/**
 * WordPressUnsupportedMarker — render marker for unsupported block in WordPress mode.
 *
 * Menampilkan peringatan bahwa blok ini tidak didukung di mode WordPress
 * dan menawarkan CTA untuk beralih ke GridBlock.
 */
export function WordPressUnsupportedMarker({ block, onSwitchToGridBlock }: WordPressUnsupportedMarkerProps) {
  return (
    <div className="my-3 rounded-xl border border-dashed border-red-300 bg-red-50 px-4 py-3 dark:border-red-700 dark:bg-red-950/30">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
          ⚠️ Tidak Didukung
        </span>
        <span className="text-[11px] text-red-700 dark:text-red-300">
          {block.type}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
        Blok ini hanya tersedia di mode GridBlock.
      </p>
      <button
        onClick={onSwitchToGridBlock}
        className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700"
      >
        Buka di GridBlock
      </button>
    </div>
  )
}