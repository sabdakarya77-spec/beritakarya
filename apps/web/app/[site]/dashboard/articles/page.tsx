'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Eye, Edit3, Trash2, Calendar,
  FileText, Loader2, Send, ChevronLeft, ChevronRight,
  Globe
} from 'lucide-react';
import StatusBadge from '../../../../components/ui/StatusBadge';
import EditorialBadge from '../../../../components/ui/EditorialBadge';
import KanbanBoard from '../../../../components/dashboard/KanbanBoard';
import { cn } from '../../../../lib/utils';
import { LayoutGrid, List } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  '': 'Semua',
  draft: 'Draft',
  submitted: 'Dikirim',
  review: 'Review',
  revision: 'Revisi',
  approved: 'Disetujui',
  scheduled: 'Terjadwal',
  published: 'Terbit',
  archived: 'Arsip',
};

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  category?: { name: string };
  author?: { name: string };
  createdAt: string;
  publishedAt?: string;
  viewCount?: number;
  wordCount?: number;
  isBreaking?: boolean;
  isExclusive?: boolean;
  isFeatured?: boolean;
}

const CAN_SUBMIT_ROLES = ['reporter', 'kontributor', 'wapimred', 'superadmin'];
const CAN_DELETE_ROLES = ['superadmin', 'wapimred'];
const getStatusFromQuery = (value: string | null) =>
  value && value in STATUS_LABELS ? value : '';
const getViewModeFromQuery = (value: string | null): 'list' | 'kanban' =>
  value === 'kanban' ? 'kanban' : 'list';
const getArticleActionHint = (status: string) => {
  switch (status) {
    case 'draft':
      return 'Aksi utama: rapikan lalu kirim ke editor.';
    case 'revision':
      return 'Aksi utama: perbaiki sesuai catatan editor.';
    case 'submitted':
    case 'review':
      return 'Aksi utama: pantau keputusan editorial.';
    case 'approved':
      return 'Aksi utama: siapkan ke tahap publikasi.';
    case 'scheduled':
      return 'Aksi utama: cek kesiapan jadwal terbit.';
    case 'published':
      return 'Aksi utama: buka hasil terbit dan distribusi.';
    default:
      return 'Aksi utama: buka detail post.';
  }
};

export default function ArticlesPage() {
  const router = useRouter();
  const { site } = useParams<{ site: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(getStatusFromQuery(searchParams.get('status')));
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(getViewModeFromQuery(searchParams.get('view')));
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [globalStats, setGlobalStats] = useState<Record<string, number>>({});

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { 
        site,
        search: searchQuery,
        page,
        limit: 10
      };
      if (filter) params.status = filter;
      
      const [artRes, statsRes] = await Promise.all([
        api.get('/articles', { params }),
        api.get('/articles/stats', { params: { site } })
      ]);
      
      const items = artRes.data.data.articles || artRes.data.data.items || [];
      setArticles(items);
      setTotalPages(artRes.data.data.totalPages || 1);
      setTotalItems(artRes.data.data.total || 0);
      setGlobalStats(statsRes.data.data || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search agar tidak hit API setiap ketikan huruf
  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 500);
    return () => clearTimeout(timer);
  }, [site, filter, searchQuery, page]);

  // Reset page when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [filter, searchQuery]);

  useEffect(() => {
    const nextFilter = getStatusFromQuery(searchParams.get('status'));
    const nextSearch = searchParams.get('search') || '';
    const nextViewMode = getViewModeFromQuery(searchParams.get('view'));

    if (nextFilter !== filter) {
      setFilter(nextFilter);
    }
    if (nextSearch !== searchQuery) {
      setSearchQuery(nextSearch);
    }
    if (nextViewMode !== viewMode) {
      setViewMode(nextViewMode);
    }
  }, [searchParams, filter, searchQuery, viewMode]);

  const handleNew = async () => {
    setIsCreating(true);
    try {
      // Redirect ke halaman post baru tanpa membuat draft di database
      // Draft akan dibuat hanya saat user benar-benar menyimpan (save/auto-save)
      router.push(`/${site}/dashboard/articles/new`);
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Gagal membuat post baru');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitToReview = async (articleId: string) => {
    setActionLoading(articleId);
    try {
      await api.put(`/articles/${articleId}`, { status: 'submitted' });
      await load();
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Gagal mengirim ke editor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm('Yakin ingin menghapus post ini? Tindakan ini tidak dapat dibatalkan.')) return;
    setActionLoading(articleId + 'del');
    try {
      await api.delete(`/articles/${articleId}`);
      await load();
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Gagal menghapus post');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGoogleIndex = async (articleId: string) => {
    setActionLoading(articleId + 'index');
    try {
      const { data } = await api.post(`/articles/${articleId}/index-google`);
      if (data.success) {
        alert('Sukses! Google Indexing API berhasil diping. Artikel akan segera dirayapi Googlebot!');
      } else {
        alert('Info: ' + (data.message || 'Respons dari API'));
      }
    } catch (e: any) {
      alert(e.response?.data?.error?.message || e.response?.data?.message || 'Gagal memanggil Google Indexing API. Pastikan kredensial di Pengaturan Situs sudah aktif & benar!');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = articles; // Sekarang data sudah difilter di sisi Server

  // Count per status for tab badges using global stats from backend
  const countByStatus = (s: string) => {
    if (s === '') {
      return Object.values(globalStats).reduce((a, b) => a + b, 0);
    }
    return globalStats[s] || 0;
  };

  // Tabs to show based on role
  const visibleStatuses = (user?.role === 'reporter' || user?.role === 'kontributor')
    ? ['', 'draft', 'submitted', 'revision', 'published']
    : ['', 'draft', 'submitted', 'review', 'revision', 'approved', 'scheduled', 'published'];

  const canSubmitArticle = (article: Article) =>
    article.status === 'draft' && CAN_SUBMIT_ROLES.includes(user?.role || '');

  const canDeleteArticle = () => CAN_DELETE_ROLES.includes(user?.role || '');
  const getPrimaryActionLabel = (article: Article) => {
    if (canSubmitArticle(article)) return 'Kirim ke Editor';
    if (article.status === 'revision') return 'Perbaiki';
    if (article.status === 'published') return 'Lihat Terbit';
    if (article.status === 'approved') return 'Buka Approved';
    if (article.status === 'scheduled') return 'Cek Jadwal';
    if (article.status === 'submitted' || article.status === 'review') return 'Pantau Status';
    return 'Buka Post';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-black dark:text-white tracking-tight">Kelola Post</h1>
          <p className="text-xs text-gray-400 mt-1">
            Portal <strong className="text-brand-red uppercase">{site}</strong> — {articles.length} post total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-xl flex items-center gap-1">
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white dark:bg-white/10 text-brand-red shadow-sm" : "text-gray-400 hover:text-brand-black")}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'kanban' ? "bg-white dark:bg-white/10 text-brand-red shadow-sm" : "text-gray-400 hover:text-brand-black")}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button 
            onClick={handleNew}
            disabled={isCreating}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white text-[11px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-brand-red/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
            {isCreating ? 'Membuat...' : 'Post Berita'}
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="dash-card p-4 space-y-4">
        {(filter || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-red/10 bg-brand-red/5 px-3 py-2.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-red">
              Fokus Aktif
            </span>
            {filter && (
              <span className="rounded-full bg-white dark:bg-slate-900/70 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-brand-black dark:text-white">
                Status: {STATUS_LABELS[filter]}
              </span>
            )}
            {searchQuery && (
              <span className="rounded-full bg-white dark:bg-slate-900/70 px-2 py-1 text-[10px] font-black text-brand-black dark:text-white">
                Cari: &quot;{searchQuery}&quot;
              </span>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative group">
          <Search size={15} className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors",
            loading ? "text-brand-red animate-pulse" : "text-gray-300 group-focus-within:text-brand-red"
          )} />
          <input 
            type="text"
            placeholder="Cari judul post di seluruh database..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-brand-red/30 focus:bg-white dark:focus:bg-white/[0.08] rounded-xl text-sm outline-none transition-all text-brand-black dark:text-white placeholder:text-gray-300 shadow-sm"
          />
          {loading && searchQuery && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 size={14} className="animate-spin text-brand-red opacity-50" />
            </div>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {visibleStatuses.map(s => {
            const count = countByStatus(s);
            return (
              <button 
                key={s}
                onClick={() => {
                  setFilter(s);
                  // Update URL to reflect filter state
                  const params = new URLSearchParams();
                  params.set('view', viewMode);
                  if (s) params.set('status', s);
                  if (searchQuery) params.set('search', searchQuery);
                  router.push(`/${site}/dashboard/articles?${params.toString()}`);
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap',
                  filter === s
                    ? 'bg-brand-black dark:bg-white text-white dark:text-slate-900 border-brand-black dark:border-white'
                    : 'bg-transparent text-gray-400 border-gray-200 dark:border-white/10 hover:border-brand-red hover:text-brand-red'
                )}
              >
                {STATUS_LABELS[s]}
                {count > 0 && (
                  <span className={cn(
                    'text-[8px] font-black px-1.5 py-0.5 rounded-full',
                    filter === s ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content View (Table or Kanban) */}
      {loading ? (
        <div className="dash-card p-16 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Memuat data...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="animate-fade-in">
          <KanbanBoard articles={filtered} site={site} />
        </div>
      ) : (
        <div className="dash-card overflow-hidden animate-fade-in">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
              <tr>
                <th className="px-6 py-3.5 dash-label">Post</th>
                <th className="px-4 py-3.5 dash-label hidden md:table-cell">Penulis</th>
                <th className="px-4 py-3.5 dash-label hidden lg:table-cell">Tanggal</th>
                <th className="px-4 py-3.5 dash-label">Status</th>
                <th className="px-4 py-3.5 dash-label text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {filtered.filter(a => a?.id).map((article, idx) => (
                <motion.tr
                  key={article.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {/* Title */}
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {article.category?.name && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-brand-red">
                            {article.category.name}
                          </span>
                        )}
                        {article.isBreaking && <EditorialBadge variant="breaking" />}
                        {article.isExclusive && <EditorialBadge variant="exclusive" />}
                        {article.isFeatured && <EditorialBadge variant="featured" />}
                      </div>
                      <Link
                        href={`/${site}/dashboard/articles/${article.id}`}
                        className="text-sm font-bold text-brand-black dark:text-white group-hover:text-brand-red transition-colors line-clamp-1 leading-snug"
                      >
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        {article.viewCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <Eye size={10} /> {(article.viewCount || 0).toLocaleString()}
                          </span>
                        )}
                        {article.wordCount && (
                          <span className="flex items-center gap-1">
                            <FileText size={10} /> {article.wordCount.toLocaleString()} kata
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Author */}
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500 dark:text-gray-400">
                        {article.author?.name?.[0] || 'R'}
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
                        {article.author?.name || 'Redaksi'}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Calendar size={11} />
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString('id-ID', {
                        day:'numeric', month:'short', year:'numeric'
                      })}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge status={article.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 text-right">
                        {getArticleActionHint(article.status)}
                      </span>
                      <div className="flex justify-end items-center gap-2 flex-wrap">
                        {canSubmitArticle(article) ? (
                          <>
                            <button
                              onClick={() => handleSubmitToReview(article.id)}
                              disabled={actionLoading === article.id}
                              title="Kirim ke editor"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-brand-red text-white text-[10px] font-black uppercase tracking-wide rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 shadow-sm"
                            >
                              {actionLoading === article.id
                                ? <Loader2 size={12} className="animate-spin" />
                                : <Send size={12} />
                              }
                              {getPrimaryActionLabel(article)}
                            </button>
                            <Link
                              href={`/${site}/dashboard/articles/${article.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 text-[10px] font-black uppercase tracking-wide rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                              title="Edit post"
                            >
                              <Edit3 size={13} />
                              Edit
                            </Link>
                          </>
                        ) : article.status === 'published' ? (
                          <>
                            <Link
                              href={`/${site}/artikel/${article.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wide rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
                              title="Lihat post"
                            >
                              <Eye size={12} />
                              {getPrimaryActionLabel(article)}
                            </Link>
                            <Link
                              href={`/${site}/dashboard/articles/${article.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 text-[10px] font-black uppercase tracking-wide rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                              title="Edit post"
                            >
                              <Edit3 size={13} />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleGoogleIndex(article.id)}
                              disabled={actionLoading === article.id + 'index'}
                              className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-all disabled:opacity-50"
                              title="Kirim sinyal indeks Google"
                            >
                              {actionLoading === article.id + 'index' ? (
                                <Loader2 size={14} className="animate-spin text-emerald-500" />
                              ) : (
                                <Globe size={14} />
                              )}
                            </button>
                          </>
                        ) : (
                          <Link
                            href={`/${site}/dashboard/articles/${article.id}`}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wide rounded-lg transition-all shadow-sm',
                              article.status === 'revision'
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : article.status === 'approved'
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-brand-black dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                            )}
                            title="Buka post"
                          >
                            <Edit3 size={12} />
                            {getPrimaryActionLabel(article)}
                          </Link>
                        )}
                        {canDeleteArticle() && (
                          <button 
                            onClick={() => handleDelete(article.id)}
                            disabled={actionLoading === article.id + 'del'}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all disabled:opacity-50"
                            title="Hapus"
                          >
                            {actionLoading === article.id + 'del'
                              ? <Loader2 size={15} className="animate-spin" />
                              : <Trash2 size={15} />
                            }
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-300 dark:text-white/10">
                      <FileText size={48} strokeWidth={1} />
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Tidak ada post'}
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={handleNew}
                          className="mt-2 flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all"
                        >
                          <Plus size={12} /> Tulis Post Pertama
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50/30 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Menampilkan {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} dari {totalItems} post
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 text-gray-400 hover:text-brand-red disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    // Show current page, and few pages around it
                    if (totalPages > 5) {
                      if (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(page - (i + 1)) > 1) {
                        if (Math.abs(page - (i + 1)) === 2) return <span key={i} className="text-gray-300">...</span>;
                        return null;
                      }
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                          page === i + 1 ? "bg-brand-red text-white shadow-md shadow-brand-red/20" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                        )}
                      >
                        {i + 1}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 text-gray-400 hover:text-brand-red disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
