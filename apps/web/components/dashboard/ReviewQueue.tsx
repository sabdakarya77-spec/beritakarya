'use client';

import { motion } from 'framer-motion';
import { AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  status: string;
  category?: { name: string };
  author?: { name: string };
  createdAt: string;
}

function ReviewQueueItem({ article, site, index }: { article: Article; site: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className="flex items-center gap-3 py-3.5 border-b border-gray-50 dark:border-white/5 last:border-0 group"
    >
      <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0">
        <AlertCircle size={16} className="text-violet-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-brand-black dark:text-white line-clamp-1 group-hover:text-brand-red transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-brand-red font-bold uppercase tracking-widest">
            {article.category?.name || 'Umum'}
          </span>
          <span className="text-gray-300 dark:text-white/10 text-[10px]">•</span>
          <span className="text-[10px] text-gray-400 font-medium">
            oleh {article.author?.name || 'Redaksi'}
          </span>
        </div>
      </div>
      <Link
        href={`/${site}/dashboard/articles/${article.id}`}
        className="shrink-0 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
      >
        Review
      </Link>
    </motion.div>
  );
}

interface ReviewQueueProps {
  articles: Article[];
  site: string;
  count: number;
}

export function ReviewQueue({ articles, site, count }: ReviewQueueProps) {
  if (articles.length === 0) return null;

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div className="flex items-center gap-2">
          <AlertCircle size={14} className="text-violet-500" />
          <h3 className="dash-label text-violet-600 dark:text-violet-400">Antrian Review</h3>
          {count > 0 && (
            <span className="px-1.5 py-0.5 bg-violet-600 text-white text-[9px] font-black rounded-full">{count}</span>
          )}
        </div>
        <Link href={`/${site}/dashboard/review`} className="text-[10px] font-black uppercase tracking-widest text-brand-red hover:underline flex items-center gap-1">
          Semua <ChevronRight size={12} />
        </Link>
      </div>
      <div className="dash-card-body py-2">
        {articles.map((a, i) => <ReviewQueueItem key={a.id} article={a} site={site} index={i} />)}
      </div>
    </div>
  );
}
