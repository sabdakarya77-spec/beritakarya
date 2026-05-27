'use client'

import { useRef, useState } from 'react'
import { SmartImage } from '../../ui/SmartImage'
import { useEditorStore } from '../../../store/editorStore'
import { api } from '../../../lib/api'
import type { ImageBlock as TImageBlock } from '@beritakarya/types'
import { useCaption } from '../../../hooks/useAI' // Import AI caption hook
import { useToastStore } from '../../../store/toastStore'
import { MediaLibraryModal } from '../MediaLibraryModal'
import { MediaItem } from '../../../hooks/useMediaLibrary'

import { ImageIcon, X, Sparkles, RefreshCcw, Trash2 } from 'lucide-react'

export function ImageBlock({ block }: { block: TImageBlock }) {
  const { updateBlock, removeBlock } = useEditorStore()
  const { addToast } = useToastStore()
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [captionState, doCaption] = useCaption()

  const handleUpload = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    setUploading(true)
    setProgress(10)
    try {
      const { data } = await api.post('/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 90))
        }
      })
      setProgress(100)
      updateBlock(block.id, {
        url: data.data.url,
        alt: file.name.replace(/.[^/.]+$/, ''),
        width: data.data.width,
        height: data.data.height,
        caption: data.data.caption || '',
        credit: data.data.credit || ''
      })
      addToast('Gambar berhasil diunggah!', 'success')
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || 'Upload gagal, coba lagi'
      console.error('[ImageBlock] Upload error:', error?.response?.data || error)
      addToast(msg, 'error')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleSelectFromGallery = (media: MediaItem | MediaItem[]) => {
    const item = Array.isArray(media) ? media[0] : media
    if (!item) return
    updateBlock(block.id, {
      url: item.url,
      alt: item.altText || '',
      width: item.width,
      height: item.height,
      caption: item.caption || '',
      credit: item.credit || ''
    })
    addToast('Gambar berhasil dipilih dari galeri!', 'success')
  }

  const handleGenerateCaption = async () => {
    if (!block.url) return
    const result = await doCaption({ imageUrl: block.url })
    if (result) {
      updateBlock(block.id, { caption: result.caption, alt: result.altText })
    }
  }

  if (!block.url) {
    return (
      <div
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) handleUpload(f) }}
        onDragOver={e => e.preventDefault()}
        className="group border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-12 text-center hover:border-brand-red/30 hover:bg-brand-red/[0.01] transition-all duration-300"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-brand-red/10 group-hover:text-brand-red transition-colors dark:bg-white/5">
          <ImageIcon size={24} />
        </div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">Tambahkan gambar ke artikel</p>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Format JPG, PNG, WebP — Maksimum 10MB</p>
        
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 bg-gray-900 dark:bg-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-black transition-all shadow"
          >
            Unggah Berkas
          </button>
          
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="px-4 py-2 bg-brand-red text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow shadow-brand-red/10"
          >
            📁 Pilih dari Galeri
          </button>
        </div>

        {uploading && (
          <div className="mt-6 mx-auto max-w-[200px]">
            <div className="overflow-hidden bg-gray-100 dark:bg-white/5 rounded-full h-1.5">
              <div 
                className="bg-brand-red h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-brand-red animate-pulse">
              Mengunggah {progress}%
            </p>
          </div>
        )}
        
        <input 
          ref={inputRef} 
          type="file" 
          accept="image/*" 
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if(f) handleUpload(f) }} 
        />

        <MediaLibraryModal 
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          onSelect={handleSelectFromGallery}
          allowMultiple={false}
        />
      </div>
    )
  }

  return (
    <div className="group/block relative my-2 lg:my-3">
      {/* Action Overlay */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-0 group-hover/block:opacity-100 transition-all duration-300 translate-y-1 group-hover/block:translate-y-0">
        <button
          onClick={() => setIsGalleryOpen(true)}
          className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl shadow-xl hover:bg-brand-red hover:text-white transition-all border border-gray-100 dark:border-white/10"
        >
          <ImageIcon size={12} />
          Galeri Media
        </button>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl shadow-xl hover:bg-brand-red hover:text-white transition-all border border-gray-100 dark:border-white/10"
        >
          <RefreshCcw size={12} />
          Ganti Upload
        </button>
        <button
          onClick={() => removeBlock(block.id)}
          className="flex h-8 w-8 items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white rounded-xl shadow-xl hover:bg-red-500 hover:text-white transition-all border border-gray-100 dark:border-white/10"
          title="Hapus Blok"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-gray-50 dark:bg-white/5 ring-1 ring-gray-200/50 dark:ring-white/10">
        <SmartImage
          src={block.url}
          alt={block.alt || 'Article image'}
          width={1600}
          height={900}
          fill={false}
          context="article_block"
          className="w-full object-cover max-h-[500px] h-auto transition-transform duration-700 group-hover/block:scale-[1.02]"
        />
      </div>

      <div className="mt-5 px-2 lg:mt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start lg:gap-5">
          <div className="flex-1">
            <input
              value={block.caption || ''}
              onChange={e => updateBlock(block.id, { caption: e.target.value })}
              placeholder="Tulis keterangan foto (caption)..."
              className="w-full bg-transparent font-serif text-[1rem] italic text-slate-600 outline-none placeholder:text-gray-300 dark:text-slate-300 dark:placeholder:text-white/10 lg:text-[1.06rem]"
            />
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0">
                Kredit
              </span>
              <input
                value={block.credit || ''}
                onChange={e => updateBlock(block.id, { credit: e.target.value })}
                placeholder="Sumber foto / Fotografer"
                className="flex-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 outline-none bg-transparent placeholder:text-gray-200 dark:placeholder:text-white/5 uppercase tracking-wide"
              />
            </div>
          </div>
          
          <button
            onClick={handleGenerateCaption}
            disabled={captionState.loading}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all border border-amber-200/50 dark:border-amber-900/30 shrink-0 disabled:opacity-50"
          >
            <Sparkles size={12} />
            {captionState.loading ? 'Menganalisis...' : 'AI Caption'}
          </button>
        </div>
      </div>

      {captionState.error && (
        <p className="text-[10px] font-bold text-red-500 dark:text-red-400 mt-2 px-2 uppercase tracking-tight">
          Gagal: {captionState.error}
        </p>
      )}

      <input 
        ref={inputRef} 
        type="file" 
        accept="image/*" 
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if(f) handleUpload(f) }} 
      />

      <MediaLibraryModal 
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={handleSelectFromGallery}
        allowMultiple={false}
      />
    </div>
  )
}
