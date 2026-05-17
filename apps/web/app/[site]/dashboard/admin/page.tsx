'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '../../../../lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Settings, 
  Trash2, 
  Edit3, 
  Globe, 
  Mail, 
  Users, 
  FileText, 
  FolderOpen, 
  AlertTriangle,
  X,
  CheckCircle2,
  Lock
} from 'lucide-react'

interface Site {
  id: string
  domain: string
  name: string
  contactEmail?: string
  stats?: {
    users: number
    articles: number
    categories: number
  }
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const params = useParams()
  const { site: currentSiteId } = useParams() as { site: string }
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [formData, setFormData] = useState({
    id: '',
    domain: '',
    name: '',
    contactEmail: ''
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchSites = async () => {
    try {
      const { data } = await api.get('/sites', { params: { includeStats: true } })
      if (data.success) {
        setSites(data.data)
      }
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || 'Gagal memuat data situs', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSites()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingSite) {
        await api.put(`/sites/${editingSite.id}`, formData)
      } else {
        await api.post('/sites', formData)
      }
      showToast(editingSite ? 'Situs berhasil diperbarui' : 'Situs berhasil dibuat')
      setDialogOpen(false)
      fetchSites()
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || 'Gagal menyimpan situs', 'error')
    }
  }

  const openEditDialog = (site: Site) => {
    setEditingSite(site)
    setFormData({
      id: site.id,
      domain: site.domain,
      name: site.name,
      contactEmail: site.contactEmail || ''
    })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingSite(null)
    setFormData({
      id: '',
      domain: '',
      name: '',
      contactEmail: ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (siteId: string) => {
    setDeleteConfirm(siteId)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      await api.delete(`/sites/${deleteConfirm}`)
      showToast('Situs berhasil dihapus')
      fetchSites()
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || 'Gagal menghapus situs', 'error')
    } finally {
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="space-y-8 min-h-screen text-slate-100 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
              toast.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/20 text-emerald-200' 
                : 'bg-red-950/90 border-red-500/20 text-red-200'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertTriangle size={18} className="text-red-400" />}
            <span className="text-xs font-black uppercase tracking-wider">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
            Manajemen <span className="text-brand-red">Situs</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">
            Kelola semua portal berita di jaringan BeritaKarya
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateDialog}
          className="bg-brand-red hover:bg-red-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-red/20 flex items-center gap-2 border border-brand-red/10 transition-all duration-300"
        >
          <Plus size={14} strokeWidth={3} />
          Tambah Situs
        </motion.button>
      </div>

      {/* Main Table Card */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white dark:bg-[#0c121e]/80 border border-gray-100 dark:border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0c121e]/60 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#070b13] border-b border-gray-100 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Site ID
                  </th>
                  <th className="px-6 py-4.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Domain
                  </th>
                  <th className="px-6 py-4.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell">
                    Nama & Kontak
                  </th>
                  <th className="px-6 py-4.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden sm:table-cell">
                    Statistik
                  </th>
                  <th className="px-6 py-4.5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40">
                {sites.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Belum ada situs terdaftar di sistem.
                    </td>
                  </tr>
                ) : sites.map((site) => (
                  <tr 
                    key={site.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-all duration-200"
                  >
                    {/* Site ID */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center bg-gray-100 dark:bg-slate-900/80 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">
                        {site.id}
                      </span>
                    </td>
                    
                    {/* Domain in glowing red text */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Globe size={13} className="text-brand-red opacity-80" />
                        <a 
                          href={`https://${site.domain}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-brand-red dark:text-red-500 hover:text-red-400 font-extrabold text-sm tracking-tight transition-colors duration-300 hover:underline"
                        >
                          {site.domain}
                        </a>
                      </div>
                    </td>

                    {/* Name & Contact */}
                    <td className="px-6 py-5 whitespace-nowrap hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-xs text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                          {site.name}
                        </span>
                        {site.contactEmail ? (
                          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                            <Mail size={10} /> {site.contactEmail}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500 font-medium italic mt-0.5">
                            Tanpa email kontak
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Statistics */}
                    <td className="px-6 py-5 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider">
                          <Users size={10} /> {site.stats?.users || 0}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider">
                          <FileText size={10} /> {site.stats?.articles || 0}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/20 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider">
                          <FolderOpen size={10} /> {site.stats?.categories || 0}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex gap-2 justify-end">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openEditDialog(site)}
                          className="px-3.5 py-1.5 border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#070b13] text-gray-600 dark:text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 flex items-center gap-1"
                        >
                          <Edit3 size={11} />
                          Edit
                        </motion.button>
                        {site.id !== 'pusat' && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(site.id)}
                            className="px-3.5 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/60 transition-all duration-300 flex items-center gap-1"
                          >
                            <Trash2 size={11} />
                            Hapus
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog Modal */}
      <AnimatePresence>
        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDialogOpen(false)}
              className="absolute inset-0 bg-[#05070c]/85 backdrop-blur-md"
            />
            
            {/* Content Card (Exactly like the dark premium design requested) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-slate-900 dark:bg-[#0c121e] border border-white/5 rounded-2xl max-w-xl w-full p-8 shadow-2xl relative overflow-hidden z-10 text-white"
            >
              {/* Close Button */}
              <button 
                onClick={() => setDialogOpen(false)}
                className="absolute top-5 right-5 text-gray-500 hover:text-white hover:bg-white/5 p-2 rounded-xl transition-all"
              >
                <X size={16} />
              </button>

              <h2 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                <Settings size={18} className="text-brand-red" />
                {editingSite ? 'Edit Konfigurasi Situs' : 'Tambahkan Portal Berita'}
              </h2>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 mb-8">
                {editingSite 
                  ? 'Perbarui konfigurasi situs yang terdaftar' 
                  : 'Tambahkan portal berita baru ke jaringan BeritaKarya'
                }
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Site ID */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                      Site ID *
                    </label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      placeholder="contoh: surabaya"
                      className="w-full px-4 py-3 bg-[#070b13] border border-white/5 rounded-xl text-xs text-white placeholder:text-gray-600 focus:border-brand-red/40 focus:ring-1 focus:ring-brand-red/30 outline-none transition-all duration-300 font-extrabold uppercase tracking-wide"
                      required
                      disabled={!!editingSite}
                    />
                    <p className="text-[9px] text-gray-600 font-semibold uppercase mt-1.5 tracking-wider">
                      Unique identifier. Digunakan dalam URL: /[site_id]/
                    </p>
                  </div>

                  {/* Domain */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                      Domain *
                    </label>
                    <input
                      type="text"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      placeholder="surabaya.beritakarya.co"
                      className="w-full px-4 py-3 bg-[#070b13] border border-white/5 rounded-xl text-xs text-white placeholder:text-gray-600 focus:border-brand-red/40 focus:ring-1 focus:ring-brand-red/30 outline-none transition-all duration-300 font-extrabold tracking-wide"
                      required
                    />
                    <p className="text-[9px] text-gray-600 font-semibold uppercase mt-1.5 tracking-wider">
                      Alamat domain lengkap untuk portal cabang.
                    </p>
                  </div>

                  {/* Nama Tampilan */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                      Nama Tampilan *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="BeritaKarya Surabaya"
                      className="w-full px-4 py-3 bg-[#070b13] border border-white/5 rounded-xl text-xs text-white placeholder:text-gray-600 focus:border-brand-red/40 focus:ring-1 focus:ring-brand-red/30 outline-none transition-all duration-300 font-extrabold"
                      required
                    />
                    <p className="text-[9px] text-gray-600 font-semibold uppercase mt-1.5 tracking-wider">
                      Nama cabang yang ditampilkan ke pembaca.
                    </p>
                  </div>

                  {/* Email Kontak */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                      Email Kontak
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="admin@surabaya.beritakarya.co"
                      className="w-full px-4 py-3 bg-[#070b13] border border-white/5 rounded-xl text-xs text-white placeholder:text-gray-600 focus:border-brand-red/40 focus:ring-1 focus:ring-brand-red/30 outline-none transition-all duration-300 font-extrabold"
                    />
                    <p className="text-[9px] text-gray-600 font-semibold uppercase mt-1.5 tracking-wider">
                      Email administrasi untuk notifikasi resmi.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-755 text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all duration-300"
                  >
                    Batal
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-3 bg-brand-red hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-red/30 border border-brand-red/10 transition-all duration-300"
                  >
                    {editingSite ? 'Perbarui' : 'Buat Situs'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-[#05070c]/85 backdrop-blur-md"
            />

            {/* Confirmation Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-red-500/20 rounded-2xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden z-10 text-white"
            >
              <div className="w-12 h-12 bg-red-950/50 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 mb-5">
                <AlertTriangle size={22} />
              </div>

              <h3 className="text-base font-black tracking-tight text-white uppercase">
                Konfirmasi Hapus Situs
              </h3>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 mb-5">
                Tindakan ini permanen dan berisiko tinggi
              </p>

              <p className="text-xs text-gray-400 leading-relaxed mb-8">
                Apakah Anda yakin ingin menghapus situs <code className="text-red-400 font-extrabold text-xs px-1.5 py-0.5 bg-red-950/30 rounded border border-red-500/20">{deleteConfirm}</code>? Tindakan ini akan menghapus seluruh artikel, kategori, media, dan data wartawan yang berafiliasi dengan situs tersebut secara permanen!
              </p>

              <div className="flex justify-end gap-3 pt-5 border-t border-white/5">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-755 text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all duration-300"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/30 border border-red-500/20 transition-all duration-300"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}