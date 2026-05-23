'use client';

import { BarChart3, TrendingUp, FileText, ShieldCheck, Activity } from 'lucide-react';
import Link from 'next/link';
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
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Selamat');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam');
    setCurrentDate(new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' }));
  }, []);

  useEffect(() => {
    if (user?.role === 'advertiser') {
      setLoading(false);
      return;
    }
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

        if (user?.role === 'superadmin') {
          try {
            const [kycRes, auditRes] = await Promise.all([
              api.get('/kyc', { params: { status: 'pending', limit: 5 } }),
              api.get('/audit', { params: { limit: 5 } })
            ]);
            setKycRequests(kycRes.data.data || []);
            setAuditLogs(auditRes.data.data?.items || []);
          } catch (err) {
            console.error('Failed to load admin stats:', err);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [site, user]);

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
    superadmin: 'Pimred (CEO) / Admin IT',
    wapimred: 'Wakil Pemimpin Redaksi (Wapimred)',
    reporter: 'Reporter',
    kontributor: 'Kontributor',
  };
  const supportEmail = 'support.beritakarya@gmail.com';
  const supportSubject = encodeURIComponent(`Bantuan Dashboard ${site}`);

  if (user?.role === 'advertiser') {
    return (
      <AdvertiserDashboardOverview 
        greeting={greeting}
        userName={user?.name || 'Mitra Bisnis'}
        site={site}
        currentDate={currentDate}
      />
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader 
        greeting={greeting}
        roleLabel={ROLE_LABELS[user?.role || 'reporter']}
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
          {user?.role === 'superadmin' && (
            <>
              <KYCRequestsWidget requests={kycRequests} site={site} />
              <AuditLogsWidget logs={auditLogs} site={site} />
            </>
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
            <a
              href={`mailto:${supportEmail}?subject=${supportSubject}`}
              className="w-full py-2.5 bg-brand-red text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all inline-flex items-center justify-center"
            >
              Hubungi Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdvertiserDashboardOverview({ greeting, userName, site, currentDate }: { greeting: string, userName: string, site: string, currentDate: string }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-red text-white flex items-center justify-center shadow-lg shadow-brand-red/20">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-brand-black dark:text-white tracking-tight">
              {greeting}, {userName}!
            </h1>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Portal Mitra Pengiklan BeritaKarya di <strong className="text-brand-red">{site === 'pusat' ? 'Pusat' : site}</strong>
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5">
            {currentDate}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-card p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest relative z-10">Iklan Aktif</p>
          <p className="text-3xl font-black text-brand-black dark:text-white tabular-nums relative z-10">0</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest relative z-10">Sewa Slot Aktif</p>
        </div>
        <div className="dash-card p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest relative z-10">Total Impresi</p>
          <p className="text-3xl font-black text-brand-black dark:text-white tabular-nums relative z-10">0</p>
          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest relative z-10">Views Terhitung</p>
        </div>
        <div className="dash-card p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest relative z-10">Total Klik</p>
          <p className="text-3xl font-black text-brand-black dark:text-white tabular-nums relative z-10">0</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest relative z-10">Direct Link Clicks</p>
        </div>
        <div className="dash-card p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest relative z-10">Rata-rata CTR</p>
          <p className="text-3xl font-black text-brand-black dark:text-white tabular-nums relative z-10">0.00%</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest relative z-10">Click Through Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="dash-card p-8 bg-gradient-to-br from-brand-red/5 via-transparent to-brand-red/5 border-brand-red/10">
            <h3 className="text-lg font-serif font-black text-brand-black dark:text-white uppercase tracking-tight mb-4">
              Selamat Bergabung di Platform Iklan Mandiri!
            </h3>
            <p className="text-xs text-brand-text-muted leading-relaxed mb-6 font-semibold">
              Terima kasih telah mempercayakan promosi bisnis Anda kepada BeritaKarya Nusantara. Saat ini, tim pengembang kami sedang melakukan integrasi modul pembayaran otomatis dan penentuan tarif regional dinamis berbasis jangkauan pembaca.
            </p>
            
            {/* Timeline Process */}
            <div className="space-y-6 mt-8">
              <h4 className="text-[10px] font-black text-brand-black dark:text-white uppercase tracking-widest">Tahapan Alur Pemasangan Iklan</h4>
              <div className="relative border-l border-gray-100 dark:border-white/5 pl-6 ml-3 space-y-8">
                <div className="relative">
                  <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-emerald-500/20">✓</div>
                  <h5 className="text-xs font-black text-brand-black dark:text-white uppercase tracking-tight mb-1">Daftarkan Akun Pengiklan</h5>
                  <p className="text-[10px] text-gray-400 leading-relaxed">Profil bisnis Anda telah sukses terdaftar di jaringan BeritaKarya.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-brand-red/20">2</div>
                  <h5 className="text-xs font-black text-brand-black dark:text-white uppercase tracking-tight mb-1">Pilih Regional & Slot Iklan</h5>
                  <p className="text-[10px] text-gray-400 leading-relaxed">Pilih subdomain regional target dan tentukan slot (Leaderboard atas atau banner di dalam artikel paragraf ke-3) sesuai segmentasi pasar Anda.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-gray-200 dark:bg-white/5 text-gray-400 flex items-center justify-center text-[10px] font-black">3</div>
                  <h5 className="text-xs font-black text-brand-black dark:text-white uppercase tracking-tight mb-1">Unggah Media (Gambar/Video) & Lakukan Pembayaran</h5>
                  <p className="text-[10px] text-gray-400 leading-relaxed">Unggah file materi promosi berupa gambar statis, animasi GIF, atau video klip MP4 resolusi tinggi, kemudian selesaikan transaksi secara otomatis.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-gray-200 dark:bg-white/5 text-gray-400 flex items-center justify-center text-[10px] font-black">4</div>
                  <h5 className="text-xs font-black text-brand-black dark:text-white uppercase tracking-tight mb-1">Verifikasi Kilat & Iklan Mengudara</h5>
                  <p className="text-[10px] text-gray-400 leading-relaxed">Tim redaksi akan melakukan peninjauan konten secara instan untuk kelayakan sebelum iklan Anda otomatis ditayangkan di domain regional pilihan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Help Center */}
          <div className="dash-card p-6 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
            <h4 className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest mb-3">Butuh Bantuan Segera?</h4>
            <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80 leading-relaxed mb-4 font-bold uppercase tracking-wider">
              Ingin memesan iklan secara khusus, kerja sama tahunan, atau butuh bantuan pendaftaran manual? Layanan bantuan kami siap melayani Anda 24/7.
            </p>
            <a 
              href="https://wa.me/628123456789" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Hubungi Marketing (WA)
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}

function KYCRequestsWidget({ requests, site }: { requests: any[]; site: string }) {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-brand-red" />
          <h3 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-tight">
            Antrean Verifikasi KYC Reporter/Kontributor ({requests.length})
          </h3>
        </div>
        <Link
          href={`/${site}/dashboard/review/kyc`}
          className="text-[10px] font-black uppercase tracking-widest text-brand-red hover:underline"
        >
          Lihat Semua →
        </Link>
      </div>
      <div className="p-6 divide-y divide-gray-50 dark:divide-white/5">
        {requests.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">Tidak ada pengajuan verifikasi KYC baru.</p>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black text-brand-black dark:text-white uppercase tracking-tight">{req.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{req.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
                  {req.kycSubmittedAt ? new Date(req.kycSubmittedAt).toLocaleDateString('id-ID') : '-'}
                </span>
                <Link
                  href={`/${site}/dashboard/review/kyc/${req.id}`}
                  className="px-3 py-1.5 bg-brand-red text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-700 rounded transition-colors"
                >
                  Review
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AuditLogsWidget({ logs, site }: { logs: any[]; site: string }) {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-brand-red" />
          <h3 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-tight">
            Log Aktivitas Sistem Terkini
          </h3>
        </div>
      </div>
      <div className="p-6 divide-y divide-gray-50 dark:divide-white/5">
        {logs.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">Tidak ada log aktivitas.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-brand-black dark:text-white">
                  <span className="font-black uppercase tracking-wider text-[10px] text-brand-red mr-1.5">{log.action}</span>
                  {log.user?.name || log.userId}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Entity: {log.entityType || '-'} ({log.entityId || '-'})</p>
              </div>
              <span className="text-[9px] font-bold text-gray-400 tabular-nums">
                {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
