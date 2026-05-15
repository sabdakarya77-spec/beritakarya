'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  siteId?: string | null;
  isGlobal?: boolean;
}

export default function CategoriesDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGlobalView, setIsGlobalView] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const router = useRouter();

  // [A-5c] Fix: use useParams() instead of window.location.pathname regex (which always returned empty string)
  const params = useParams();
  const siteId = (params.site as string) || 'pusat';

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCategories = async () => {
    try {
      const queryParams: Record<string, string> = {};
      if (isGlobalView) {
        queryParams.view = 'all';
      }
      // [A-5c] Fix: use api (axios with auth interceptor) instead of bare fetch()
      const { data } = await api.get('/categories', { params: queryParams });
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error: any) {
      console.error('Gagal mengambil kategori', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [isGlobalView]);

  // Auto-generate slug from name
  useEffect(() => {
    const generated = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generated);
  }, [name]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      // For superadmin creating global category, send siteId: null
      const payload = isGlobalView ? { name, slug, siteId: null } : { name, slug, siteId: siteId };
      
      // [A-5c] Fix: use api instead of bare fetch()
      await api.post('/categories', payload);
      
      setName('');
      setSlug('');
      showToast('Kategori berhasil dibuat');
      fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || 'Gagal membuat kategori', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (cat: Category) => {
    if (cat.isGlobal) {
      showToast('Kategori global tidak dapat dihapus', 'error');
      return;
    }
    setDeleteConfirm(cat);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      // [A-5c] Fix: use api instead of bare fetch()
      await api.delete(`/categories/${deleteConfirm.id}`);
      showToast('Kategori berhasil dihapus');
      fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || 'Gagal menghapus kategori', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Kategori
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Kelola rubrikasi berita
            {!isGlobalView && <span className="text-red-600 font-semibold"> untuk {siteId}</span>}
          </p>
        </div>

        {/* Superadmin Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGlobalView(!isGlobalView)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
              isGlobalView 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {isGlobalView ? '🌐 Global View ON' : '📍 Site View'}
          </button>
          
          {isGlobalView && (
            <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-900/30">
              Anda melihat semua kategori di semua situs. Hanya superadmin yang bisa melihat ini.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Add */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
              Tambah Kategori Baru
            </h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Kategori</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Politik Lokal"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-red-500 transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Slug URL</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/</span>
                  <input 
                    type="text" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="politik-lokal"
                    className="w-full pl-7 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none font-mono text-red-600"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  URL-friendly version. Auto-generated dari nama.
                </p>
              </div>

              {/* Global Category Toggle (Superadmin only) */}
              {isGlobalView && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/30 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
                    <input 
                      type="checkbox" 
                      id="isGlobal" 
                      defaultChecked={true}
                      className="w-4 h-4"
                      readOnly
                    />
                    <label htmlFor="isGlobal" className="text-sm font-bold">
                      Kategori Global (tersedia ke semua situs)
                    </label>
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 ml-6">
                    Kategori ini akan terlihat di semua portal BeritaKarya.
                  </p>
                </div>
              )}

              {!isGlobalView && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    Kategori akan dibuat khusus untuk situs <strong>{siteId}</strong>.
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Menyimpan...' : 'Tambah Kategori'}
              </button>
            </form>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl">
            <div className="flex items-start gap-3 text-amber-600">
              <span className="text-lg">⚠️</span>
              <p className="text-xs leading-relaxed">
                <strong>Perhatian:</strong> Ulangi Slug dengan hati-hati. Perubahan dapat memutus tautan berita yang sudah dibagikan di media sosial.
              </p>
            </div>
          </div>
        </div>

        {/* List Table */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Nama Kategori
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Scope
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Slug / URL
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <span className="text-4xl">📂</span>
                        <span className="text-sm font-bold uppercase tracking-widest">Belum ada kategori</span>
                        <p className="text-xs">Mulai dengan menambahkan kategori baru di form di samping.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400">
                            <span className="text-sm">#</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {cat.isGlobal ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                            🌐 GLOBAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            {cat.siteId || siteId}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                          /{cat.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteRequest(cat)}
                          className={`p-2 rounded-lg transition-colors ${
                            cat.isGlobal 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                          title={cat.isGlobal ? 'Kategori global tidak dapat dihapus' : 'Hapus Kategori'}
                          disabled={cat.isGlobal}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            <div className="mt-4 flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total: {categories.length} Kategori
              </p>
              {isGlobalView && (
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Menampilkan semua kategori dari semua situs
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Hapus Kategori?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Menghapus kategori <strong>&quot;{deleteConfirm.name}&quot;</strong> dapat memengaruhi post yang sudah ada. Tindakan ini tidak dapat dibatalkan.
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
  );
}