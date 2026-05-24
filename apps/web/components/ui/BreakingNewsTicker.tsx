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
    <div className="flex h-10 items-center overflow-hidden text-white">
      <div className="flex h-full shrink-0 items-center gap-2 bg-brand-red px-4 shadow-[4px_0_12px_rgba(0,0,0,0.15)]">
        <Zap size={14} className="fill-white animate-pulse" />
        <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.18em]">Breaking News</span>
      </div>
      <div className="relative flex h-full flex-1 items-center overflow-hidden group">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-brand-black to-transparent dark:from-[#020617]" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-brand-black to-transparent dark:from-[#020617]" />

        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex h-full w-max items-center gap-12 whitespace-nowrap pl-16 pr-6"
        >
          {news.map((item, i) => (
            <div key={i} className="flex items-center gap-12">
              <span className="cursor-pointer text-[13px] font-semibold tracking-tight text-white/90 transition-colors hover:text-brand-red">
                {item}
              </span>
              <span className="w-1.5 h-1.5 bg-brand-red rounded-full" />
            </div>
          ))}
          {news.map((item, i) => (
            <div key={`dup-${i}`} className="flex items-center gap-12">
              <span className="cursor-pointer text-[13px] font-semibold tracking-tight text-white/90 transition-colors hover:text-brand-red">
                {item}
              </span>
              <span className="w-1.5 h-1.5 bg-brand-red rounded-full" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
