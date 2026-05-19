import { SITE_MAP } from '@beritakarya/config'
import NewsCard from '../ui/NewsCard'
import PublicSiteLayout from '../layout/PublicSiteLayout'
import AdSpace from '../ui/AdSpace'
import Link from 'next/link'
import { TrendingUp, Zap, Star, Send } from 'lucide-react'
import LoadMoreArticles from '../ui/LoadMoreArticles'
import VideoWidget from '../ui/VideoWidget'
import NewsletterForm from '../ui/NewsletterForm'
import { PremiumHero } from '../berita/PremiumHero'
import { MagazineBentoHero } from '../berita/MagazineBentoHero'
import { notFound } from 'next/navigation'
import ScrollAnimate from '../ui/ScrollAnimate'

type SearchParams = {
  cat?: string
  q?: string
}

type SiteHomePageProps = {
  siteParam: string
  searchParams: SearchParams
}

async function getArticles(siteId: string, category?: string, search?: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    let url = `${apiUrl}/api/v1/articles/public?site=${siteId}&limit=25`

    if (category && category !== 'Terbaru' && category !== 'Tersimpan') {
      url += `&category=${encodeURIComponent(category)}`
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }

    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const json = await res.json()
    return json?.data?.articles || json?.data?.items || []
  } catch (e) {
    console.error('Error fetching articles:', e)
    return []
  }
}

async function getSiteSettings(siteId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/api/v1/sites/settings?site=${siteId}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json?.data || null
  } catch (e) {
    console.error('Error fetching site settings:', e)
    return null
  }
}

export async function SiteHomePage({ siteParam, searchParams }: SiteHomePageProps) {
  const resolvedSearchParams = await searchParams
  const categoryFilter = resolvedSearchParams?.cat || 'Terbaru'
  const searchQuery = resolvedSearchParams?.q || ''

  const siteSettings = await getSiteSettings(siteParam)

  if (!siteSettings && siteParam !== 'pusat') {
    notFound()
  }

  const siteConfig = {
    id: siteParam,
    name:
      siteSettings?.name || (SITE_MAP[siteParam] as any)?.name ||
      (siteParam.charAt(0).toUpperCase() + siteParam.slice(1)),
    domain:
      siteSettings?.domain || (SITE_MAP[siteParam] as any)?.domain ||
      `${siteParam}.beritakarya.co`,
    description: siteSettings?.description || (SITE_MAP[siteParam] as any)?.description || `Portal berita resmi ${siteParam}. Menyajikan informasi terbaru, investigasi, dan analisis tajam dari seluruh Nusantara.`,
    logoUrl: siteSettings?.logoUrl || (SITE_MAP[siteParam] as any)?.logoUrl || null,
    footerText: siteSettings?.footerText || (SITE_MAP[siteParam] as any)?.footerText || `© ${new Date().getFullYear()} BERITA KARYA. ALL RIGHTS RESERVED.`,
    address: siteSettings?.address || (SITE_MAP[siteParam] as any)?.address || "Jl. Merdeka No. 123, Jakarta Pusat, Indonesia",
    contactEmail: siteSettings?.contactEmail || (SITE_MAP[siteParam] as any)?.contactEmail || "support.beritakarya@gmail.com",
    phone: siteSettings?.phone || (SITE_MAP[siteParam] as any)?.phone || null,
    aboutUs: siteSettings?.aboutUs || (SITE_MAP[siteParam] as any)?.aboutUs || null,
    codeOfEthics: siteSettings?.codeOfEthics || (SITE_MAP[siteParam] as any)?.codeOfEthics || null,
    editorial: siteSettings?.editorial || (SITE_MAP[siteParam] as any)?.editorial || null,
    advertising: siteSettings?.advertising || (SITE_MAP[siteParam] as any)?.advertising || null,
    socialLinks: siteSettings?.socialLinks || (SITE_MAP[siteParam] as any)?.socialLinks || { facebook: '', twitter: '', instagram: '', youtube: '' },
    appearance: siteSettings?.appearance || (SITE_MAP[siteParam] as any)?.appearance || { primaryColor: '#e11d48' },
    devDomain: (SITE_MAP[siteParam] as any)?.devDomain || `${siteParam}.localhost:3000`
  }

  const articlesList = await getArticles(siteConfig.id, categoryFilter, searchQuery)
  const topBentoStories = articlesList.slice(0, 4)
  const minimalStories = articlesList.slice(4, 8)
  const editorChoice = articlesList.filter((a: any) => a.isFeatured || a.isExclusive)
  const videoStories = articlesList.slice(0, 3)
  const photojournalism = articlesList.slice(3, 6)
  const opinionAnalisis = articlesList.slice(4, 7)
  const mainFeed = articlesList.slice(4, 12)
  const popular = articlesList.slice(0, 5)

  const defaultTags = ['Politik', 'Ekonomi', 'Investigasi', 'Teknologi', 'Gaya Hidup', 'Hiburan']
  const tags = (siteSettings?.trendingTopics as string[])?.length > 0
    ? (siteSettings.trendingTopics as string[])
    : defaultTags

  return (
    <PublicSiteLayout siteConfig={siteConfig} initialCategory={categoryFilter}>
      <main id="main-content" className="max-w-7xl mx-auto px-4 py-4 md:py-8 pb-28 md:pb-8">
        <div className="flex justify-center mt-4 md:mt-8 mb-6 md:mb-12">
          <AdSpace type="leaderboard" />
        </div>

        {!searchQuery && categoryFilter === 'Terbaru' && (
          <div className="mb-8 md:mb-24 -mx-4 lg:-mx-10 border-b border-gray-100 dark:border-white/5 pb-8 md:pb-16 bg-gray-50/30 dark:bg-white/[0.01] px-4 lg:px-10 pt-4 md:pt-8">
            <MagazineBentoHero articles={topBentoStories} site={siteParam} />

            {/* 4 Minimal Stories Row */}
            <div className="border-t border-gray-100 dark:border-white/5 pt-4 md:pt-8">
              <div className="flex items-center gap-2 mb-4 md:mb-8">
                <Zap size={16} className="text-brand-red animate-pulse" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-black dark:text-white">Fokus Redaksi</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {minimalStories.map((article: any) => (
                  <NewsCard key={article.id} article={article} variant="minimal" site={siteParam} />
                ))}
              </div>
            </div>

            {/* 1. PILIHAN EDITOR */}
            <ScrollAnimate className="border-t border-gray-100 dark:border-white/5 pt-6 md:pt-12 mt-6 md:mt-12">
              <div className="flex items-center gap-2 mb-4 md:mb-8">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-black dark:text-white">Pilihan Editor</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {editorChoice.slice(0, 3).map((article: any) => (
                  <div key={article.id} className="border border-amber-100 dark:border-amber-950/30 p-5 rounded-2xl bg-amber-50/10 dark:bg-amber-950/5 hover:shadow-xl transition-all duration-300">
                    <NewsCard article={article} variant="medium" site={siteParam} />
                  </div>
                ))}
              </div>
            </ScrollAnimate>

            {/* 2. BERITA VIDEO (DARK THEMING PREMIUM) */}
            <ScrollAnimate className="border-t border-gray-100 dark:border-white/5 pt-6 md:pt-12 mt-6 md:mt-12 bg-slate-950 -mx-4 lg:-mx-10 px-4 lg:px-10 py-8 md:py-12 rounded-3xl text-white">
              <div className="flex items-center gap-2 mb-4 md:mb-8">
                <Zap size={16} className="text-red-500 fill-red-500" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Laporan Video Eksklusif</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {videoStories.map((article: any) => (
                  <div key={article.id} className="group relative rounded-2xl overflow-hidden aspect-video bg-black shadow-lg">
                    {/* Simulated video play button overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors z-10 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-brand-red group-hover:border-transparent">
                        <span className="text-white text-lg ml-1">▶</span>
                      </div>
                    </div>
                    {article.featuredImage && (
                      <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[4s]" />
                    )}
                    <div className="absolute bottom-0 left-0 p-5 w-full bg-gradient-to-t from-black via-black/80 to-transparent z-20">
                      <span className="text-[9px] font-black text-brand-red uppercase tracking-widest block mb-1">Video Report</span>
                      <h4 className="text-sm font-bold text-white line-clamp-2">{article.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollAnimate>

            {/* 3. FOTO JURNALISTIK */}
            <ScrollAnimate className="border-t border-gray-100 dark:border-white/5 pt-6 md:pt-12 mt-6 md:mt-12">
              <div className="flex items-center gap-2 mb-4 md:mb-8">
                <span className="text-brand-red">📷</span>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-black dark:text-white">Foto Jurnalistik</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {photojournalism.map((article: any) => (
                  <div key={article.id} className="relative aspect-[4/5] rounded-3xl overflow-hidden group shadow-lg">
                    {article.featuredImage && (
                      <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 z-10 w-full">
                      <span className="text-[9px] font-black text-brand-red uppercase tracking-widest block mb-2">Jurnal Foto</span>
                      <h4 className="text-base font-serif font-black text-white leading-snug line-clamp-3">{article.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollAnimate>

            {/* 4. OPINI & ANALISIS (CLASSICAL NEWSPAPER SERIF STYLE) */}
            <ScrollAnimate className="border-t border-gray-100 dark:border-white/5 pt-6 md:pt-12 mt-6 md:mt-12">
              <div className="flex items-center gap-2 mb-4 md:mb-8">
                <span className="text-brand-red">✍️</span>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-black dark:text-white">Opini & Analisis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-white/5">
                {opinionAnalisis.map((article: any, idx: number) => (
                  <div key={article.id} className={`pt-6 md:pt-0 ${idx > 0 ? 'md:pl-8' : ''} flex flex-col justify-between h-full gap-4`}>
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Kolom Analisis</span>
                      <Link href={`/${siteParam}/artikel/${article.slug}`}>
                        <h4 className="text-xl font-serif font-black text-brand-black dark:text-white hover:text-brand-red transition-colors leading-tight line-clamp-3 mb-2">
                          &ldquo;{article.title}&rdquo;
                        </h4>
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-light line-clamp-3 leading-relaxed">
                        {article.excerpt || article.blocks?.find((b: any) => b.type === 'paragraph')?.content || ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
                      <div className="w-6 h-6 rounded-full bg-brand-red/10 flex items-center justify-center text-[10px] font-black text-brand-red">
                        {article.author?.name?.charAt(0) || 'S'}
                      </div>
                      <span className="text-[10px] font-black text-brand-black dark:text-white uppercase tracking-wider">
                        {article.author?.name || 'Redaksi'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollAnimate>
          </div>
        )}

        <section className="mb-16 py-8 border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar px-4">
            <div className="flex items-center gap-2 shrink-0 bg-brand-black dark:bg-white text-white dark:text-brand-black px-4 py-2 rounded-sm shadow-lg">
              <TrendingUp size={14} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Trending</span>
            </div>
            {tags.map(tag => (
              <Link
                key={tag}
                href={`/${siteParam}?q=${encodeURIComponent(tag)}`}
                className="shrink-0 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-brand-red transition-all hover:scale-105"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-12 border-b-8 border-brand-black dark:border-white pb-6">
              <h3 className="text-3xl font-serif font-black uppercase tracking-tighter text-brand-black dark:text-white flex items-center gap-4">
                <span className="w-6 h-6 bg-brand-red shadow-lg shadow-brand-red/20"></span>
                {searchQuery ? `Hasil Pencarian: ${searchQuery}` : `Berita ${categoryFilter}`}
              </h3>
              <div className="hidden md:flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                <span className="text-brand-red cursor-pointer border-b-2 border-brand-red pb-1">Terbaru</span>
                <span className="cursor-pointer hover:text-brand-black dark:hover:text-white transition-colors">Populer</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 mb-16">
              {mainFeed.slice(0, 4).map((article: any) => (
                <NewsCard key={article.id} article={article} site={siteParam} priority={true} />
              ))}
            </div>

            <div className="mb-16 p-8 bg-brand-grey dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Sponsorship</span>
                <span className="text-[11px] font-bold text-gray-300">ADVERTISEMENT</span>
              </div>
              <AdSpace type="in-feed" className="mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 mb-16">
              {mainFeed.slice(4).map((article: any) => (
                <NewsCard key={article.id} article={article} site={siteParam} />
              ))}
            </div>

            <div className="pt-12 border-t border-gray-100 dark:border-white/5">
              <LoadMoreArticles siteId={siteConfig.id} category={categoryFilter} search={searchQuery} initialPage={1} />
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-16">
            <div className="p-8 bg-slate-900 rounded-2xl text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Send size={80} />
              </div>
              <h4 className="text-2xl font-serif font-black leading-tight mb-4 relative z-10">Dapatkan Berita Eksklusif di Inbox Anda</h4>
              <p className="text-sm text-gray-400 mb-8 font-light relative z-10">Bergabunglah dengan 50,000+ pembaca setia BeritaKarya.</p>
              <NewsletterForm />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-8">
                <Star size={18} className="text-brand-red fill-brand-red" />
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-brand-black dark:text-white">Paling Populer</h4>
              </div>
              <div className="flex flex-col gap-8">
                {popular.map((article: any, index: number) => (
                  <div key={article.id} className="flex gap-5 group items-start">
                    <span className="text-4xl font-serif font-black text-gray-100 dark:text-white/5 group-hover:text-brand-red transition-colors tabular-nums">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <NewsCard article={article} variant="minimal" site={siteParam} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {siteSettings?.featuredVideo && (
              <div className="sticky top-28">
                <VideoWidget
                  title={siteSettings.featuredVideo.title}
                  thumbnail={siteSettings.featuredVideo.thumbnail}
                  duration={siteSettings.featuredVideo.duration}
                />
                <div className="mt-8">
                  <AdSpace type="rectangle" />
                </div>
              </div>
            )}
            {!siteSettings?.featuredVideo && (
              <div className="sticky top-28">
                <AdSpace type="rectangle" />
              </div>
            )}
          </aside>
        </div>
      </main>
    </PublicSiteLayout>
  )
}
