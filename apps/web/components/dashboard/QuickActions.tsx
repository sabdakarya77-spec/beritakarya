'use client';

import { Plus, Tag, Settings, ShieldCheck, Users, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../lib/utils';

interface QuickActionsProps {
  site: string;
  userRole?: string;
}

export function QuickActions({ site, userRole }: QuickActionsProps) {
  const actions = [
    { label: 'Tulis Post Berita', href: `/${site}/dashboard/articles/new`, icon: Plus, color: 'bg-brand-red text-white hover:bg-red-700', roles: ['superadmin', 'wapimred', 'reporter', 'kontributor'] },
    { label: 'Kelola Kategori', href: `/${site}/dashboard/categories`, icon: Tag, color: 'bg-gray-50 dark:bg-white/5 text-brand-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10', roles: ['superadmin', 'wapimred'] },
    { label: 'Review Antrean', href: `/${site}/dashboard/review`, icon: Eye, color: 'bg-gray-50 dark:bg-white/5 text-brand-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10', roles: ['superadmin', 'wapimred'] },
    { label: 'Verifikasi KYC', href: `/${site}/dashboard/review/kyc`, icon: ShieldCheck, color: 'bg-gray-50 dark:bg-white/5 text-brand-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10', roles: ['superadmin'] },
    { label: 'Manajemen Tim', href: `/${site}/dashboard/users`, icon: Users, color: 'bg-gray-50 dark:bg-white/5 text-brand-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10', roles: ['superadmin'] },
    { label: 'Pengaturan Situs', href: `/${site}/dashboard/settings`, icon: Settings, color: 'bg-gray-50 dark:bg-white/5 text-brand-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10', roles: ['superadmin'] },
  ].filter(item => item.roles.includes(userRole || ''));

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-label">Aksi Cepat</h3>
      </div>
      <div className="p-4 space-y-2">
        {actions.map(item => (
          <Link
            key={item.label}
            href={item.href}
            className={cn('flex items-center gap-3 px-4 py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all', item.color)}
          >
            <item.icon size={14} /> {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
