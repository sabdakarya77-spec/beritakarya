'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  siteId?: string | null;
  isGlobal?: boolean;
  parentId?: string | null;
  order?: number;
  color?: string | null;
  parent?: Category | null;
  subCategories?: Category[];
}

const COLOR_PRESETS: Record<string, { label: string; bg: string; text: string; border: string; hex: string }> = {
  slate: { label: 'Slate (Umum)', bg: 'bg-slate-50 dark:bg-slate-900/40', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-800', hex: '#64748b' },
  red: { label: 'Red (Investigasi)', bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-100 dark:border-red-900/30', hex: '#ef4444' },
  orange: { label: 'Orange (Olahraga)', bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-900/30', hex: '#f97316' },
  amber: { label: 'Amber (Daerah)', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/30', hex: '#f59e0b' },
  yellow: { label: 'Yellow (Advertorial)', bg: 'bg-yellow-50 dark:bg-yellow-950/20', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-100 dark:border-yellow-900/30', hex: '#eab308' },
  green: { label: 'Green (Kesehatan)', bg: 'bg-green-50 dark:bg-green-950/20', text: 'text-green-700 dark:text-green-400', border: 'border-green-100 dark:border-green-900/30', hex: '#22c55e' },
  emerald: { label: 'Emerald (Ekonomi)', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/30', hex: '#10b981' },
  teal: { label: 'Teal (Gaya Hidup)', bg: 'bg-teal-50 dark:bg-teal-950/20', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-900/30', hex: '#14b8a6' },
  sky: { label: 'Sky (Video)', bg: 'bg-sky-50 dark:bg-sky-950/20', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-100 dark:border-sky-900/30', hex: '#0ea5e9' },
  blue: { label: 'Blue (Teknologi)', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/30', hex: '#3b82f6' },
  indigo: { label: 'Indigo (Opini)', bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-900/30', hex: '#6366f1' },
  violet: { label: 'Violet (Politik)', bg: 'bg-violet-50 dark:bg-violet-950/20', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-900/30', hex: '#8b5cf6' },
  purple: { label: 'Purple (Hiburan)', bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/30', hex: '#a855f7' },
  pink: { label: 'Pink (Kreatif)', bg: 'bg-pink-50 dark:bg-pink-950/20', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-100 dark:border-pink-900/30', hex: '#ec4899' },
  rose: { label: 'Rose (Nasional)', bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/30', hex: '#f43f5e' }
};

export default function CategoriesDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [order, setOrder] = useState('0');
  const [color, setColor] = useState('slate');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGlobalView, setIsGlobalView] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
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
      // Use /categories/tree endpoint to get hierarchical structure (synced with homepage & editor)
      const { data } = await api.get('/categories/tree', { params: queryParams });
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error: any) {
      console.error('Gagal mengambil kategori', error);
      showToast('Gagal memuat kategori', 'error');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [isGlobalView]);

  // Auto-generate slug from name
  useEffect(() => {
    if (editingCategory) return; // Don't auto-generate if editing
    const generated = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generated);
  }, [name, editingCategory]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const payload = {
        name,
        slug,
        parentId: parentId || null,
        order: order ? Number(order) : 0,
        color: color || 'slate',
        siteId: isGlobalView ? null : siteId
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, payload);
        showToast('Kategori berhasil diperbarui');
      } else {
        await api.post('/categories', payload);
        showToast('Kategori berhasil dibuat');
      }
      
      setName('');
      setSlug('');
      setParentId('');
      setOrder('0');
      setColor('slate');
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || (editingCategory ? 'Gagal memperbarui kategori' : 'Gagal membuat kategori'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setParentId(cat.parentId || '');
    setOrder(String(cat.order || 0));
    setColor(cat.color || 'slate');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setParentId('');
    setOrder('0');
    setColor('slate');
  };

  const handleDeleteRequest = (cat: Category) => {
    if (cat.isGlobal && !isGlobalView) {
      showToast('Kategori global hanya dapat dihapus di Global View', 'error');
      return;
    }
    setDeleteConfirm(cat);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/categories/${deleteConfirm.id}`);
      showToast('Kategori berhasil dihapus');
      fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || 'Gagal menghapus kategori', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Flatten tree structure for table display
  const flattenCategories = (cats: Category[], isSub = false): (Category & { isSub?: boolean })[] => {
    return cats.flatMap(cat => {
      const result: (Category & { isSub?: boolean })[] = [isSub ? { ...cat, isSub: true } : cat];
      if (cat.subCategories && cat.subCategories.length > 0) {
        result.push(...flattenCategories(cat.subCategories, true));
      }
      return result;
    });
  };

  const orderedCategories = flattenCategories(categories);

  // Get parent candidates (only top-level categories) for dropdown, excluding self when editing
  const potentialParents = categories.filter(
    parent => !parent.parentId && (!editingCategory || parent.id !== editingCategory.id)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-4 rounded-xl shadow-2xl text-sm font-semibold transition-all duration-300 animate-fade-in ${
          toast.type === 'success' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-rose-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Menu Kategori & Rubrikasi
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola struktur menu navigasi hierarkis (Parent & Sub-menu)
            {!isGlobalView && <span className="text-rose-600 font-bold dark:text-rose-400"> untuk {siteId}</span>}
          </p>
        </div>

        {/* Superadmin Toggle */}
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-between">
          <button
            onClick={() => setIsGlobalView(!isGlobalView)}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 border ${
              isGlobalView 
                ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/20' 
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
            }`}
          >
            {isGlobalView ? '🌐 Global View ON' : '📍 Site View'}
          </button>
          
          {isGlobalView && (
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-xl border border-purple-100 dark:border-purple-900/30 hidden md:block">
              Superadmin Mode: Mengelola kategori global / lintas situs.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Add / Edit */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center justify-between">
              <span>{editingCategory ? 'Edit Kategori' : 'Tambah Baru'}</span>
              {editingCategory && (
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  className="text-[10px] bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 px-2.5 py-1.5 rounded-lg font-bold transition-all"
                >
                  BATAL
                </button>
              )}
            </h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nama Kategori / Rubrik</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Olahraga, Politik Lokal"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-rose-500 dark:focus:border-rose-500 focus:bg-white dark:focus:bg-gray-800 transition-all font-semibold"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Slug URL / Identifier</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/</span>
                  <input 
                    type="text" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={!!editingCategory}
                    placeholder="politik-lokal"
                    className="w-full pl-7 pr-4 py-3 bg-gray-100/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none font-mono text-rose-600 dark:text-rose-400 disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                    required
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  URL-friendly. Terbentuk otomatis dari nama untuk kategori baru.
                </p>
              </div>

              {/* Parent Category Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Kategori Induk (Parent Menu)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-rose-500 transition-all font-semibold"
                >
                  <option value="">None (Jadikan Kategori Utama / Induk)</option>
                  {potentialParents.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isGlobal ? '(Global)' : ''}
                    </option>
                  ))}
                  {potentialParents.length === 0 && categories.length > 0 && (
                    <option value="" disabled>Semua kategori sudah memiliki induk</option>
                  )}
                </select>
                <p className="text-[11px] text-gray-400 mt-2">
                  Pilih induk jika ingin menjadikan kategori ini sebagai Sub-menu. Hanya kategori utama yang dapat dipilih sebagai induk.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Order Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Urutan (Order)</label>
                  <input 
                    type="number" 
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-rose-500 transition-all font-semibold"
                    required
                  />
                </div>

                {/* Accent Color Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Warna Aksen</label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-rose-500 transition-all font-semibold"
                  >
                    {Object.entries(COLOR_PRESETS).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color preview bar */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Preview:</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold border ${
                  COLOR_PRESETS[color]?.bg || COLOR_PRESETS.slate.bg
                } ${
                  COLOR_PRESETS[color]?.text || COLOR_PRESETS.slate.text
                } ${
                  COLOR_PRESETS[color]?.border || COLOR_PRESETS.slate.border
                }`}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_PRESETS[color]?.hex || COLOR_PRESETS.slate.hex }}></span>
                  {name || 'Nama Kategori'}
                </span>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-rose-600/20 shadow-rose-600/10 hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? 'Menyimpan...' : (editingCategory ? 'Simpan Perubahan' : 'Buat Kategori')}
              </button>
            </form>
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
            <div className="flex items-start gap-3 text-amber-600 dark:text-amber-400">
              <span className="text-lg">💡</span>
              <div className="text-xs leading-relaxed space-y-1">
                <p className="font-bold">Tips Struktur Navigasi:</p>
                <p>Urutan (Order) menentukan posisi dari kiri-ke-kanan pada navigasi publik. Gunakan urutan yang rapat (misal 1, 2, 3) untuk visualisasi yang rapi.</p>
              </div>
            </div>
          </div>
        </div>

        {/* List Table Hierarchy */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-150 dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">
                      Struktur Menu / Rubrik
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">
                      Scope
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">
                      Urutan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">
                      Aksen Warna
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-400">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {orderedCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                          <span className="text-5xl">📂</span>
                          <span className="text-sm font-bold uppercase tracking-widest">Belum ada kategori</span>
                          <p className="text-xs">Mulai dengan menambahkan kategori baru di form di samping.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orderedCategories.map(cat => {
                      const colorInfo = COLOR_PRESETS[cat.color || 'slate'] || COLOR_PRESETS.slate;
                      return (
                        <tr 
                          key={cat.id} 
                          className={`hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-150 ${
                            cat.isSub 
                              ? 'bg-gray-50/20 dark:bg-gray-900/10' 
                              : 'font-semibold'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {cat.isSub ? (
                                <>
                                  <span className="text-gray-300 dark:text-gray-600 pl-4 font-mono select-none">↳</span>
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {cat.name}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {cat.name}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {cat.isGlobal ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                                🌐 GLOBAL
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                                {cat.siteId?.toUpperCase() || siteId.toUpperCase()}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono text-gray-500">
                              {cat.order ?? 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider ${
                              colorInfo.bg
                            } ${
                              colorInfo.text
                            } ${
                              colorInfo.border
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorInfo.hex }}></span>
                              {cat.color || 'slate'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-1">
                            <button 
                              onClick={() => {
                                if (cat.isGlobal && !isGlobalView) {
                                  showToast('Kategori global hanya dapat diedit di Global View', 'error');
                                  return;
                                }
                                startEdit(cat);
                              }}
                              className={`p-2 rounded-xl transition-all ${
                                cat.isGlobal && !isGlobalView
                                  ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' 
                                  : 'text-gray-400 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:bg-rose-500/20'
                              }`}
                              title={cat.isGlobal && !isGlobalView ? 'Kategori global hanya bisa diedit dalam Global View' : 'Edit Kategori'}
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteRequest(cat)}
                              className={`p-2 rounded-xl transition-all ${
                                cat.isGlobal && !isGlobalView
                                  ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' 
                                  : 'text-gray-400 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:bg-rose-500/20'
                              }`}
                              title={cat.isGlobal && !isGlobalView ? 'Kategori global hanya bisa dihapus dalam Global View' : 'Hapus Kategori'}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-150 dark:border-gray-700">
              <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                Total: {orderedCategories.length} Rubrik / Menu
              </p>
              {isGlobalView && (
                <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                  Menampilkan semua kategori lintas situs
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight mb-2">
              Hapus Kategori?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus rubrik <strong>"{deleteConfirm.name}"</strong>? 
              Jika rubrik ini adalah kategori utama, semua relasi sub-kategori di bawahnya akan kehilangan induknya. Tindakan ini permanen.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-600/25 transition-all"
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