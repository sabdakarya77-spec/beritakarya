'use client';

import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export default function FontSizeControl() {
  const [fontSize, setFontSize] = useState(1); // 1 = normal, 0.8 = small, 1.2 = large, etc.
  
  const sizes = [
    { label: 'A-', value: 0.85 },
    { label: 'Normal', value: 1 },
    { label: 'A+', value: 1.15 },
    { label: 'A++', value: 1.3 }
  ];

  useEffect(() => {
    // Apply font size to the article content class
    const content = document.querySelector('.article-content');
    if (content) {
      (content as HTMLElement).style.fontSize = `${fontSize * 100}%`;
    }
  }, [fontSize]);

  return (
    <div className="flex items-center gap-3 rounded-full border border-gray-200/80 bg-white/90 px-2 py-1.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="pl-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
        Teks
      </div>
      <div className="flex items-center gap-1 rounded-full bg-gray-100/80 p-1 dark:bg-white/[0.04]">
        {sizes.map((s) => (
          <button
            key={s.value}
            onClick={() => setFontSize(s.value)}
            className={cn(
              "px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] rounded-full transition-all",
              fontSize === s.value 
                ? "bg-white text-brand-red shadow-sm dark:bg-slate-900 dark:text-white" 
                : "text-gray-400 hover:text-brand-black dark:hover:text-white"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
