'use client';

import { Link as LinkIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SiFacebook, SiTelegram, SiWhatsapp, SiX } from 'react-icons/si';
import { getArticleShareItems } from '../../lib/articleShare';

interface ShareSidebarProps {
  title: string;
  url?: string;
}

export default function ShareSidebar({ title, url }: ShareSidebarProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) setShow(true);
      else setShow(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareItems = getArticleShareItems(title, shareUrl);
  const iconMap = {
    Facebook: SiFacebook,
    X: SiX,
    Telegram: SiTelegram,
    WhatsApp: SiWhatsapp,
  } as const;
  const hoverMap = {
    Facebook: 'hover:text-[#1877F2]',
    X: 'hover:text-white',
    Telegram: 'hover:text-[#229ED9]',
    WhatsApp: 'hover:text-[#25D366]',
  } as const;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 z-40 bg-white p-3 border border-gray-100 shadow-sm rounded-full"
        >
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 -rotate-90 mb-4 h-12 flex items-center">Share</span>
          {shareItems.map((item) => {
            const Icon = iconMap[item.label];

            return (
            <a 
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("p-3 text-gray-400 transition-colors rounded-full hover:bg-gray-50", hoverMap[item.label])}
              title={`Bagikan ke ${item.label}`}
            >
              <Icon size={18} />
            </a>
            );
          })}
          <button 
            onClick={copyToClipboard}
            className={cn(
              "p-3 transition-colors rounded-full",
              isCopied ? "bg-green-500 text-white" : "text-gray-400 hover:text-brand-red hover:bg-gray-50"
            )}
            title="Salin Tautan"
          >
            <LinkIcon size={20} strokeWidth={1.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
