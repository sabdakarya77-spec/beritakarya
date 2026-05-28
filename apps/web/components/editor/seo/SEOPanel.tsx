'use client'

import { useState, useEffect } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import { AlertCircle, CheckCircle, Search, Eye } from 'lucide-react'

/**
 * SEO Panel Component
 * 
 * Fitur:
 * - Meta Title input dengan karakter counter
 * - Meta Description input dengan karakter counter
 * - SEO Preview (Google snippet simulation)
 * - Validation warnings
 */
export function SEOPanel() {
  const { 
    metaTitle, 
    metaDescription, 
    title,
    updateArticleData 
  } = useEditorStore()

  const [localTitle, setLocalTitle] = useState(metaTitle)
  const [localDesc, setLocalDesc] = useState(metaDescription)

  // Sync dengan store
  useEffect(() => {
    setLocalTitle(metaTitle || title)
  }, [metaTitle, title])

  useEffect(() => {
    setLocalDesc(metaDescription)
  }, [metaDescription])

  // Debounced update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateArticleData({ metaTitle: localTitle })
    }, 500)
    return () => clearTimeout(timer)
  }, [localTitle, updateArticleData])

  useEffect(() => {
    const timer = setTimeout(() => {
      updateArticleData({ metaDescription: localDesc })
    }, 500)
    return () => clearTimeout(timer)
  }, [localDesc, updateArticleData])

  // Validation
  const titleLength = localTitle?.length || 0
  const descLength = localDesc?.length || 0
  const titleValid = titleLength > 0 && titleLength <= 60
  const descValid = descLength > 0 && descLength <= 160

  return (
    <div className="seo-panel space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-gray-200 dark:border-slate-700">
        <Search className="w-5 h-5 text-brand-red" />
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">SEO Settings</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Optimalkan artikel untuk mesin pencari
          </p>
        </div>
      </div>

      {/* Meta Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Meta Title
          </label>
          <span className={`text-xs ${titleLength > 60 ? 'text-red-500' : 'text-gray-400'}`}>
            {titleLength}/60
          </span>
        </div>
        <input
          type="text"
          value={localTitle || ''}
          onChange={(e) => setLocalTitle(e.target.value)}
          placeholder={title || 'Judul artikel...'}
          className={`
            w-full px-3 py-2 rounded-lg border text-sm
            bg-white dark:bg-slate-800
            border-gray-200 dark:border-slate-700
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red
            transition-colors
            ${!titleValid && titleLength > 0 ? 'border-red-500' : ''}
          `}
        />
        {titleValid ? (
          <p className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="w-3 h-3" />
            Title optimal untuk SEO
          </p>
        ) : titleLength > 60 ? (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="w-3 h-3" />
            Title terlalu panjang ({titleLength - 60} karakter berlebih)
          </p>
        ) : (
          <p className="text-xs text-gray-400">
            Gunakan 50-60 karakter untuk hasil optimal
          </p>
        )}
      </div>

      {/* Meta Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Meta Description
          </label>
          <span className={`text-xs ${descLength > 160 ? 'text-red-500' : 'text-gray-400'}`}>
            {descLength}/160
          </span>
        </div>
        <textarea
          value={localDesc || ''}
          onChange={(e) => setLocalDesc(e.target.value)}
          placeholder="Deskripsi singkat artikel untuk snippet Google..."
          rows={3}
          className={`
            w-full px-3 py-2 rounded-lg border text-sm resize-none
            bg-white dark:bg-slate-800
            border-gray-200 dark:border-slate-700
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red
            transition-colors
            ${!descValid && descLength > 0 ? 'border-red-500' : ''}
          `}
        />
        {descValid ? (
          <p className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="w-3 h-3" />
            Description optimal untuk SEO
          </p>
        ) : descLength > 160 ? (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="w-3 h-3" />
            Description terlalu panjang ({descLength - 160} karakter berlebih)
          </p>
        ) : (
          <p className="text-xs text-gray-400">
            Gunakan 120-160 karakter untuk hasil optimal
          </p>
        )}
      </div>

      {/* SEO Preview */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview Google
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
          {/* Google Snippet Preview */}
          <div className="space-y-1">
            <div className="text-blue-700 dark:text-blue-400 text-sm truncate">
              beritakarya.com
            </div>
            <div className="text-blue-800 dark:text-blue-300 text-lg font-medium hover:underline cursor-pointer">
              {localTitle || title || 'Judul Artikel'}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm leading-snug line-clamp-2">
              {localDesc || 'Deskripsi artikel akan muncul di sini. Tambahkan meta description untuk hasil yang lebih baik.'}
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
          💡 Tips SEO
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Masukkan keyword utama di awal judul</li>
          <li>• Gunakan deskripsi yang menarik dan relevan</li>
          <li>• Pastikan meta title unik untuk setiap halaman</li>
          <li>• Hindari keyword stuffing</li>
        </ul>
      </div>
    </div>
  )
}

export default SEOPanel