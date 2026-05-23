'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

interface Comment {
  id: string;
  content: string;
  authorName?: string;
  authorEmail?: string;
  status: string;
  createdAt: string;
  user?: { name: string };
  replies?: Comment[];
}

export default function CommentSection({ articleId }: { articleId: string }) {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const returnPath = pathname ? `${pathname}#comments` : '#comments';
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;
  const registerHref = `/register?next=${encodeURIComponent(returnPath)}`;

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = '0px';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
  }, [content]);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/comments/article/${articleId}`);
      setComments(data.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!user) {
      setMessage({ type: 'error', text: 'Silakan masuk atau daftar terlebih dahulu untuk ikut berdiskusi.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await api.post(`/comments/article/${articleId}`, { content: content.trim() });

      setContent('');
      setMessage({
        type: 'success',
        text: 'Komentar Anda telah dikirim dan menunggu moderasi redaksi.'
      });
      fetchComments();
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal mengirim komentar. Silakan coba lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-20 border-t border-gray-100 pt-16 dark:border-white/5">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-red text-white shadow-lg shadow-brand-red/20">
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-brand-black dark:text-white">Komentar</h3>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {isLoading ? 'Memuat...' : `${comments.length} komentar pembaca terdaftar`}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-10 rounded-3xl border border-gray-100 bg-gray-50/80 p-5 dark:border-white/5 dark:bg-white/[0.02]">
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm dark:bg-white/5">
                <span className="font-black text-sm text-brand-red">{user.name[0]}</span>
              </div>
              <div className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-brand-red/30 dark:border-white/10 dark:bg-slate-900">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (message?.type === 'error') setMessage(null);
                  }}
                  placeholder="Bagikan pendapat Anda tentang berita ini..."
                  className="min-h-[44px] w-full resize-none overflow-y-auto bg-transparent text-sm leading-relaxed outline-none placeholder:text-gray-400"
                />
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Komentar ditinjau redaksi sebelum tayang
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-red px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-white transition-all hover:bg-brand-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim'} <Send size={13} />
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm dark:bg-white/5">
              <User size={18} />
            </div>
            <div className="flex-1 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Untuk ikut berdiskusi, silakan masuk atau daftar terlebih dahulu.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 dark:border-white/5">
                <Link
                  href={loginHref}
                  className="inline-flex items-center rounded-full bg-brand-red px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white transition-all hover:bg-brand-black"
                >
                  Masuk
                </Link>
                <Link
                  href={registerHref}
                  className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-brand-black transition-all hover:border-brand-red hover:text-brand-red dark:border-white/10 dark:text-white"
                >
                  Daftar
                </Link>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Hanya akun terdaftar yang dapat mengirim komentar
                </span>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div
            className={cn(
              'mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-bold',
              message.type === 'success'
                ? 'border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'border-red-100 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'
            )}
          >
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-red/20 border-t-brand-red" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Memuat komentar...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 px-6 py-12 text-center dark:border-white/10">
            <MessageSquare size={34} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Belum ada komentar.</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Jadilah yang pertama berdiskusi setelah masuk ke akun Anda.
            </p>
          </div>
        ) : (
          comments.map((c) => (
            <article key={c.id} className="border-b border-gray-100 pb-6 last:border-b-0 dark:border-white/5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-black text-brand-red dark:bg-white/5">
                  {c.user?.name?.[0] || c.authorName?.[0] || 'P'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-black dark:text-white">
                      {c.user?.name || c.authorName || 'Pembaca'}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      <Clock size={10} />
                      {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] leading-7 text-gray-700 dark:text-gray-300">
                    {c.content}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-12 rounded-2xl border border-gray-100 bg-brand-surface/60 px-5 py-4 text-center dark:border-white/5 dark:bg-white/[0.02]">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] leading-relaxed text-gray-400">
          Komentar ditampilkan setelah moderasi redaksi dan menjadi tanggung jawab masing-masing pengirim.
        </p>
      </div>
    </section>
  );
}
