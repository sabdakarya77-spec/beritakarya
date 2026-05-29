'use client'

import { useState, useMemo } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import { CATEGORIES_CONFIG, CategoryItem } from '../../../lib/constants'
import { MediaLibraryModal } from '../MediaLibraryModal'
import { type MediaItem } from '../../../hooks/useMediaLibrary'
import { Image, Tag, Flag, Zap, Star, Sparkles, ChevronDown, Upload, ImageIcon, X, FolderOpen } from 'lucide-react'
import { useImageUpload } from '../../../hooks/useImageUpload'

export function TabSettings() {
  const { 
    categoryId, 
    tags, 
    featuredImage,
    isBreaking,
    isExclusive,
    isFeatured,
    updateArticleData 
  } = useEditorStore()

  const { upload, uploading, reset: resetUpload } = useImageUpload()

  const [localTags, setLocalTags] = useState<string[]>(tags)
  const [tagInput, setTagInput] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Get flat list of categories for dropdown
  const flatCategories = useMemo(() => {
    const result: CategoryItem[] = []
    CATEGORIES_CONFIG.forEach(cat => {
      result.push(cat)
      if (cat.subCategories) {
        cat.subCategories.forEach(sub => {
          result.push({ name: sub.name, slug: sub.slug })
        })
      }
    })
    return result
  }, [])

  // Find selected category name
  const selectedCategoryName = useMemo(() => {
    const found = flatCategories.find(c => c.slug === categoryId)
    return found?.name || 'Pilih kategori...'
  }, [categoryId, flatCategories])

  const handleAddTag = () => {
    if (tagInput.trim() && !localTags.includes(tagInput.trim())) {
      const newTags = [...localTags, tagInput.trim()]
      setLocalTags(newTags)
      updateArticleData({ tags: newTags })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    const newTags = localTags.filter(t => t !== tag)
    setLocalTags(newTags)
    updateArticleData({ tags: newTags })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleCategorySelect = (slug: string) => {
    updateArticleData({ categoryId: slug || null })
    setShowCategoryDropdown(false)
  }

  const handleMediaSelect = (media: MediaItem) => {
    updateArticleData({ featuredImage: media.url })
    setShowMediaLibrary(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const result = await upload(file)
      if (result) {
        updateArticleData({ featuredImage: result.url })
      }
    } finally {
      setUploadingImage(false)
      resetUpload()
    }
  }

  const handleRemoveFeaturedImage = () => {
    updateArticleData({ featuredImage: '' })
  }

  return (
    <div className="space-y-6">
      {/* Featured Image */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          <Image size={14} />
          Gambar Utama
        </label>
        
        {featuredImage ? (
          <div className="relative group">
            <img 
              src={featuredImage} 
              alt="Featured" 
              className="w-full aspect-video object-cover rounded-xl" 
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
              <button
                onClick={() => setShowMediaLibrary(true)}
                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                title="Pilih dari Galeri"
              >
                <FolderOpen className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleRemoveFeaturedImage}
                className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                title="Hapus"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* Upload Button */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploadingImage}
              />
              <div className="aspect-video rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-red/50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-brand-red bg-gray-50 dark:bg-slate-800/50">
                {uploadingImage ? (
                  <div className="w-6 h-6 border-2 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload size={20} />
                    <span className="text-xs">Upload Baru</span>
                  </>
                )}
              </div>
            </label>
            
            {/* Gallery Button */}
            <button
              onClick={() => setShowMediaLibrary(true)}
              className="aspect-video rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500/50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-purple-500 bg-gray-50 dark:bg-slate-800/50"
            >
              <ImageIcon size={20} />
              <span className="text-xs">Pilih dari Galeri</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          <Tag size={14} />
          Kategori
        </label>
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm text-left"
          >
            <span className={categoryId ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
              {selectedCategoryName}
            </span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          
          {showCategoryDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowCategoryDropdown(false)} 
              />
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-xl max-h-[200px] overflow-y-auto">
                <button
                  onClick={() => handleCategorySelect('')}
                  className="w-full px-3 py-2 text-left text-sm text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-100 dark:border-slate-700"
                >
                  Hapus pilihan
                </button>
                {CATEGORIES_CONFIG.map((cat) => (
                  <div key={cat.slug}>
                    {/* Parent Category */}
                    <button
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`w-full px-3 py-2 text-left text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 ${
                        categoryId === cat.slug ? 'text-brand-red bg-brand-red/5' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {cat.name}
                    </button>
                    {/* Sub Categories */}
                    {cat.subCategories?.map((sub) => (
                      <button
                        key={sub.slug}
                        onClick={() => handleCategorySelect(sub.slug)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 ${
                          categoryId === sub.slug ? 'text-brand-red bg-brand-red/5' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        ↳ {sub.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          <Tag size={14} />
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {localTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-full text-xs"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tambah tag..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm"
        />
      </div>

      {/* Editorial Badges */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          <Flag size={14} />
          Badge Editorial
        </label>
        
        <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-brand-red/50 transition-colors">
          <input
            type="checkbox"
            checked={isBreaking}
            onChange={(e) => updateArticleData({ isBreaking: e.target.checked })}
            className="rounded"
          />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-500" />
            <div>
              <span className="text-sm font-medium block">Breaking News</span>
              <span className="text-xs text-gray-500">Tampilkan badge merah</span>
            </div>
          </div>
        </label>
        
        <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-purple-500/50 transition-colors">
          <input
            type="checkbox"
            checked={isExclusive}
            onChange={(e) => updateArticleData({ isExclusive: e.target.checked })}
            className="rounded"
          />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <div>
              <span className="text-sm font-medium block">Eksklusif</span>
              <span className="text-xs text-gray-500">Konten eksklusif</span>
            </div>
          </div>
        </label>
        
        <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-amber-500/50 transition-colors">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => updateArticleData({ isFeatured: e.target.checked })}
            className="rounded"
          />
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-sm font-medium block">Featured</span>
              <span className="text-xs text-gray-500">Tampilkan di homepage</span>
            </div>
          </div>
        </label>
      </div>

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  )
}

export default TabSettings