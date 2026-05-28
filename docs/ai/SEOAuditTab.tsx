'use client'
import { useState, useEffect } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'

export function SEOAuditTab() {
  const { title, blocks, metaTitle, metaDescription } = useEditorStore()
  const [focusKeyword, setFocusKeyword] = useState('')

  // Load / save focus keyword locally in editor session
  useEffect(() => {
    const saved = sessionStorage.getItem('seo-focus-keyword')
    if (saved) setFocusKeyword(saved)
  }, [])

  const handleKeywordChange = (val: string) => {
    setFocusKeyword(val)
    sessionStorage.setItem('seo-focus-keyword', val)
  }

  // Helper: Extract all text content from paragraphs, headings, lists, quotes, callouts
  const getFullTextContent = () => {
    return blocks
      .map(b => {
        if (b.type === 'paragraph' || b.type === 'heading' || b.type === 'quote' || b.type === 'callout') {
          return b.content || ''
        }
        if (b.type === 'list' && b.items) {
          return b.items.join(' ')
        }
        if (b.type === 'mediaText') {
          return (b.content || '') + ' ' + (b.caption || '')
        }
        return ''
      })
      .join(' ')
  }

  const fullText = getFullTextContent()
  const totalWords = fullText.trim() === '' ? 0 : fullText.trim().split(/\s+/).length

  // Keyword occurrences
  const getKeywordCount = () => {
    if (!focusKeyword.trim()) return 0
    const escaped = focusKeyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
    const matches = fullText.match(regex)
    return matches ? matches.length : 0
  }

  const keywordCount = getKeywordCount()
  const keywordDensity = totalWords === 0 ? 0 : (keywordCount / totalWords) * 100

  // 1. Audit Judul (Title)
  const titleLength = title.length
  const isTitleLenValid = titleLength >= 40 && titleLength <= 70
  const isKeywordInTitle = focusKeyword.trim() 
    ? title.toLowerCase().includes(focusKeyword.toLowerCase())
    : false

  // 2. Audit Meta Title
  const metaTitleLen = metaTitle.length
  const isMetaTitleLenValid = metaTitleLen >= 50 && metaTitleLen <= 60
  const isKeywordInMetaTitle = focusKeyword.trim()
    ? metaTitle.toLowerCase().includes(focusKeyword.toLowerCase())
    : false

  // 3. Audit Meta Description
  const metaDescLen = metaDescription.length
  const isMetaDescLenValid = metaDescLen >= 120 && metaDescLen <= 160
  const isKeywordInMetaDesc = focusKeyword.trim()
    ? metaDescription.toLowerCase().includes(focusKeyword.toLowerCase())
    : false

  // 4. Audit Image Alt Text
  const imageBlocks = blocks.filter(b => b.type === 'image' || b.type === 'mediaText')
  const imagesMissingAlt = imageBlocks.filter(b => !b.alt || b.alt.trim() === '')
  const hasImages = imageBlocks.length > 0
  const allImagesHaveAlt = hasImages && imagesMissingAlt.length === 0

  return (
    <div className="space-y-6 text-xs text-gray-700 dark:text-gray-200">
      {/* Focus Keyword Input */}
      <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
          🎯 Fokus Kata Kunci (Focus Keyword)
        </label>
        <input 
          type="text"
          value={focusKeyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          placeholder="Masukkan topik/kata kunci berita..."
          className="w-full bg-white dark:bg-[#0a0f1d] border border-gray-200 dark:border-white/10 px-3.5 py-2.5 rounded-lg text-xs outline-none focus:border-brand-red dark:focus:border-brand-red transition-all"
        />
        <p className="text-[9px] text-gray-400 mt-1">
          Ketik kata kunci utama berita Anda di atas untuk menjalankan SEO Audit secara real-time.
        </p>
      </div>

      {/* General Metrics Bar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5 text-center">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Kata</p>
          <p className="text-lg font-black text-brand-black dark:text-white mt-1">{totalWords}</p>
        </div>
        <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5 text-center">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Kepadatan Keyword</p>
          <p className="text-lg font-black text-brand-black dark:text-white mt-1">
            {focusKeyword.trim() ? `${keywordDensity.toFixed(2)}%` : '-'}
          </p>
        </div>
      </div>

      {/* SEO Checklist */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 border-b border-gray-100 dark:border-white/5 pb-2">
          📋 Hasil Audit SEO & Meta
        </h3>

        {/* 1. Judul Audit */}
        <div className="space-y-2">
          {/* Panjang Judul */}
          <div className="flex items-start gap-3">
            {isTitleLenValid ? (
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">Panjang Judul ({titleLength} karakter)</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {isTitleLenValid 
                  ? 'Panjang judul ideal untuk hasil pencarian Google (40 - 70 karakter).' 
                  : 'Panjang judul sebaiknya antara 40 dan 70 karakter agar tidak terpotong di Google.'}
              </p>
            </div>
          </div>

          {/* Keyword di Judul */}
          {focusKeyword.trim() && (
            <div className="flex items-start gap-3">
              {isKeywordInTitle ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">Keyword pada Judul</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {isKeywordInTitle 
                    ? `Kata kunci "${focusKeyword}" berhasil ditemukan di dalam judul berita!` 
                    : `Judul sebaiknya memuat kata kunci utama "${focusKeyword}".`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. Kepadatan Keyword (Keyword Density) */}
        {focusKeyword.trim() && (
          <div className="flex items-start gap-3 border-t border-gray-50 dark:border-white/5 pt-3">
            {keywordDensity >= 1 && keywordDensity <= 2.5 ? (
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            ) : keywordDensity > 2.5 ? (
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">Kepadatan Kata Kunci ({keywordCount}x muncul)</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {keywordDensity >= 1 && keywordDensity <= 2.5 
                  ? `Ideal (${keywordDensity.toFixed(2)}%). Kata kunci disebar dengan sangat baik dalam tulisan.`
                  : keywordDensity > 2.5 
                    ? `Kepadatan terlalu tinggi (${keywordDensity.toFixed(2)}%). Hindari keyword stuffing agar tidak dinilai spam.`
                    : `Sangat rendah (${keywordDensity.toFixed(2)}%). Usahakan sebar kata kunci minimal 1% dari total kata.`}
              </p>
            </div>
          </div>
        )}

        {/* 3. Meta Title Audit */}
        <div className="space-y-2 border-t border-gray-50 dark:border-white/5 pt-3">
          {/* Panjang Meta Title */}
          <div className="flex items-start gap-3">
            {isMetaTitleLenValid ? (
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">Panjang Meta Title ({metaTitleLen} karakter)</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {isMetaTitleLenValid 
                  ? 'Panjang meta title ideal untuk SEO (50 - 60 karakter).' 
                  : 'Meta title sebaiknya memiliki panjang antara 50 dan 60 karakter.'}
              </p>
            </div>
          </div>

          {/* Keyword di Meta Title */}
          {focusKeyword.trim() && (
            <div className="flex items-start gap-3">
              {isKeywordInMetaTitle ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">Keyword pada Meta Title</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {isKeywordInMetaTitle 
                    ? `Kata kunci "${focusKeyword}" berhasil ditemukan di dalam meta title!` 
                    : `Meta title sebaiknya memuat kata kunci utama "${focusKeyword}".`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. Meta Description Audit */}
        <div className="space-y-2 border-t border-gray-50 dark:border-white/5 pt-3">
          {/* Panjang Meta Description */}
          <div className="flex items-start gap-3">
            {isMetaDescLenValid ? (
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">Panjang Meta Description ({metaDescLen} karakter)</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {isMetaDescLenValid 
                  ? 'Panjang meta deskripsi ideal untuk SEO (120 - 160 karakter).' 
                  : 'Meta deskripsi idealnya memiliki panjang antara 120 dan 160 karakter.'}
              </p>
            </div>
          </div>

          {/* Keyword di Meta Description */}
          {focusKeyword.trim() && (
            <div className="flex items-start gap-3">
              {isKeywordInMetaDesc ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">Keyword pada Meta Description</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {isKeywordInMetaDesc 
                    ? `Kata kunci "${focusKeyword}" berhasil ditemukan di dalam meta deskripsi!` 
                    : `Meta deskripsi sebaiknya memuat kata kunci utama "${focusKeyword}".`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 5. Alt Text Gambar */}
        <div className="flex items-start gap-3 border-t border-gray-50 dark:border-white/5 pt-3">
          {!hasImages ? (
            <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
          ) : allImagesHaveAlt ? (
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold">Alt Text Gambar ({imageBlocks.length - imagesMissingAlt.length} / {imageBlocks.length})</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {!hasImages 
                ? 'Tidak ada gambar dalam tulisan ini. SEO Audit dilewati.' 
                : allImagesHaveAlt 
                  ? 'Hebat! Semua gambar dalam artikel ini memiliki Alt Text untuk mesin pencari.' 
                  : `Ada ${imagesMissingAlt.length} gambar yang belum memiliki deskripsi (Alt Text). Segera lengkapi untuk menaikkan peringkat gambar Google.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
