'use client'
import { useRef, useState } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import { cn } from '../../../lib/utils'
import type { MediaTextBlock as TMediaTextBlock } from '@beritakarya/types'
import { ImageIcon, RotateCcw, AlignLeft, AlignRight } from 'lucide-react'
import { useToastStore } from '../../../store/toastStore'
import { api } from '../../../lib/api'
import { SmartImage } from '../../ui/SmartImage'

interface Props {
  block: TMediaTextBlock
}

export function MediaTextBlock({ block }: Props) {
  const { updateBlock } = useEditorStore()
  const { addToast } = useToastStore()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('Berkas harus berupa gambar!', 'error')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post('/media/upload?purpose=editorial', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const imageUrl = data.data.url
      updateBlock(block.id, { url: imageUrl })
      addToast('Gambar berhasil diunggah!', 'success')
    } catch (error: any) {
      console.error('[MediaTextBlock] Upload error:', error)
      addToast('Gagal mengunggah gambar. Silakan coba lagi.', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    updateBlock(block.id, { url: '', alt: '', caption: '' })
    addToast('Gambar dihapus dari blok.', 'info')
  }

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    updateBlock(block.id, { content: e.currentTarget.innerText })
  }

  const toggleAlign = () => {
    const newAlign = block.align === 'left' ? 'right' : 'left'
    updateBlock(block.id, { align: newAlign })
    addToast(`Tata letak diubah: Gambar di ${newAlign === 'left' ? 'Kiri' : 'Kanan'}`, 'success')
  }

  return (
    <div className="relative group/mediablock py-4 w-full">
      {/* Align Toggle Button in upper corner of the block container */}
      <div className="absolute -top-2 right-2 z-20 opacity-0 group-hover/mediablock:opacity-100 transition-opacity">
        <button
          onClick={toggleAlign}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-slate-900 text-gray-500 hover:text-brand-red dark:text-gray-400 dark:hover:text-brand-red border border-gray-150 dark:border-white/10 rounded-xl shadow-md hover:scale-102 active:scale-98 transition-all"
          title="Tukar Posisi Gambar/Teks"
        >
          {block.align === 'left' ? (
            <>
              <AlignRight size={12} />
              <span>Gambar Kanan</span>
            </>
          ) : (
            <>
              <AlignLeft size={12} />
              <span>Gambar Kiri</span>
            </>
          )}
        </button>
      </div>

      <div
        className={cn(
          "flex flex-col gap-6 p-5 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl transition-all duration-300",
          block.align === 'right' ? "md:flex-row-reverse" : "md:flex-row"
        )}
      >
        {/* Column 1: Image Side */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          {block.url ? (
            <div className="relative group/img w-full rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="relative w-full aspect-[4/3]">
                <SmartImage
                  src={block.url}
                  alt={block.alt || 'Media & Text block image'}
                  fill
                  context="media_text"
                  className="object-cover rounded-t-xl transition-transform duration-300 group-hover/img:scale-102"
                />
                {/* Image Controls Hover Layer */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-slate-800 text-xs font-black px-3 py-2 rounded-lg hover:bg-brand-red hover:text-white transition-all shadow-md uppercase tracking-wider"
                  >
                    Ganti
                  </button>
                  <button
                    onClick={handleRemoveImage}
                    className="bg-black/60 text-white text-xs font-black px-3 py-2 rounded-lg hover:bg-red-600 transition-all shadow-md uppercase tracking-wider"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              {/* Alt & Caption inputs */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-white/10 space-y-2">
                <input
                  type="text"
                  placeholder="Alt text (deskripsi gambar untuk SEO)..."
                  value={block.alt || ''}
                  onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                  className="w-full text-[10px] bg-transparent outline-none border-b border-transparent focus:border-brand-red/30 pb-0.5 text-gray-500 placeholder-gray-400 dark:text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Tambah caption gambar..."
                  value={block.caption || ''}
                  onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                  className="w-full text-xs bg-transparent outline-none border-b border-transparent focus:border-brand-red/30 pb-0.5 text-gray-600 text-center font-medium placeholder-gray-400 dark:text-gray-400"
                />
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl hover:border-brand-red dark:hover:border-brand-red/50 hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer relative"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                {uploading ? (
                  <RotateCcw size={20} className="text-gray-400 animate-spin" />
                ) : (
                  <ImageIcon size={20} className="text-gray-400" />
                )}
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                {uploading ? 'Mengunggah Gambar...' : 'Upload Foto Media'}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[200px]">
                Format WebP, JPG, PNG bersanding dengan paragraf editorial
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleUpload(f)
            }}
          />
        </div>

        {/* Column 2: Paragraph Text Side */}
        <div className="w-full md:w-1/2 flex flex-col self-stretch">
          <div
            ref={textRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTextChange}
            data-placeholder="Tulis penjelasan atau kolom berita editorial pendukung gambar di sini..."
            className="w-full h-full min-h-[150px] outline-none text-base leading-relaxed text-brand-black dark:text-gray-200 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 dark:empty:before:text-white/20 empty:before:pointer-events-none p-3 rounded-xl bg-gray-50/30 dark:bg-white/[0.01] border border-transparent focus:border-gray-200 dark:focus:border-white/10 transition-colors"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      </div>
    </div>
  )
}
