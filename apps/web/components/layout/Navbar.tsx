'use client';

import { Search, Menu, User as UserIcon, Bell, Globe, Moon, Sun, FileText, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SmartImage } from '../ui/SmartImage';
import DateTimeWeather from '../ui/DateTimeWeather';
import { cn } from '../../lib/utils';
import { useRouter, usePathname } from 'next/navigation';

interface NavbarProps {
  siteConfig: any;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onSearchClick?: () => void;
}

import { useAuthStore } from '../../store/authStore';

export default function Navbar({
  siteConfig,
  categories,
  selectedCategory,
  setSelectedCategory,
  onSearchClick,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const { user, logout } = useAuthStore();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    // Navigate to homepage with category param
    const site = pathname.split('/')[1] || 'pusat';
    router.push(`/${site}?cat=${encodeURIComponent(cat)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-main)] border-b border-gray-100 dark:border-white/5 shadow-sm transition-all duration-500">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between border-b border-gray-50 uppercase tracking-[0.15em] text-[9px] font-bold text-brand-text-muted">
        <div className="flex items-center gap-5">
          <span className="hidden sm:flex items-center gap-1.5 hover:text-brand-red transition-colors cursor-pointer">
            <Globe size={11} /> Global Edition
          </span>
          <div className="hidden sm:block w-px h-3 bg-gray-200" />
          <DateTimeWeather />
        </div>
        <div className="hidden lg:flex items-center gap-5">
          <Link href="/arsip" className="hover:text-brand-red transition-colors">Arsip</Link>
          <Link href="/bantuan" className="hover:text-brand-red transition-colors">Bantuan</Link>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 min-h-[5.5rem] sm:h-24 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Left: Search (Desktop Only) */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onSearchClick}
            className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-brand-black dark:text-white"
            aria-label="Cari berita"
          >
            <Search size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Center: Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0"
        >
          <Link href="/" className="flex flex-col items-center group">
            {siteConfig?.logoUrl ? (
              <div className="relative h-12 w-48 mb-1">
                <SmartImage 
                  src={siteConfig.logoUrl} 
                  alt={siteConfig.name} 
                  fill 
                  context="logo"
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.04em] leading-none text-center">
                <span className="text-brand-red group-hover:text-brand-red/90 transition-colors">BERITA</span>
                <span className="text-brand-black group-hover:opacity-90 transition-opacity">KARYA</span>
              </h1>
            )}
            <span className="text-[8px] sm:text-[9px] tracking-[0.35em] sm:tracking-[0.5em] font-bold text-brand-text-muted mt-1 uppercase transition-all group-hover:tracking-[0.6em] text-center max-w-[280px]">
              Jernih Melihat Nusantara
            </span>
          </Link>
        </motion.div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-3 md:gap-5">
          <button 
            aria-label="Notifikasi"
            className="hidden xl:flex p-2 text-brand-text-muted hover:text-brand-black transition-colors"
          >
            <Bell size={20} strokeWidth={1.2} />
          </button>
            
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 text-brand-text-muted hover:text-brand-black transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline truncate max-w-[80px]">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-lg shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-50 dark:border-white/5">
                      <p className="text-xs font-bold text-brand-black dark:text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      {['superadmin', 'wapimred', 'reporter', 'kontributor'].includes(user.role) && (
                        <Link 
                          href={`/${pathname.split('/')[1] || 'pusat'}/dashboard`}
                          className="block px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:text-brand-red hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5 rounded-md transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-brand-red hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors mt-1"
                      >
                        Keluar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link 
              href="/login"
              className="flex items-center gap-2 p-2 text-brand-text-muted hover:text-brand-black transition-colors"
            >
              <UserIcon size={20} strokeWidth={1.2} />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Masuk</span>
            </Link>
          )}
          
          <div className="w-px h-6 bg-gray-200 hidden md:block" />

          <button 
            className="p-2 text-brand-text-muted hover:text-brand-black transition-colors" 
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={20} strokeWidth={1.5} /> : <Sun size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="max-w-7xl mx-auto px-4 hidden md:flex items-center justify-center h-14 border-t border-gray-50 dark:border-white/5 gap-10 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-text-muted">
        {categories.map((cat, index) => {
          const isActive = selectedCategory === cat;
          return (
            <motion.button 
              key={cat} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCategoryClick(cat)}
              className={cn(
                "hover:text-brand-red dark:hover:text-white transition-all relative py-2 group flex items-center gap-1",
                isActive ? "text-brand-black dark:text-white font-extrabold" : "text-gray-400 dark:text-gray-500"
              )}
            >
              {cat === 'Tersimpan' && (
                <Bookmark 
                  size={12} 
                  className={cn(
                    "transition-colors",
                    isActive ? "text-brand-red fill-brand-red/20" : "text-gray-400 dark:text-gray-500 group-hover:text-brand-red"
                  )} 
                />
              )}
              <span>{cat}</span>
              {isActive && (
                <motion.span 
                  layoutId="activeCategoryLine"
                  className="absolute -bottom-0.5 left-0 h-[3px] bg-brand-red w-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {!isActive && (
                <span className="absolute -bottom-0.5 left-0 h-[3px] bg-brand-red w-0 transition-all duration-300 group-hover:w-full" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Mobile Navigation (Horizontal Scroll) */}
      <nav className="md:hidden max-w-7xl mx-auto border-t border-gray-50 dark:border-white/5 flex gap-2 overflow-x-auto pb-3 pt-2 px-3 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={cn(
                "shrink-0 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all flex items-center gap-1",
                isActive
                  ? "border-brand-red bg-brand-red/10 text-brand-red dark:text-white"
                  : "border-gray-200 dark:border-white/10 text-brand-text-muted dark:text-gray-400"
              )}
            >
              {cat === 'Tersimpan' && (
                <Bookmark 
                  size={10} 
                  className={isActive ? "text-brand-red fill-brand-red/20" : "text-gray-400 dark:text-gray-500"} 
                />
              )}
              <span>{cat}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}