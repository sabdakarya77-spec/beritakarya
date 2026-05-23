'use client';

import { Printer, MessageCircle } from 'lucide-react';

export default function ArticleActions() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleScrollToComments = () => {
    if (typeof document !== 'undefined') {
      document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/90 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 shadow-sm transition-all hover:border-brand-red/30 hover:text-brand-red dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:border-brand-red/30 dark:hover:text-brand-red"
        aria-label="Cetak artikel"
      >
        <Printer size={14} />
        Cetak
      </button>
      <button
        onClick={handleScrollToComments}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/90 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 shadow-sm transition-all hover:border-brand-red/30 hover:text-brand-red dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:border-brand-red/30 dark:hover:text-brand-red"
        aria-label="Lihat komentar"
      >
        <MessageCircle size={14} />
        Komentar
      </button>
    </div>
  );
}
