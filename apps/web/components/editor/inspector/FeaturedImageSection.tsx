import { useRef } from 'react'
import Image from 'next/image'
import { Image as ImageIcon, RotateCcw } from 'lucide-react'
import { api } from '../../../lib/api'
import { useToastStore } from '../../../store/toastStore'
import { InspectorSection, FieldLabel } from './InspectorSection'

interface FeaturedImageSectionProps {
  featuredImage: string
  updateArticleData: (data: any) => void
  uploadingFeatured: boolean
  setUploadingFeatured: (loading: boolean) => void
}

export function FeaturedImageSection({
  featuredImage,
  updateArticleData,
  uploadingFeatured,
  setUploadingFeatured
}: FeaturedImageSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToastStore()

  const handleFeaturedImageUpload = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    setUploadingFeatured(true)

    try {
      addToast('Sedang mengunggah gambar utama...', 'info')
      const { data } = await api.post('/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateArticleData({ featuredImage: data.data.url })
      addToast('Gambar utama berhasil diunggah', 'success')
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || 'Gagal mengunggah gambar utama'
      addToast(message, 'error')
    } finally {
      setUploadingFeatured(false)
    }
  }

  return (
    <InspectorSection
      eyebrow="Media"
      title="Gambar Utama"
      description="Gunakan visual yang kuat sebagai pintu masuk pembaca di homepage dan kartu berita."
    >
      <div className="space-y-4">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-dashed border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-slate-950/40">
          {featuredImage ? (
            <>
              <Image src={featuredImage} alt="Gambar utama artikel" fill className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
                  Gambar utama aktif
                </p>
                <p className="mt-1 text-xs text-white/85">Ganti gambar bila perlu agar framing artikel lebih kuat.</p>
              </div>
            </>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-colors hover:bg-brand-red/[0.03]"
            >
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-900">
                {uploadingFeatured ? (
                  <RotateCcw size={18} className="animate-spin text-gray-400" />
                ) : (
                  <ImageIcon size={18} className="text-gray-400" />
                )}
              </span>
              <p className="text-sm font-semibold text-brand-black dark:text-white">
                {uploadingFeatured ? 'Mengunggah gambar...' : 'Unggah gambar utama'}
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Bisa dari upload langsung atau isi URL fallback di bawah.
              </p>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) handleFeaturedImageUpload(file)
          }}
        />

        <div className="space-y-2">
          <FieldLabel>URL Gambar</FieldLabel>
          <input
            type="text"
            defaultValue={featuredImage}
            placeholder="https://..."
            onBlur={(event) => updateArticleData({ featuredImage: event.target.value.trim() })}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-black outline-none transition-colors focus:border-brand-red dark:border-white/10 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-brand-black transition-colors hover:border-brand-red/30 hover:text-brand-red dark:border-white/10 dark:text-white"
          >
            {featuredImage ? 'Ganti Gambar' : 'Upload'}
          </button>
          <button
            onClick={() => updateArticleData({ featuredImage: '' })}
            className="rounded-2xl border border-red-200 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-red-500 transition-colors hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
          >
            Hapus
          </button>
        </div>
      </div>
    </InspectorSection>
  )
}
