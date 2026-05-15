'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '../../../../lib/api'

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
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-4 rounded-xl shadow-2xl text-sm font-semibold transition-all animate-fade-in ${
          toast.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manajemen Situs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola semua portal berita di jaringan BeritaKarya
          </p>
        </div>
        <button 
          onClick={openCreateDialog}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          + Tambah Situs
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontak
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statistik
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sites.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    Belum ada situs terdaftar
                  </td>
                </tr>
              ) : sites.map((site) => (
                <tr key={site.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                      {site.id}
                    </code>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <a 
                      href={`https://${site.domain}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-600 hover:underline"
                    >
                      {site.domain}
                    </a>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap font-medium">
                    {site.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {site.contactEmail || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex gap-2 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {site.stats?.users || 0} users
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {site.stats?.articles || 0} articles
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {site.stats?.categories || 0} categories
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditDialog(site)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(site.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded text-sm hover:bg-red-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingSite ? 'Edit Situs' : 'Tambah Situs Baru'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {editingSite 
                ? 'Perbarui konfigurasi situs yang ada' 
                : 'Tambahkan portal berita baru ke jaringan BeritaKarya'
              }
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Site ID *
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="contoh: surabaya"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    required
                    disabled={!!editingSite}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier. Digunakan dalam URL: /[site_id]/
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Domain *
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="surabaya.beritakarya.co"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nama Tampilan *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="BeritaKarya Surabaya"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Kontak
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="admin@surabaya.beritakarya.co"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                >
                  {editingSite ? 'Perbarui' : 'Buat Situs'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Konfirmasi Hapus Situs
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Apakah Anda yakin ingin menghapus situs ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}