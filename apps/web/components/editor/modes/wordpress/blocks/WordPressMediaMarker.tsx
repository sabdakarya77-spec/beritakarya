'use client'

import type { Block } from '@beritakarya/types'

interface WordPressMediaMarkerProps {
  block: Block
}

/**
 * WordPressMediaMarker — render marker for media block in continuous flow.
 *
 * Menampilkan indikator bahwa di posisi ini ada blok media
 * yang tidak bisa ditampilkan di editor kontinu WordPress.
 */
export function WordPressMediaMarker({ block }: WordPressMediaMarkerProps) {
  return (
    <div className="my-3 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/30">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
          📎 Media
        </span>
        <span className="text-[11px] text-amber-700 dark:text-amber-300">
          {block.type === 'image' && 'Gambar'}
          {block.type === 'embed' && 'Embed'}
          {block.type === 'gallery' && 'Galeri'}
          {block.type === 'imageGrid' && 'Grid Gambar'}
          {block.type === 'mediaText' && 'Media + Teks'}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
        Blok ini muncul di bawah editor kontinu. Gunakan GridBlock untuk tata letak yang lebih presisi.
      </p>
    </div>
  )
}