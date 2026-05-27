'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Image as ImageIcon, Upload, Search, Filter, 
  X, Check, RefreshCw, AlertTriangle, FileText, ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMediaLibrary, MediaItem } from '../../hooks/useMediaLibrary'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'

interface MediaLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: MediaItem | MediaItem[]) => void
  allowMultiple?: boolean
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  allowMultiple = false
}: MediaLibraryModalProps) {
  const { items, setItems, loading, hasMore, loadMore, refresh } = useMediaLibrary()
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery')
  const [search, setSearch] = useState('')
  const [formatFilter, setFormatFilter] = useState<string>('all')
  
  // Selection states
  const [selectedSingle, setSelectedSingle] = useState<MediaItem | null>(null)
  const [selectedMulti, setSelectedMulti] = useState<MediaItem[]>([])

  // Metadata form states (tied to currently selected item for editing)
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')
  const [credit, setCredit] = useState('')
  const [savingMetadata, setSavingMetadata] = useState(false)

  // Upload states
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Sync selection details to metadata forms when selected item changes
  useEffect(() => {
    if (selectedSingle) {
      setAltText(selectedSingle.altText || '')
      setCaption(selectedSingle.caption || '')
      setCredit(selectedSingle.credit || '')
    } else {
      setAltText('')
      setCaption('')
      setCredit('')
    }
  }, [selectedSingle])

  const handleSelectMedia = (item: MediaItem) => {
    if (allowMultiple) {
      setSelectedMulti(prev => {
        const index = prev.findIndex(i => i.id === item.id)
        if (index > -1) {
          return prev.filter(i => i.id !== item.id)
        } else {
          return [...prev, item]
        }
      })
      // Set as "active" for preview/metadata editing
      setSelectedSingle(item)
    } else {
      if (selectedSingle?.id === item.id) {
        setSelectedSingle(null)
      } else {
        setSelectedSingle(item)
      }
    }
  }

  const handleConfirmSelection = () => {
    if (allowMultiple) {
      if (selectedMulti.length === 0) return
      onSelect(selectedMulti)
    } else {
      if (!selectedSingle) return
      onSelect(selectedSingle)
    }
    onClose()
  }

  const handleUpdateMetadata = async () => {
    if (!selectedSingle) return
    setSavingMetadata(true)
    try {
      const { data } = await api.patch(`/media/${selectedSingle.id}`, {
        altText,
        caption,
        credit
      })
      
      // Update local state items list
      setItems(prev => prev.map(m => m.id === data.data.id ? data.data : m))
      setSelectedSingle(data.data)
      
      // Update selectedMulti list if present
      if (allowMultiple) {
        setSelectedMulti(prev => prev.map(m => m.id === data.data.id ? data.data : m))
      }
      
      alert('Metadata berhasil disimpan!')
    } catch (e) {
      alert('Gagal memperbarui metadata')
    } finally {
      setSavingMetadata(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Standard client side validation
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!allowed.includes(file.type)) {
      setUploadError('Tipe file tidak didukung (Gunakan JPG, PNG, WebP, GIF, atau PDF)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Ukuran file tidak boleh melebihi 10MB')
      return
    }

    setUploading(true)
    setUploadProgress(10)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('purpose', 'editorial') // bypass standard watermarks for editorial galleries

    try {
      const { data } = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 90))
          }
        }
      })

      const newMedia: MediaItem = data.data
      setUploadProgress(100)
      
      // Add new item to library list
      setItems(prev => [newMedia, ...prev])
      
      // Select it automatically
      if (allowMultiple) {
        setSelectedMulti(prev => [...prev, newMedia])
      }
      setSelectedSingle(newMedia)
      
      // Switch tab back to gallery
      setActiveTab('gallery')
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Upload gagal'
      setUploadError(msg)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Filter items in memory based on search & format type
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      (item.altText || '').toLowerCase().includes(search.toLowerCase()) || 
      (item.caption || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.url.split('/').pop() || '').toLowerCase().includes(search.toLowerCase())
      
    if (formatFilter === 'all') return matchesSearch
    
    const format = item.originalFormat.toLowerCase()
    if (formatFilter === 'pdf') return matchesSearch && format === 'pdf'
    if (formatFilter === 'image') return matchesSearch && ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(format)
    
    return matchesSearch
  })

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full h-full md:h-[90vh] md:max-w-6xl bg-white dark:bg-slate-900 rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-brand-black dark:text-white"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 shrink-0 bg-gray-50 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white/10 flex items-center justify-center shadow">
                <ImageIcon size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-md font-black tracking-tight">Galeri & Pustaka Media</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pilih aset editorial Anda</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('gallery')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                  activeTab === 'gallery'
                    ? "bg-white dark:bg-slate-800 shadow text-brand-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-white"
                )}
              >
                Pustaka Media
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                  activeTab === 'upload'
                    ? "bg-white dark:bg-slate-800 shadow text-brand-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-white"
                )}
              >
                Unggah Baru
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-brand-red"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Main Area */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {activeTab === 'gallery' ? (
              <>
                {/* Left Area: Filter + Grid */}
                <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
                  {/* Toolbar */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
                    <div className="relative w-full sm:w-72">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Cari alt text, caption, nama file..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-transparent rounded-xl text-xs outline-none focus:border-brand-red transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {/* Format Filter */}
                      <div className="flex bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg">
                        {[
                          { key: 'all', label: 'Semua' },
                          { key: 'image', label: 'Gambar' },
                          { key: 'pdf', label: 'PDF' }
                        ].map(f => (
                          <button
                            key={f.key}
                            onClick={() => setFormatFilter(f.key)}
                            className={cn(
                              "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                              formatFilter === f.key
                                ? "bg-white dark:bg-slate-800 text-brand-black dark:text-white shadow-sm"
                                : "text-gray-400 dark:text-gray-500 hover:text-brand-black dark:hover:text-white"
                            )}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={refresh} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-brand-black dark:hover:text-white"
                        title="Segarkan data"
                      >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>

                  {/* Grid Container */}
                  <div className="flex-1 overflow-y-auto pr-1">
                    {loading && items.length === 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {Array(15).fill(0).map((_, i) => (
                          <div key={i} className="aspect-square rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
                        ))}
                      </div>
                    ) : filteredItems.length === 0 ? (
                      <div className="py-24 text-center">
                        <ImageIcon size={38} className="mx-auto mb-3 text-gray-200 dark:text-white/5 animate-bounce" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tidak ada media ditemukan</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {filteredItems.map((m) => {
                            const isPdf = m.originalFormat === 'pdf'
                            const isSelected = allowMultiple 
                              ? selectedMulti.some(i => i.id === m.id)
                              : selectedSingle?.id === m.id

                            return (
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                key={m.id}
                                onClick={() => handleSelectMedia(m)}
                                className={cn(
                                  "group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 cursor-pointer border-2 transition-all select-none shadow-sm flex items-center justify-center",
                                  isSelected 
                                    ? "border-brand-red ring-4 ring-brand-red/15 scale-[0.98]" 
                                    : "border-transparent hover:border-brand-red/45"
                                )}
                              >
                                {isPdf ? (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-gray-400 dark:text-gray-500">
                                    <FileText size={32} className="mb-2 text-red-500" />
                                    <span className="text-[9px] font-bold truncate max-w-full text-center">
                                      {m.url.split('/').pop()}
                                    </span>
                                  </div>
                                ) : (
                                  <img 
                                    src={m.thumbUrl} 
                                    alt={m.altText || ''} 
                                    className="w-full h-full object-cover" 
                                    loading="lazy"
                                  />
                                )}
                                
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                                  <span className="text-[8px] font-bold uppercase truncate">
                                    {m.width} × {m.height}
                                  </span>
                                  <span className="text-[7px] text-gray-300 font-bold uppercase">
                                    {(m.size/1024).toFixed(1)} KB
                                  </span>
                                </div>
                                
                                {isSelected && (
                                  <div className="absolute top-2 right-2 w-5 h-5 bg-brand-red rounded-full flex items-center justify-center text-white shadow-md animate-scale-up">
                                    <Check size={11} className="stroke-[3]" />
                                  </div>
                                )}
                              </motion.div>
                            )
                          })}
                        </div>

                        {/* Paginate Load More */}
                        {hasMore && (
                          <div className="flex justify-center pt-2">
                            <button
                              onClick={loadMore}
                              disabled={loading}
                              className="px-6 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                              {loading ? (
                                <>
                                  <RefreshCw size={12} className="animate-spin" /> Memuat...
                                </>
                              ) : (
                                'Tampilkan Lebih Banyak'
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Area: Metadata Preview Sidebar (Only shows if an item is selected/active) */}
                <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-gray-100 dark:border-white/5 flex flex-col bg-gray-50/50 dark:bg-slate-900 shrink-0">
                  {selectedSingle ? (
                    <div className="flex-1 flex flex-col overflow-y-auto">
                      <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 shrink-0 bg-white dark:bg-slate-900">
                        <ImageIcon size={14} className="text-brand-red" />
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider">Detail Item Terpilih</h4>
                          {allowMultiple && selectedMulti.length > 0 && (
                            <p className="text-[8px] font-bold text-brand-red uppercase mt-0.5">
                              {selectedMulti.length} gambar dipilih
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Thumbnail View */}
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-inner">
                          {selectedSingle.originalFormat === 'pdf' ? (
                            <FileText size={42} className="text-red-500" />
                          ) : (
                            <img 
                              src={selectedSingle.thumbUrl} 
                              alt="Preview selection" 
                              className="max-w-full max-h-full object-contain" 
                            />
                          )}
                        </div>

                        {/* File details list */}
                        <div className="space-y-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                          <div className="flex justify-between">
                            <span className="font-bold">Format:</span>
                            <span className="font-mono text-brand-black dark:text-white uppercase">
                              {selectedSingle.originalFormat}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Dimensi:</span>
                            <span className="font-mono text-brand-black dark:text-white">
                              {selectedSingle.width} × {selectedSingle.height} px
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Ukuran:</span>
                            <span className="font-mono text-brand-black dark:text-white">
                              {(selectedSingle.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <div className="flex flex-col pt-1">
                            <span className="font-bold mb-0.5">URL:</span>
                            <input 
                              type="text" 
                              readOnly 
                              value={selectedSingle.url}
                              onClick={(e) => (e.target as HTMLInputElement).select()}
                              className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 px-2 py-1 rounded font-mono text-[8px] outline-none cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Metadata inputs */}
                        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-white/5">
                          <div>
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Alt Text (SEO)</label>
                            <input 
                              type="text" 
                              value={altText}
                              onChange={(e) => setAltText(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg text-[10px] outline-none focus:border-brand-red transition-all"
                              placeholder="Deskripsi singkat gambar..."
                            />
                          </div>
                          
                          <div>
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Keterangan / Caption</label>
                            <textarea 
                              value={caption}
                              onChange={(e) => setCaption(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg text-[10px] outline-none focus:border-brand-red transition-all h-12 resize-none"
                              placeholder="Caption di bawah foto..."
                            />
                          </div>
                          
                          <div>
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Kredit / Sumber</label>
                            <input 
                              type="text" 
                              value={credit}
                              onChange={(e) => setCredit(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg text-[10px] outline-none focus:border-brand-red transition-all"
                              placeholder="Contoh: Reuters / John"
                            />
                          </div>

                          <button
                            onClick={handleUpdateMetadata}
                            disabled={savingMetadata}
                            className="w-full py-2 bg-gray-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {savingMetadata ? <RefreshCw size={10} className="animate-spin" /> : <Check size={11} />}
                            Simpan Metadata
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400 dark:text-gray-500">
                      <AlertTriangle size={24} className="mb-2 text-gray-300 dark:text-white/5" />
                      <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                        Pilih salah satu media<br/>untuk melihat detail & metadata
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Upload Tab Layout */
              <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-50/50 dark:bg-slate-900">
                <div className="max-w-md w-full text-center space-y-6">
                  <div className="p-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-800 flex flex-col items-center gap-4 group hover:border-brand-red dark:hover:border-brand-red transition-all duration-300">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-brand-red group-hover:scale-110 transition-all shadow-sm">
                      <Upload size={22} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Pilih atau Seret Berkas Anda</h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                        JPG, PNG, WebP, GIF, atau PDF (Maks. 10MB)
                      </p>
                    </div>
                    
                    <label className={cn(
                      "px-5 py-2.5 bg-brand-red text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow shadow-brand-red/20 cursor-pointer flex items-center gap-2",
                      uploading && "opacity-50 pointer-events-none"
                    )}>
                      {uploading ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                      Pilih Berkas
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                        accept="image/*,application/pdf" 
                      />
                    </label>
                  </div>

                  {/* Progress Indicator */}
                  {uploading && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                        <span>Mengunggah Berkas...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-red h-full rounded-full transition-all duration-200" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Alert */}
                  {uploadError && (
                    <div className="bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-100 dark:border-red-900/10 p-3 rounded-xl flex items-center gap-2 text-xs text-left">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span className="font-semibold">{uploadError}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Action Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-900 flex justify-between items-center shrink-0">
            <div>
              {allowMultiple ? (
                selectedMulti.length > 0 ? (
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Terpilih <span className="text-brand-red font-black">{selectedMulti.length}</span> media
                  </p>
                ) : (
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Pilih media yang ingin dimasukkan</p>
                )
              ) : (
                selectedSingle ? (
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Akan menggunakan <span className="text-brand-red font-black">1</span> media
                  </p>
                ) : (
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Pilih media yang ingin digunakan</p>
                )
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Batal
              </button>
              
              <button
                onClick={handleConfirmSelection}
                disabled={allowMultiple ? selectedMulti.length === 0 : !selectedSingle}
                className="px-6 py-2.5 bg-brand-red text-white hover:bg-red-700 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-400 disabled:shadow-none rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/20 flex items-center gap-1.5"
              >
                Masukkan Gambar <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
