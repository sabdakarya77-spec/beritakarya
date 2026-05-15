'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { RealTimePulse } from './RealTimePulse';

interface DashboardHeaderProps {
  greeting: string;
  roleLabel: string;
  userName: string;
  site: string;
  currentDate: string;
}

export function DashboardHeader({ greeting, roleLabel, userName, site, currentDate }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{greeting},</span>
          <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">
            {roleLabel}
          </span>
        </div>
        <h1 className="text-2xl font-black text-brand-black dark:text-white tracking-tight">
          {userName}
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Portal <strong className="text-brand-red uppercase">{site}</strong> — {currentDate}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <RealTimePulse />
        <Link 
          href={`/${site}/dashboard/articles/new`}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white text-[11px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-brand-red/20"
        >
          <Plus size={15} /> Post Berita
        </Link>
      </div>
    </div>
  );
}
