'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface BreakingNewsTickerProps {
  news?: string[];
}

export default function BreakingNewsTicker({ 
  news = [
    "Sri Mulyani Paparkan Strategi Fiskal 2026 di Hadapan DPR",
    "Rupiah Menguat ke Level Rp 15.200 per Dolar AS Pagi Ini",
    "Timnas Indonesia Siap Hadapi Laga Krusial di Kualifikasi Piala Dunia",
    "Pemerintah Resmi Luncurkan Program Insentif Kendaraan Listrik Tahap II"
  ] 
}: BreakingNewsTickerProps) {
  return (
    <div className="flex h-9 max-w-full items-center overflow-hidden text-white sm:h-10 lg:h-11">
      <div className="my-1 ml-1 flex h-[calc(100%-8px)] shrink-0 items-center gap-1 rounded-r-md bg-brand-red px-2 shadow-[4px_0_10px_rgba(0,0,0,0.12)] sm:gap-1.5 sm:px-2.5 lg:px-3">
        <Zap size={12} className="fill-white animate-pulse sm:size-[13px]" />
        <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.1em] sm:text-[10px] sm:tracking-[0.12em]">Breaking News</span>
      </div>
      <div className="relative flex h-full min-w-0 flex-1 items-center overflow-hidden group">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-brand-black to-transparent sm:w-12 lg:w-16 dark:from-[#020617]" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-brand-black to-transparent sm:w-12 lg:w-16 dark:from-[#020617]" />

        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute inset-y-0 left-0 flex h-full min-w-max items-center gap-7 whitespace-nowrap pl-8 pr-4 will-change-transform sm:gap-9 sm:pl-12 sm:pr-5 lg:gap-12 lg:pl-16 lg:pr-6"
        >
          {news.map((item, i) => (
            <div key={i} className="flex items-center gap-7 sm:gap-9 lg:gap-12">
              <span className="cursor-pointer text-[11px] font-semibold tracking-tight text-white/90 transition-colors hover:text-brand-red sm:text-[12px] lg:text-[13px]">
                {item}
              </span>
              <span className="h-1 w-1 rounded-full bg-brand-red sm:h-1.5 sm:w-1.5" />
            </div>
          ))}
          {news.map((item, i) => (
            <div key={`dup-${i}`} aria-hidden="true" className="flex items-center gap-7 sm:gap-9 lg:gap-12">
              <span className="cursor-pointer text-[11px] font-semibold tracking-tight text-white/90 transition-colors hover:text-brand-red sm:text-[12px] lg:text-[13px]">
                {item}
              </span>
              <span className="h-1 w-1 rounded-full bg-brand-red sm:h-1.5 sm:w-1.5" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
