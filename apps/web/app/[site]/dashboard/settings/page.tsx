'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { 
  Save, 
  Plus, 
  X, 
  Globe, 
  Settings as SettingsIcon, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Mail, 
  ShieldAlert, 
  BookOpen, 
  Flame, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Palette, 
  Sparkles, 
  Lock,
  Phone,
  MapPin,
  Share2
} from 'lucide-react'
import { api } from '../../../../lib/api'

type SettingsTab = 'basic' | 'contact' | 'google' | 'info' | 'trending'

export default function SettingsPage() {
  const { site } = useParams() as { site: string }
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [settings, setSettings] = useState({
    name: '',
    domain: '',
    description: '',
    logoUrl: '',
    footerText: '',
    address: '',
    contactEmail: '',
    phone: '',
    aboutUs: '',
    codeOfEthics: '',
    editorial: '',
    advertising: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: ''
    },
    appearance: {
      primaryColor: '#e11d48',
      editorialPdfUrl: ''
    },
    trendingTopics: [] as string[],
    googleIndexingConfig: {
      clientEmail: '',
      privateKey: '',
      isActive: false
    }
  })
  
  // State manajemen lanjutan
  const [originalSettings, setOriginalSettings] = useState<typeof settings | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTab>('basic')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)

  // Refs untuk Auto-Expanding Textarea
  const aboutUsRef = useRef<HTMLTextAreaElement>(null)
  const codeOfEthicsRef = useRef<HTMLTextAreaElement>(null)
  const editorialRef = useRef<HTMLTextAreaElement>(null)
  const advertisingRef = useRef<HTMLTextAreaElement>(null)

  // Refs untuk Uploader File
  const logoInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  // Efek Auto-Expanding Textarea
  useEffect(() => {
    const adjust = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
      if (ref.current) {
        ref.current.style.height = 'auto'
        ref.current.style.height = `${ref.current.scrollHeight}px`
      }
    }
    // Diberi sedikit delay agar rendering font/DOM selesai sempurna
    const timer = setTimeout(() => {
      adjust(aboutUsRef)
      adjust(codeOfEthicsRef)
      adjust(editorialRef)
      adjust(advertisingRef)
    }, 50)
    return () => clearTimeout(timer)
  }, [settings.aboutUs, settings.codeOfEthics, settings.editorial, settings.advertising, activeTab])

  // Deteksi perubahan form (Dirty State Checker)
  useEffect(() => {
    if (!originalSettings) return
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings)
    setIsDirty(changed)
  }, [settings, originalSettings])

  // Peringatan sebelum keluar halaman jika ada perubahan belum disimpan (Unsaved Changes Warning)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = 'Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman ini?'
        return e.returnValue
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Validasi domain & bersihkan otomatis
  const cleanDomain = (val: string) => {
    let clean = val.trim().toLowerCase()
    clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '')
    clean = clean.replace(/\/$/, '')
    return clean
  }

  // Validasi email
  const isValidEmail = (email: string) => {
    if (!email) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Analisis kontras warna (WCAG AA Helper)
  const getContrastAdvice = (hexColor: string) => {
    const hex = hexColor.replace('#', '')
    if (hex.length !== 6) return null
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    
    const a = [r, g, b].map(v => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    const luminance = 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
    
    // Hitung kontras rasio dengan teks putih (#FFFFFF)
    const ratio = 1.05 / (luminance + 0.05)
    const isSafe = ratio >= 3.0 // 3:1 WCAG AA standar untuk teks tebal/judul
    
    return {
      isSafe,
      ratio: ratio.toFixed(1),
      textAdvice: isSafe 
        ? 'Aman untuk Teks Putih (Kontras Optimal)' 
        : 'Terlahu Terang! Teks putih di portal depan akan sulit dibaca.'
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post('/media/upload?type=logo', formData)
      setSettings({ ...settings, logoUrl: data.data.url })
    } catch (err: any) {
      console.error('Failed to upload logo', err)
      alert(err.response?.data?.error?.message || 'Gagal mengunggah logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/sites/settings')
      if (data.success) {
        const mappedSettings = {
          name: data.data.name || '',
          domain: data.data.domain || '',
          description: data.data.description || '',
          logoUrl: data.data.logoUrl || '',
          footerText: data.data.footerText || '',
          address: data.data.address || '',
          contactEmail: data.data.contactEmail || '',
          phone: data.data.phone || '',
          aboutUs: data.data.aboutUs || '',
          codeOfEthics: data.data.codeOfEthics || '',
          editorial: data.data.editorial || '',
          advertising: data.data.advertising || '',
          socialLinks: {
            facebook: data.data.socialLinks?.facebook || '',
            twitter: data.data.socialLinks?.twitter || '',
            instagram: data.data.socialLinks?.instagram || '',
            youtube: data.data.socialLinks?.youtube || ''
          },
          appearance: {
            primaryColor: data.data.appearance?.primaryColor || '#e11d48',
            editorialPdfUrl: data.data.appearance?.editorialPdfUrl || ''
          },
          trendingTopics: data.data.trendingTopics || [],
          googleIndexingConfig: data.data.googleIndexingConfig || { clientEmail: '', privateKey: '', isActive: false }
        }
        setSettings(mappedSettings)
        setOriginalSettings(JSON.parse(JSON.stringify(mappedSettings)))
      }
    } catch (err) {
      console.error('Failed to fetch settings', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [site])

  const handleSave = async () => {
    // Jalankan validasi domain sebelum kirim
    const cleanedDomain = cleanDomain(settings.domain)
    const finalSettings = {
      ...settings,
      domain: cleanedDomain,
      contactEmail: settings.contactEmail.trim()
    }

    if (!isValidEmail(finalSettings.contactEmail)) {
      setMessage({ type: 'error', text: 'Format email kontak tidak valid!' })
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      const { data } = await api.patch('/sites/settings', finalSettings)
      if (data.success) {
        setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' })
        setSettings(finalSettings)
        setOriginalSettings(JSON.parse(JSON.stringify(finalSettings)))
        setIsDirty(false)
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Gagal menyimpan pengaturan' })
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Terjadi kesalahan koneksi'
      setMessage({ type: 'error', text: msg })
    } finally {
      setSaving(false)
    }
  }

  const addTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTag.trim()) return
    if (settings.trendingTopics.includes(newTag.trim())) {
      setNewTag('')
      return
    }
    setSettings({
      ...settings,
      trendingTopics: [...settings.trendingTopics, newTag.trim()]
    })
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    setSettings({
      ...settings,
      trendingTopics: settings.trendingTopics.filter(t => t !== tagToRemove)
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-brand-red/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-brand-red rounded-full animate-spin"></div>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Menyinkronkan Konfigurasi...</p>
      </div>
    )
  }

  const tabs = [
    { id: 'basic', label: 'Identitas & Visual', icon: Globe, desc: 'Nama portal, domain, logo, & skema warna utama' },
    { id: 'contact', label: 'Kontak & Sosial', icon: Mail, desc: 'Alamat redaksi, hotline, & link media sosial resmi' },
    { id: 'google', label: 'Google Search API', icon: ShieldAlert, desc: 'Konfigurasi otomatis indeks artikel Google' },
    { id: 'info', label: 'Halaman Informasi', icon: BookOpen, desc: 'Teks Tentang Kami, Kode Etik, Redaksi, & Iklan' },
    { id: 'trending', label: 'Topik Hangat', icon: Flame, desc: 'Manajemen kata kunci trending di navigasi depan' }
  ] as const

  const contrastAdvice = getContrastAdvice(settings.appearance.primaryColor)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-24">
      
      {/* HEADER UTAMA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-red/10 rounded-xl">
              <SettingsIcon size={20} className="text-brand-red animate-pulse" />
            </div>
            <h1 className="text-2xl font-serif font-black tracking-tight text-brand-black dark:text-white uppercase">
              Konfigurasi Sistem Portal
            </h1>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            Manajemen Identitas Cabang Regional <span className="text-brand-red font-black">#{site}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              Ada Perubahan Belum Disimpan
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-black dark:hover:bg-white dark:hover:text-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl shadow-lg shadow-brand-red/20 disabled:opacity-50"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {saving ? 'Sedang Menyimpan...' : 'Simpan Konfigurasi'}
          </button>
        </div>
      </div>

      {/* NOTIFIKASI STATUS */}
      {message && (
        <div className={`p-4 flex items-center gap-3 rounded-2xl border animate-in slide-in-from-top-4 duration-300 ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' 
            : 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-bold uppercase tracking-widest">{message.text}</span>
        </div>
      )}

      {/* TATA LETAK MODULAR: TAB SISI KIRI & KONTEN KANAN */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* TAB SISI KIRI */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-white/5 space-y-1 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 mb-3">Kategori Pengaturan</p>
            {tabs.map((t) => {
              const Icon = t.icon
              const isActive = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setMessage(null)
                    setActiveTab(t.id)
                  }}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-brand-red text-white shadow-lg shadow-brand-red/10' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} className={`mt-0.5 ${isActive ? 'text-white' : 'text-brand-red'}`} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">{t.label}</p>
                    <p className={`text-[9px] mt-0.5 line-clamp-1 ${isActive ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                      {t.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="hidden lg:block bg-brand-black dark:bg-slate-950 p-6 text-white rounded-2xl border border-white/5 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-brand-red animate-pulse" />
              <h4 className="text-[10px] font-black uppercase tracking-wider">Tips Search Engine</h4>
            </div>
            <p className="text-[9.5px] leading-relaxed text-gray-400 font-medium">
              Mesin pencari seperti Google menyukai deskripsi situs yang mengandung kata kunci geografis daerah Anda. Tulis deskripsi SEO secara singkat dan padat untuk menaikkan rasio klik pembaca lokal.
            </p>
          </div>
        </div>

        {/* AREA PANEL KONTEN KANAN */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900/20 backdrop-blur-md p-8 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm min-h-[500px]">
            
            {/* ==================== TAB 1: IDENTITAS & VISUAL ==================== */}
            {activeTab === 'basic' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-black dark:text-white flex items-center gap-2">
                    <Globe size={16} className="text-brand-red" /> Identitas & Branding Utama
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">Tentukan jati diri digital utama untuk portal berita regional Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Nama Situs / Portal Resmi</label>
                    <input 
                      type="text" 
                      value={settings.name}
                      onChange={(e) => setSettings({...settings, name: e.target.value})}
                      placeholder="Contoh: BeritaKarya Bandung"
                      className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Domain Publik (URL)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={settings.domain}
                        onChange={(e) => setSettings({...settings, domain: e.target.value})}
                        onBlur={(e) => setSettings({...settings, domain: cleanDomain(e.target.value)})}
                        placeholder="bandung.beritakarya.co"
                        className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl pl-4 pr-12 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold"
                      />
                      <span className="absolute right-3 top-3.5 text-[9px] font-black text-brand-red uppercase tracking-widest">LIVE</span>
                    </div>
                  </div>

                  {/* LIVE GOOGLE SERP PREVIEW EMULATOR */}
                  <div className="md:col-span-2 p-6 bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Pratinjau Hasil Pencarian Google (Live SERP Preview)</h4>
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">SEO OPTIMAL</span>
                    </div>
                    <div className="font-sans space-y-1">
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate">
                        <span>https://{settings.domain || 'bandung.beritakarya.co'}</span>
                        <span className="text-[9px] text-gray-400">› pusat</span>
                      </div>
                      <div className="text-base text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer leading-snug line-clamp-1">
                        {settings.name || 'BeritaKarya Bandung - Portal Berita Regional Terpercaya'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {settings.description || 'Tulis deskripsi situs di bawah untuk melihat simulasi tampilan ringkasan berita portal Anda di halaman pencarian Google.'}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center justify-between">
                      <span>Deskripsi Situs (SEO & Meta Description)</span>
                      <span className={`${settings.description.length > 160 ? 'text-rose-500' : 'text-gray-400'} text-[9px] font-bold`}>
                        {settings.description.length} / 160 Karakter rekomendasi
                      </span>
                    </label>
                    <textarea 
                      value={settings.description}
                      onChange={(e) => setSettings({...settings, description: e.target.value})}
                      placeholder="Tulis ringkasan tentang jenis berita, fokus daerah, dan komitmen portal berita regional Anda..."
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold resize-none"
                    />
                  </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-white/5 my-4"></div>

                {/* BRANDING LOGO & COLOR */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Identitas Visual Logo Portal</label>
                    
                    <div className="flex flex-col gap-4">
                      {settings.logoUrl ? (
                        <div className="w-full h-32 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center p-4 relative group transition-all">
                          <img src={settings.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                          <button 
                            type="button"
                            onClick={() => setSettings({...settings, logoUrl: ''})}
                            className="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center p-4 text-center">
                          <Palette className="w-8 h-8 text-gray-400 mb-2 animate-bounce" />
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Belum ada logo terunggah</p>
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={settings.logoUrl}
                          onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                          placeholder="https://.../logo.png"
                          className="flex-1 bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold"
                        />
                        <div className="relative">
                          <input 
                            ref={logoInputRef}
                            type="file" 
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <button 
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={uploadingLogo}
                            className="h-full bg-brand-black dark:bg-white/10 hover:bg-brand-red text-white px-6 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center gap-2 cursor-pointer"
                          >
                            {uploadingLogo ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                            {uploadingLogo ? 'Unggah...' : 'Upload'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Warna Aksen Portal (Brand Theme)</label>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-12 h-11 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 flex-shrink-0">
                          <input 
                            type="color" 
                            value={settings.appearance.primaryColor}
                            onChange={(e) => setSettings({
                              ...settings, 
                              appearance: { ...settings.appearance, primaryColor: e.target.value }
                            })}
                            className="w-full h-full p-0 border-0 cursor-pointer scale-125"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={settings.appearance.primaryColor}
                          onChange={(e) => setSettings({
                            ...settings, 
                            appearance: { ...settings.appearance, primaryColor: e.target.value }
                          })}
                          className="flex-1 bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-mono font-bold"
                        />
                      </div>

                      {contrastAdvice && (
                        <div className={`p-4 rounded-xl border flex items-start gap-2.5 ${
                          contrastAdvice.isSafe 
                            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-amber-500/5 border-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                          <div className="text-[9px] font-black uppercase tracking-wider space-y-0.5">
                            <p>Rasio Kontras: {contrastAdvice.ratio}:1 (Standard AA)</p>
                            <p className="opacity-80 leading-normal">{contrastAdvice.textAdvice}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 2: KONTAK & SOSIAL ==================== */}
            {activeTab === 'contact' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-black dark:text-white flex items-center gap-2">
                    <Mail size={16} className="text-brand-red" /> Kontak & Saluran Sosial
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">Kelola alamat redaksi, email keluhan, hotline bantuan, dan akun media sosial resmi portal.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin size={12} className="text-brand-red" /> Alamat Fisik Kantor Redaksi
                    </label>
                    <input 
                      type="text" 
                      value={settings.address}
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                      placeholder="Contoh: Gedung BeritaKarya Lt. 3, Jl. Asia Afrika No. 45, Bandung"
                      className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center justify-between">
                        <span className="flex items-center gap-1"><Mail size={12} className="text-brand-red" /> Email Kontak Resmi</span>
                        {!isValidEmail(settings.contactEmail) && (
                          <span className="text-rose-500 text-[8px] font-black">Format Email Tidak Valid!</span>
                        )}
                      </label>
                      <input 
                        type="email" 
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                        placeholder="redaksi.bandung@beritakarya.co"
                        className={`w-full bg-slate-50 dark:bg-slate-950/40 border rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none transition-all font-semibold ${
                          isValidEmail(settings.contactEmail) 
                            ? 'border-gray-100 dark:border-white/5 focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20' 
                            : 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Phone size={12} className="text-brand-red" /> Nomor Telepon / WhatsApp Redaksi
                      </label>
                      <input 
                        type="text" 
                        value={settings.phone}
                        onChange={(e) => setSettings({...settings, phone: e.target.value})}
                        placeholder="+62 812-3456-7890"
                        className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-gray-100 dark:bg-white/5 my-4"></div>

                  {/* SOCIAL MEDIA CHANNELS */}
                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Share2 size={12} className="text-brand-red" /> Saluran Media Sosial Resmi
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(settings.socialLinks).map((key) => (
                        <div key={key} className="space-y-1.5">
                          <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 capitalize">{key} URL</label>
                          <input 
                            type="text" 
                            value={(settings.socialLinks as any)[key]}
                            onChange={(e) => setSettings({
                              ...settings, 
                              socialLinks: { ...settings.socialLinks, [key]: e.target.value }
                            })}
                            placeholder={`https://${key}.com/profile-anda`}
                            className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-2 text-[10px] text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-gray-100 dark:bg-white/5 my-4"></div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Teks Footer Hak Cipta (Copyright Text)</label>
                    <input 
                      type="text" 
                      value={settings.footerText}
                      onChange={(e) => setSettings({...settings, footerText: e.target.value})}
                      placeholder="© 2026 BeritaKarya Bandung. Hak cipta dilindungi undang-undang."
                      className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 3: GOOGLE SEARCH INDEXING API ==================== */}
            {activeTab === 'google' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-brand-black dark:text-white flex items-center gap-2">
                      <ShieldAlert size={16} className="text-brand-red" /> Google Search Indexing API
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                      Sinkronisasi instan artikel Anda ke mesin pencari Google begitu tombol publikasi ditekan.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setSettings({
                      ...settings,
                      googleIndexingConfig: {
                        ...settings.googleIndexingConfig,
                        isActive: !settings.googleIndexingConfig.isActive
                      }
                    })}
                    className={`px-5 py-2.5 text-[9px] font-black uppercase tracking-widest border rounded-xl transition-all shadow-md ${
                      settings.googleIndexingConfig.isActive
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/10'
                        : 'bg-gray-100 border-gray-200 text-gray-400 dark:bg-slate-950/40 dark:border-white/5'
                    }`}
                  >
                    {settings.googleIndexingConfig.isActive ? '🔥 SINKRONISASI AKTIF' : '⏹️ SINKRONISASI NONAKTIF'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Google Service Account Email</label>
                    <input 
                      type="text" 
                      value={settings.googleIndexingConfig.clientEmail}
                      onChange={(e) => setSettings({
                        ...settings,
                        googleIndexingConfig: {
                          ...settings.googleIndexingConfig,
                          clientEmail: e.target.value
                        }
                      })}
                      placeholder="nama-akun@id-project.iam.gserviceaccount.com"
                      className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Private Key (PEM Format)</label>
                      <button
                        type="button"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="text-[9px] font-black text-brand-red hover:text-brand-black dark:hover:text-white uppercase tracking-widest flex items-center gap-1"
                      >
                        {showPrivateKey ? <EyeOff size={10} /> : <Eye size={10} />}
                        {showPrivateKey ? 'Sembunyikan Kunci' : 'Tampilkan Kunci'}
                      </button>
                    </div>
                    
                    <div className="relative">
                      {showPrivateKey ? (
                        <textarea 
                          value={settings.googleIndexingConfig.privateKey}
                          onChange={(e) => setSettings({
                            ...settings,
                            googleIndexingConfig: {
                              ...settings.googleIndexingConfig,
                              privateKey: e.target.value
                            }
                          })}
                          placeholder="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7...\n-----END PRIVATE KEY-----"
                          rows={5}
                          className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-[10px] text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-mono resize-none leading-relaxed"
                        />
                      ) : (
                        <div className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-8 text-center text-gray-400 font-mono text-[10px] relative overflow-hidden flex flex-col items-center justify-center min-h-[140px]">
                          <Lock size={20} className="text-gray-400 dark:text-gray-500 mb-2 animate-bounce" />
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Kunci Privat Disensor untuk Keamanan</p>
                          <p className="text-[8px] text-gray-400/70 dark:text-gray-500/70 mt-1 uppercase tracking-widest">Klik &quot;Tampilkan Kunci&quot; di atas untuk melihat atau mengedit kunci privat</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PREMIUM INTEGRATION GUIDE */}
                  <div className="p-6 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/10 rounded-2xl">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertCircle size={14} className="text-amber-600 animate-pulse" /> Panduan Mutlak Pemasangan Google Search Console:
                    </h4>
                    <ol className="text-[9px] text-amber-800/80 dark:text-amber-400/80 space-y-2 list-decimal pl-4 mt-3 font-bold uppercase tracking-wider leading-relaxed">
                      <li>
                        Buka <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-brand-red underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink size={8} /></a>, aktifkan **Indexing API** pada proyek Anda, buat *Service Account*, lalu unduh berkas **JSON Private Key**.
                      </li>
                      <li>
                        Salin nilai `client_email` dan `private_key` dari berkas JSON tersebut ke dalam isian di atas.
                      </li>
                      <li>
                        <span className="text-brand-red font-black">LANGKAH WAJIB:</span> Tambahkan alamat **Service Account Email** di atas sebagai anggota berstatus **Pemilik (Owner)** di dalam dashboard **Google Search Console** website Anda agar Google memberi izin pengajuan indeks otomatis.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 4: HALAMAN INFORMASI PORTAL ==================== */}
            {activeTab === 'info' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-black dark:text-white flex items-center gap-2">
                    <BookOpen size={16} className="text-brand-red" /> Halaman Informasi & Legalitas Portal
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                    Sesuaikan halaman legalitas yang muncul di footer portal utama untuk memenuhi regulasi Dewan Pers.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Halaman: Tentang Kami (Visi & Misi)</label>
                    <textarea 
                      ref={aboutUsRef}
                      value={settings.aboutUs}
                      onChange={(e) => setSettings({...settings, aboutUs: e.target.value})}
                      placeholder="Tuliskan sejarah berdirinya, visi, misi, dan komitmen portal regional Anda di sini..."
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold resize-none overflow-hidden"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Halaman: Kode Etik Internal</label>
                    <textarea 
                      ref={codeOfEthicsRef}
                      value={settings.codeOfEthics}
                      onChange={(e) => setSettings({...settings, codeOfEthics: e.target.value})}
                      placeholder="Tuliskan aturan jurnalisme independen, etika peliputan, dan komitmen profesionalitas redaksi Anda..."
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold resize-none overflow-hidden"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        Halaman: Susunan Redaksi
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Apakah Anda yakin ingin memuat format Dewan Pers standar? Teks susunan redaksi saat ini akan ditimpa.')) {
                            setSettings({
                              ...settings,
                              editorial: `PT SABDA KARYA MEDIA (BERITAKARYA.CO)\nSK MENKUMHAM: AHU-0012345.AH.01.01.TAHUN 2026\n\nSUSUNAN REDAKSI & TATA KELOLA PERUSAHAAN\n\nPenerbit / Badan Hukum:\nPT Sabda Karya Media\n\nDewan Pembina / Penasihat:\n- [Nama Dewan Pembina]\n\nPemimpin Umum / Direktur Utama:\n- [Nama Pemimpin Umum]\n\nPemimpin Redaksi / Penanggung Jawab:\n- [Nama Pemimpin Redaksi] (Sertifikat Wartawan Utama No: [Nomor])\n\nRedaktur Pelaksana (Redpel):\n- [Nama Redaktur Pelaksana]\n\nRedaktur Senior & Editor:\n- [Nama Editor 1]\n- [Nama Editor 2]\n\nReporter Lapangan:\n- [Nama Reporter 1]\n- [Nama Reporter 2]\n- [Nama Reporter 3]\n\nDesain Grafis, IT & Multimedia:\n- [Nama Tim IT/Desain]\n\nAlamat Kantor Redaksi Pusat:\nGedung BeritaKarya, Lt. 3, Jl. Asia Afrika No. 45, Bandung, Jawa Barat\nEmail: redaksi@beritakarya.co | Telp: +62 812-3456-7890\n\nPenasihat Hukum:\n- [Nama Advokat/LBH], S.H., M.H.`
                            })
                          }
                        }}
                        className="text-[9px] font-black text-brand-red hover:text-brand-black dark:hover:text-white uppercase tracking-widest flex items-center gap-1 bg-brand-red/5 px-2.5 py-1.5 rounded-lg border border-brand-red/10 transition-all shadow-sm animate-pulse"
                      >
                        <Sparkles size={10} className="text-brand-red" /> Gunakan Template Dewan Pers
                      </button>
                    </div>
                    
                    <textarea 
                      ref={editorialRef}
                      value={settings.editorial}
                      onChange={(e) => setSettings({...settings, editorial: e.target.value})}
                      placeholder="Daftar nama Pemimpin Redaksi, Editor, Reporter, Kontributor, Dewan Penasehat, beserta peran masing-masing..."
                      rows={5}
                      className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold resize-none overflow-hidden"
                    />

                    {/* PDF Uploader Slot */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/30 border border-gray-100 dark:border-white/5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          Lampiran Berkas SK Redaksi Resmi (PDF)
                        </span>
                        {settings.appearance.editorialPdfUrl ? (
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                            PDF Terunggah
                          </span>
                        ) : (
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                            Belum Ada PDF
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={settings.appearance.editorialPdfUrl || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            appearance: {
                              ...settings.appearance,
                              editorialPdfUrl: e.target.value
                            }
                          })}
                          placeholder="https://.../sk-redaksi.pdf"
                          className="flex-1 bg-white dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-lg px-3 py-2 text-[10px] text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold"
                        />
                        
                        <div className="relative">
                          <input 
                            ref={pdfInputRef}
                            type="file" 
                            accept="application/pdf"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              
                              setUploadingPdf(true)
                              const formData = new FormData()
                              formData.append('file', file)
                              
                              try {
                                const { data } = await api.post('/media/upload', formData)
                                setSettings({
                                  ...settings,
                                  appearance: {
                                    ...settings.appearance,
                                    editorialPdfUrl: data.data.url
                                  }
                                })
                              } catch (err: any) {
                                console.error('Failed to upload PDF', err)
                                alert(err.response?.data?.error?.message || 'Gagal mengunggah file PDF')
                              } finally {
                                setUploadingPdf(false)
                              }
                            }}
                            className="hidden"
                          />
                          <button 
                            type="button"
                            onClick={() => pdfInputRef.current?.click()}
                            disabled={uploadingPdf}
                            className="h-full bg-brand-black dark:bg-white/10 hover:bg-brand-red text-white px-4 py-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg flex items-center gap-1.5 cursor-pointer"
                          >
                            {uploadingPdf ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                            {uploadingPdf ? 'Mengunggah...' : 'Upload PDF'}
                          </button>
                        </div>
                      </div>
                      
                      {settings.appearance.editorialPdfUrl && (
                        <div className="flex items-center gap-2">
                          <a 
                            href={settings.appearance.editorialPdfUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[9px] font-black text-brand-red hover:underline flex items-center gap-1 uppercase tracking-widest"
                          >
                            <ExternalLink size={10} /> Buka / Uji Berkas PDF SK Redaksi
                          </a>
                          <span className="text-gray-300 dark:text-white/10">|</span>
                          <button
                            type="button"
                            onClick={() => setSettings({
                              ...settings,
                              appearance: {
                                ...settings.appearance,
                                editorialPdfUrl: ''
                              }
                            })}
                            className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest"
                          >
                            Hapus Lampiran
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Halaman: Panduan & Informasi Periklanan</label>
                    <textarea 
                      ref={advertisingRef}
                      value={settings.advertising}
                      onChange={(e) => setSettings({...settings, advertising: e.target.value})}
                      placeholder="Tuliskan ketentuan tarif iklan, jenis space iklan yang tersedia (banner/advetorial), beserta nomor kontak iklan khusus..."
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold resize-none overflow-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 5: TOPIK HANGAT ==================== */}
            {activeTab === 'trending' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-brand-black dark:text-white flex items-center gap-2">
                      <Flame size={16} className="text-brand-red animate-bounce" /> Manajemen Topik Hangat (Trending Tags)
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                      Tentukan tag khusus yang disematkan langsung pada bar navigasi depan untuk kemudahan pencarian artikel viral.
                    </p>
                  </div>
                  <span className="text-[9px] font-black text-white bg-brand-red px-3 py-1 rounded-full uppercase tracking-widest">
                    {settings.trendingTopics.length} Topik Aktif
                  </span>
                </div>

                <form onSubmit={addTag} className="flex gap-3">
                  <input 
                    type="text" 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Tambah topik baru (contoh: Pilkada 2026, Gempa Jabar, Persib Juara)"
                    className="flex-1 bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-brand-black dark:text-white outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 transition-all font-semibold"
                  />
                  <button 
                    type="submit"
                    className="bg-brand-black dark:bg-white/10 hover:bg-brand-red text-white px-5 py-3 transition-all rounded-xl flex items-center gap-1 shadow-md hover:shadow-lg"
                  >
                    <Plus size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline">Tambah</span>
                  </button>
                </form>

                <div className="flex flex-wrap gap-3">
                  {settings.trendingTopics.length > 0 ? (
                    settings.trendingTopics.map((tag) => (
                      <div 
                        key={tag}
                        className="group flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950/40 border border-gray-100 dark:border-white/5 px-4 py-2.5 rounded-xl transition-all hover:border-brand-red/40 hover:shadow-sm"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-black dark:text-white">#{tag}</span>
                        <button 
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-gray-400 hover:text-brand-red transition-colors duration-200"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-12 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
                      <Flame size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Belum ada topik khusus daerah.</p>
                      <p className="text-[8px] text-gray-400/80 uppercase tracking-widest mt-1">Situs depan akan secara otomatis menggunakan topik default pusat.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BAR: TAMPIL JIKA ADA PERUBAHAN */}
      {isDirty && (
        <div className="fixed bottom-8 right-8 z-40 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 bg-brand-red hover:bg-brand-black text-white px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-brand-red/40 disabled:opacity-50 rounded-2xl border border-white/10"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Sedang Menyimpan...' : 'Simpan Seluruh Perubahan'}
          </button>
        </div>
      )}

    </div>
  )
}
