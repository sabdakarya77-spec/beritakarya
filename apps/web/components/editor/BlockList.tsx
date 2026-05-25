'use client'
import { useEditorStore } from '../../store/editorStore'
import { BlockWrapper } from './BlockWrapper'
import { BlockRenderer } from './BlockRegistry'
import { FileText, Plus } from 'lucide-react'

export function BlockList() {
  const { blocks } = useEditorStore()

  if (!blocks.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 text-gray-300">
          <FileText size={32} />
        </div>
        <div className="max-w-[280px] space-y-2">
          <h3 className="text-sm font-semibold text-gray-600">Mulai menulis artikel</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Kanvas Anda masih kosong. Tekan <kbd className="px-1.5 py-0.5 rounded border border-gray-200 bg-white text-[10px] font-sans shadow-sm">Enter</kbd> atau klik tombol <span className="inline-flex items-center gap-0.5 text-blue-500 font-medium"><Plus size={10} /> Tambah Blok</span> untuk memulai.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1 pb-32">
      {blocks.map((block, idx) => (
        <BlockWrapper key={block.id} block={block} index={idx}>
          <BlockRenderer block={block} />
        </BlockWrapper>
      ))}
    </div>
  )
}