'use client';

import React from 'react';
import { Home, Search, Menu, Bookmark, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface MobileBottomNavProps {
  site?: string;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
}

export default function MobileBottomNav({ site = 'pusat', onSearchClick, onMenuClick }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      href: `/${site}`,
      active: pathname === `/${site}` || pathname === `/${site}/`,
    },
    {
      label: 'Search',
      icon: Search,
      onClick: onSearchClick,
      active: false,
    },
    {
      label: 'Kategori',
      icon: Menu,
      onClick: onMenuClick,
      active: false,
    },
    {
      label: 'Saved',
      icon: Bookmark,
      href: `/${site}?cat=Saved`,
      active: pathname.includes('cat=Saved'),
    },
    {
      label: 'Dashboard',
      icon: User,
      href: `/${site}/dashboard`,
      active: pathname.includes('/dashboard'),
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md md:hidden">
      <div className="bg-white/80 dark:bg-slate-900/85 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-2xl px-3 py-2 flex items-center justify-around">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.active;

          const content = (
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl cursor-pointer relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-brand-red/10 dark:bg-brand-red/20 rounded-xl -z-10"
                />
              )}
              <Icon
                size={20}
                className={isActive ? 'text-brand-red stroke-[2.5]' : 'text-gray-400 dark:text-gray-500 hover:text-brand-red transition-colors'}
              />
              <span
                className={`text-[9px] font-black uppercase tracking-wider ${
                  isActive ? 'text-brand-red font-black' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </motion.div>
          );

          if (item.href) {
            return (
              <Link key={index} href={item.href} className="flex-1 flex justify-center">
                {content}
              </Link>
            );
          }

          return (
            <button
              key={index}
              onClick={item.onClick}
              className="flex-1 flex justify-center focus:outline-none"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
