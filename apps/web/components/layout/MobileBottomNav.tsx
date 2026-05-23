'use client';

import React from 'react';
import { Home, Search, Menu, Bookmark, User, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useSavedArticles } from '../../hooks/useSavedArticles';

interface MobileBottomNavProps {
  site?: string;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
  selectedCategory?: string;
}

type LinkNavItem = {
  kind: 'link';
  label: string;
  icon: LucideIcon;
  href: string;
  active: boolean;
};

type ActionNavItem = {
  kind: 'action';
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  active: boolean;
};

type NavItem = LinkNavItem | ActionNavItem;

export default function MobileBottomNav({ site = 'pusat', onSearchClick, onMenuClick, selectedCategory }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { count: savedArticlesCount } = useSavedArticles(site);
  const hasDashboardAccess = !!user && user.role !== 'reader';
  const accountItem: LinkNavItem = hasDashboardAccess
    ? {
        kind: 'link',
        label: 'Dashboard',
        icon: User,
        href: `/${site}/dashboard`,
        active: pathname.includes('/dashboard'),
      }
    : {
        kind: 'link',
        label: 'Masuk',
        icon: User,
        href: '/login',
        active: pathname === '/login',
      };

  const navItems: NavItem[] = [
    {
      kind: 'link',
      label: 'Home',
      icon: Home,
      href: `/${site}`,
      active: (pathname === `/${site}` || pathname === `/${site}/`) && selectedCategory !== 'tersimpan',
    },
    {
      kind: 'action',
      label: 'Search',
      icon: Search,
      onClick: onSearchClick,
      active: false,
    },
    {
      kind: 'action',
      label: 'Kategori',
      icon: Menu,
      onClick: onMenuClick,
      active: false,
    },
    {
      kind: 'link',
      label: 'Tersimpan',
      icon: Bookmark,
      href: `/${site}?cat=tersimpan`,
      active: selectedCategory === 'tersimpan',
    },
    accountItem,
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
                className={`text-[11px] font-semibold ${
                  isActive ? 'text-brand-red' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {item.label}
              </span>
              {item.kind === 'link' && item.label === 'Tersimpan' && savedArticlesCount > 0 && (
                <span className="absolute top-0 right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-brand-red px-1 py-0.5 text-[8px] font-black tracking-normal text-white">
                  {savedArticlesCount}
                </span>
              )}
            </motion.div>
          );

          if (item.kind === 'link') {
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
