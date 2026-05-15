'use client';

import { BarChart3, TrendingUp, FileText } from 'lucide-react';
import TrafficChart from '../../../components/dashboard/TrafficChart';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Skeleton from '../../../components/ui/Skeleton';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

// Components
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader';
import { KPICards } from '../../../components/dashboard/KPICards';
import { DashboardStats } from '../../../components/dashboard/DashboardStats';
import { ReviewQueue } from '../../../components/dashboard/ReviewQueue';
import { RecentActivity } from '../../../components/dashboard/RecentActivity';
import { CategoryPerformance } from '../../../components/dashboard/CategoryPerformance';
import { TopContent } from '../../../components/dashboard/TopContent';
import { QuickActions } from '../../../components/dashboard/QuickActions';

// ─── Types ──────────────────────────────────────────────────────
interface Article {
  id: string;
  title: string;
  status: string;
  category?: { name: string };
  author?: { name: string };
  publishedAt?: string;
  createdAt: string;
  viewCount?: number;
}

export default function DashboardOverview() {
  const { site } = useParams() as { site: string };
  const { user } = useAuthStore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [topContent, setTopContent] = useState<any[]>([]);
  const [engagementStats, setEngagementStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Selamat');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam');
    setCurrentDate(new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' }));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [artRes, trafficRes, topRes, engRes] = await Promise.all([
          api.get('/articles', { params: { limit: 50 } }),
          api.get('/analytics/traffic', { params: { days: 7 } }),
          api.get('/analytics/top-content', { params: { limit: 5 } }),
          api.get('/analytics/engagement')
        ]);
        
        setArticles(artRes.data.data.articles || artRes.data.data.items || []);
        setTrafficData(trafficRes.data.data);
        setTopContent(topRes.data.data);
        setEngagementStats(engRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [site]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton variant="text" className="h-8 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} variant="text" className="h-36 w-full rounded-lg" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><Skeleton variant="text" className="h-72 w-full rounded-lg" /></div>
          <Skeleton variant="text" className="h-72 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Computed stats
  const total       = articles.length;
  const published   = articles.filter(a => a.status === 'published').length;
  const drafts      = articles.filter(a => a.status === 'draft').length;
  const inReview    = articles.filter(a => a.status === 'review' || a.status === 'submitted').length;
  const scheduled   = articles.filter(a => a.status === 'scheduled').length;
  const totalViews  = articles.reduce((s, a) => s + (a.viewCount || 0), 0);

  const reviewQueue   = articles.filter(a => a.status === 'review' || a.status === 'submitted').slice(0, 4);
  const recentActivityList = [...articles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  // Category breakdown
  const catMap: Record<string, number> = {};
  articles.forEach(a => {
    const cat = a.category?.name || 'Umum';
    catMap[cat] = (catMap[cat] || 0) + 1;
  });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const catMax = catEntries[0]?.[1] || 1;

  // Sparkline data from real traffic
  const trafficSpark = trafficData.length > 0 ? trafficData.map(d => d.views) : [0,0,0,0,0,0,0];
  const publishedSpark = trafficData.length > 0 ? trafficData.map(d => Math.floor(d.views / 20)) : [0,0,0,0,0,0,0];

  const ROLE_LABELS: Record<string, string> = {
    superadmin: 'Superadmin',
    wapimred: 'Wapimred',
    journalist: 'Wartawan',
  };

  return (
    <div className="space-y-8">
      <DashboardHeader 
        greeting={greeting}
        roleLabel={ROLE_LABELS[user?.role || 'journalist']}
        userName={user?.name || 'Redaktur'}
        site={site}
        currentDate={currentDate}
      />

      <KPICards 
        stats={{ total, published, inReview, scheduled }}
        trafficSpark={trafficSpark}
        publishedSpark={publishedSpark}
      />

      {(user?.role === 'superadmin' || user?.role === 'wapimred') && (
        <DashboardStats 
          published={published}
          drafts={drafts}
          totalViews={totalViews}
        />
      )}

      <div className="dash-card">
        <div className="dash-card-header">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-brand-red" />
            <h3 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-tight">Ikhtisar Trafik</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-red">Real-time</span>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="dash-label mb-1">Total Views (7 Hari)</p>
              <p className="text-4xl font-black text-brand-black dark:text-white tabular-nums">
                {trafficData.reduce((acc, curr) => acc + curr.views, 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <p className="dash-label mb-1">Sumber Trafik Utama</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded">Direct</span>
                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase rounded">Google</span>
                <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase rounded">Social</span>
              </div>
            </div>
            <div>
              <p className="dash-label mb-1">Engagement Rate</p>
              <p className="text-xl font-black text-brand-black dark:text-white tabular-nums flex items-center gap-2">
                {engagementStats ? `${engagementStats.rate}%` : '0%'}
                {engagementStats && engagementStats.rate > 2 ? (
                  <TrendingUp size={16} className="text-emerald-500" />
                ) : (
                  <TrendingUp size={16} className="text-gray-300" />
                )}
              </p>
            </div>
          </div>
          <TrafficChart data={trafficData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {(user?.role === 'superadmin' || user?.role === 'wapimred') && (
            <ReviewQueue articles={reviewQueue} site={site} count={inReview} />
          )}
          <RecentActivity articles={recentActivityList} site={site} />
        </div>

        <div className="space-y-6">
          <CategoryPerformance catEntries={catEntries} catMax={catMax} />
          <TopContent topContent={topContent} site={site} />
          <QuickActions site={site} userRole={user?.role} />
          
          <div className="dash-card p-6 text-center bg-gradient-to-br from-brand-red/5 to-violet-500/5 border-brand-red/10">
            <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText size={16} className="text-brand-red" />
            </div>
            <p className="text-xs font-black text-brand-black dark:text-white uppercase tracking-tight mb-1">Bantuan Redaksi</p>
            <p className="text-[10px] text-gray-400 leading-relaxed mb-4">
              Kendala teknis atau pertanyaan editorial? Tim kami siap membantu.
            </p>
            <button className="w-full py-2.5 bg-brand-red text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all">
              Hubungi Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}