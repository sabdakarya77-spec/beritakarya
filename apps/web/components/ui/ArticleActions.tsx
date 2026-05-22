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
    <div className="ml-auto hidden lg:flex items-center gap-4">
      <button
        onClick={handlePrint}
        className="p-2 text-gray-400 hover:text-brand-red transition-all"
        aria-label="Print article"
      >
        <Printer size={18} />
      </button>
      <button
        onClick={handleScrollToComments}
        className="p-2 text-gray-400 hover:text-brand-red transition-all"
        aria-label="Scroll to comments"
      >
        <MessageCircle size={18} />
      </button>
    </div>
  );
}