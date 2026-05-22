'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Globe, Bookmark, Clock, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { CategoryItem } from '../../lib/constants';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  siteConfig: any;
  selectedCategory: string;
  onCategoryClick: (slug: string) => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  categories,
  siteConfig,
  selectedCategory,
  onCategoryClick,
}: MobileMenuProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleCategoryClick = (slug: string) => {
    onCategoryClick(slug);
    const site = pathname.split('/')[1] || 'pusat';
    router.push(`/${site}?cat=${encodeURIComponent(slug)}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
          />

          {/* Menu Content */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-slate-950 z-[101] md:hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="font-serif text-xl font-black tracking-tight text-brand-black dark:text-white">
                  <span className="text-brand-red">BERITA</span>KARYA
                </h2>
                <span className="text-[9px] font-bold text-brand-text-muted uppercase tracking-widest mt-0.5">
                  Menu Navigasi
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              {/* Profile / Auth Section */}
              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Akun Saya</h3>
                {user ? (
                  <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-brand-black dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['superadmin', 'wapimred', 'reporter', 'kontributor'].includes(user.role) && (
                        <Link 
                          href="/pusat/dashboard" 
                          onClick={onClose}
                          className="flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300"
                        >
                          <User size={14} /> Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={() => { logout(); onClose(); }}
                        className="flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider text-brand-red"
                      >
                        <LogOut size={14} /> Keluar
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    onClick={onClose}
                    className="flex items-center justify-between p-4 bg-brand-red text-white rounded-2xl shadow-lg shadow-brand-red/20"
                  >
                    <div className="flex items-center gap-3">
                      <User size={20} />
                      <span className="text-sm font-bold uppercase tracking-wider">Masuk / Daftar</span>
                    </div>
                    <ChevronRight size={18} />
                  </Link>
                )}
              </section>

              {/* Categories Section */}
              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Kategori Berita</h3>
                <div className="grid grid-cols-1 gap-1">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.slug;
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => handleCategoryClick(cat.slug)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl transition-all group",
                          isActive 
                            ? "bg-brand-red/10 text-brand-red" 
                            : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {cat.slug === 'tersimpan' ? <Bookmark size={18} /> : <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-brand-red" : "bg-gray-300")} />}
                          <span className="text-sm font-bold uppercase tracking-wider">{cat.name}</span>
                        </div>
                        <ChevronRight size={16} className={cn("transition-transform", isActive ? "rotate-90" : "group-hover:translate-x-1")} />
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Extras Section */}
              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Lainnya</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Globe size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Global Edition</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Clock size={18} />
                    <Link href="/arsip" onClick={onClose} className="text-sm font-bold uppercase tracking-wider">Arsip Berita</Link>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                © {new Date().getFullYear()} BERITA KARYA.<br />
                Jernih Melihat Nusantara.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
