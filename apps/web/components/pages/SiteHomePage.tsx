import { SITE_MAP } from '@beritakarya/config'
import NewsCard from '../ui/NewsCard'
import PublicSiteLayout from '../layout/PublicSiteLayout'
import AdSpace from '../ui/AdSpace'
import Link from 'next/link'
import { TrendingUp, Zap, Star, MessageCircle, FileText, ArrowRight } from 'lucide-react'
import { SiFacebook, SiInstagram, SiTelegram, SiTiktok, SiWhatsapp, SiX, SiYoutube } from 'react-icons/si'
import LoadMoreArticles from '../ui/LoadMoreArticles'
import SavedArticlesFeed from '../ui/SavedArticlesFeed'
import VideoWidget from '../ui/VideoWidget'
import { MagazineBentoHero } from '../berita/MagazineBentoHero'
import { notFound } from 'next/navigation'
import ScrollAnimate from '../ui/ScrollAnimate'
import { Container } from '../layout/Container'

function resolveCategoryName(slug: string, categoriesTree: any[] = []): string {
  if (slug === 'terbaru') return 'Terbaru'
  if (slug === 'tersimpan') return 'Tersimpan'
  for (const cat of categoriesTree) {
    if (cat.slug === slug) return cat.name
    if (cat.subCategories) {
      for (const sub of cat.subCategories) {
        if (sub.slug === slug) return `${cat.name} / ${sub.name}`
      }
    }
  }
  return slug
}

function buildWhatsAppUrl(phone?: string | null, siteName?: string) {
  if (!phone) return null

  const digits = phone.replace(/\D/g, '')
  if (!digits) return null

  const normalizedNumber = digits.startsWith('0')
    ? `62${digits.slice(1)}`
    : digits.startsWith('8')
      ? `62${digits}`
      : digits

  const intro = encodeURIComponent(`Halo ${siteName || 'BeritaKarya'}, saya ingin bergabung dengan channel WhatsApp.`)
  return `https://wa.me/${normalizedNumber}?text=${intro}`
}

const sectionEyebrowClass = 'text-[11px] font-black uppercase tracking-[0.18em]'
const sectionEyebrowMutedClass = `${sectionEyebrowClass} text-gray-500 dark:text-gray-400`
const sidebarEyebrowClass = `${sectionEyebrowClass} text-white`
const sectionMetaClass = 'text-[10px] font-semibold text-gray-500 dark:text-gray-400'
const sectionTitleClass = 'text-[1.9rem] md:text-[2.2rem] font-serif font-black tracking-[-0.04em] text-brand-black dark:text-white'
const sectionDeckClass = 'max-w-2xl text-sm md:text-[15px] leading-relaxed text-brand-text-muted dark:text-gray-400'

type SearchParams = {
  cat?: string
  q?: string
  tab?: string
}

type SiteHomePageProps = {
  siteParam: string
  searchParams: SearchParams
}

async function getArticles(siteId: string, category?: string, search?: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    let url = `${apiUrl}/api/v1/articles/public?site=${siteId}&limit=25`

    if (category && category !== 'terbaru' && category !== 'tersimpan') {
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

async function getCategories(siteId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/api/v1/categories/tree?site=${siteId}`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const json = await res.json()
    return json?.data || []
  } catch (e) {
    console.error('Error fetching categories tree:', e)
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
  const categoryFilter = resolvedSearchParams?.cat || 'terbaru'
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
  const categoriesTree = await getCategories(siteConfig.id)
  const topBentoStories = articlesList.slice(0, 4)
  const minimalStories = articlesList.slice(4, 8)
  const editorChoice = articlesList
    .filter((a: any) => a.isFeatured || a.isExclusive)
    .filter((a: any) => !topBentoStories.some((story: any) => story.id === a.id) && !minimalStories.some((story: any) => story.id === a.id))
    .slice(0, 3)
  const isCategoryFilter = categoryFilter && categoryFilter !== 'terbaru' && categoryFilter !== 'tersimpan'
  const homepageFeed = articlesList.slice(8, 16)
  const mainFeed = isCategoryFilter ? articlesList : (homepageFeed.length > 0 ? homepageFeed : articlesList)
  const supplementalStories = !isCategoryFilter ? articlesList.slice(16) : []
  const videoStories = supplementalStories.slice(0, 3)
  const photojournalism = supplementalStories.slice(3, 6)
  const opinionAnalisis = supplementalStories.slice(6, 9)
  const popularPool = !isCategoryFilter ? articlesList.slice(8, 13) : articlesList.slice(0, 5)
  const popular = popularPool.length > 0 ? popularPool : articlesList.slice(0, 5)

  const defaultTags = ['Politik', 'Ekonomi', 'Investigasi', 'Teknologi', 'Gaya Hidup', 'Hiburan']
  const tags = (siteSettings?.trendingTopics as string[])?.length > 0
    ? (siteSettings.trendingTopics as string[])
    : defaultTags
  const whatsappUrl = buildWhatsAppUrl(siteConfig.phone, siteConfig.name)
  const reportUrl = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`Laporan Warga untuk ${siteConfig.name}`)}`
  const socialChannels = [
    { label: 'WhatsApp', href: siteConfig.socialLinks?.whatsapp, Icon: SiWhatsapp },
    { label: 'Facebook', href: siteConfig.socialLinks?.facebook, Icon: SiFacebook },
    { label: 'TikTok', href: siteConfig.socialLinks?.tiktok, Icon: SiTiktok },
    { label: 'Telegram', href: siteConfig.socialLinks?.telegram, Icon: SiTelegram },
    { label: 'X', href: siteConfig.socialLinks?.twitter, Icon: SiX },
    { label: 'Instagram', href: siteConfig.socialLinks?.instagram, Icon: SiInstagram },
    { label: 'YouTube', href: siteConfig.socialLinks?.youtube, Icon: SiYoutube },
  ].filter((item) => Boolean(item.href))
  const showHomepageHero = !searchQuery && categoryFilter === 'terbaru' && topBentoStories.length > 0
  const showSavedFeed = categoryFilter === 'tersimpan'
  const showEditorFocus = !searchQuery && categoryFilter === 'terbaru' && minimalStories.length > 0
  const showTrending = !searchQuery && categoryFilter === 'terbaru' && tags.length > 0
  const showInlineSponsor = mainFeed.length > 3
  const feedTab = resolvedSearchParams?.tab || 'terbaru';
  const showPopularSidebar = popular.length > 0
  const showEditorChoice = editorChoice.length >= 3
  const showOpinionSection = opinionAnalisis.length >= 3
  const showPhotoSection = photojournalism.length >= 3
  const showVideoSection = videoStories.length >= 3
  const showEditorialExtras = !searchQuery && categoryFilter === 'terbaru' && (showEditorChoice || showOpinionSection || showPhotoSection || showVideoSection)
  const displayFeed = feedTab === 'populer' && !isCategoryFilter ? popular.slice(0, 8) : mainFeed
  const featuredFeed = displayFeed.slice(0, 2)
  const streamFeed = displayFeed.slice(2, 8)
  const heroSupportStories = minimalStories.slice(0, 4)

  return (
    <PublicSiteLayout siteConfig={siteConfig} initialCategory={categoryFilter}>
      <main id="main-content" className="pb-28 md:pb-8">
        {showHomepageHero ? (
          <section className="border-b border-black/5 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_72%)] dark:border-white/5 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.98)_0%,rgba(2,6,23,1)_72%)]">
            <Container className="py-8 md:py-10">
              <div className="mb-8 flex flex-col gap-4 md:mb-9 md:flex-row md:items-end md:justify-between">
                <div className="space-y-3">
                  <span className={`${sectionEyebrowClass} text-brand-red`}>Edisi Utama</span>
                  <div className="space-y-2">
                    <h2 className={sectionTitleClass}>Front Page {siteConfig.name}</h2>
                    <p className={sectionDeckClass}>
                      Susunan headline utama, laporan paling relevan, dan agenda liputan yang kami prioritaskan untuk pembaca hari ini.
                    </p>
                  </div>
                </div>
                <Link
                  href={`/${siteParam}?tab=terbaru`}
                  className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-brand-black transition-colors hover:text-brand-red dark:text-white"
                >
                  Buka Arus Terbaru
                  <ArrowRight size={14} />
                </Link>
              </div>

              <MagazineBentoHero articles={topBentoStories} site={siteParam} />

              <div className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_296px] lg:gap-8">
                {showEditorFocus && (
                  <div className="rounded-3xl border border-black/5 bg-white/90 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.04)] dark:border-white/5 dark:bg-white/[0.02] md:p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Zap size={16} className="text-brand-red" />
                      <h3 className={`${sectionEyebrowClass} text-brand-black dark:text-white`}>Radar Redaksi</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-1 md:grid-cols-2 md:gap-x-6">
                      {heroSupportStories.map((article: any) => (
                        <NewsCard key={article.id} article={article} variant="minimal" site={siteParam} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-3xl border border-black/5 bg-brand-black p-5 text-white shadow-[0_24px_48px_rgba(2,6,23,0.24)] dark:border-white/10 md:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className={sidebarEyebrowClass}>Partner Placement</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">Ad</span>
                  </div>
                  <AdSpace type="rectangle" className="mx-auto" />
                </div>
              </div>
            </Container>
          </section>
        ) : (
          <Container className="py-8 md:py-10">
            <div className="flex justify-center rounded-3xl border border-black/5 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] dark:border-white/5 dark:bg-white/[0.02]">
              <AdSpace type="leaderboard" />
            </div>
          </Container>
        )}

        <Container className="py-10 md:py-12">
          {showTrending && (
            <section className="mb-12 rounded-3xl border border-black/5 bg-brand-surface/80 p-6 md:p-7 dark:border-white/5 dark:bg-white/[0.02]">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-brand-red" />
                  <span className={`${sectionEyebrowClass} text-brand-black dark:text-white`}>Radar Topik</span>
                </div>
                <p className="text-sm leading-relaxed text-brand-text-muted dark:text-gray-400">
                  Topik yang sedang ramai dibaca dan paling cepat mengarahkan pembaca ke isu utama hari ini.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/${siteParam}?q=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-gray-600 transition-colors hover:border-brand-red/40 hover:text-brand-red dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <div className="mb-8 flex flex-col gap-5 border-b border-black/10 pb-6 dark:border-white/5 md:flex-row md:items-end md:justify-between">
                <div className="space-y-3">
                  <span className={`${sectionEyebrowClass} text-brand-red`}>
                    {searchQuery ? 'Pencarian' : `Desk ${resolveCategoryName(categoryFilter, categoriesTree)}`}
                  </span>
                  <div className="space-y-2">
                    <h3 className={sectionTitleClass}>
                      {searchQuery ? `Hasil untuk "${searchQuery}"` : `Arus Berita ${resolveCategoryName(categoryFilter, categoriesTree)}`}
                    </h3>
                    <p className={sectionDeckClass}>
                      Feed utama disusun untuk memberi headline paling penting terlebih dahulu, lalu beralih ke stream berita yang cepat dipindai.
                    </p>
                  </div>
                </div>

                {!searchQuery && categoryFilter === 'terbaru' && (
                  <div className="flex items-center gap-1 rounded-2xl border border-black/5 bg-brand-surface p-1 dark:border-white/5 dark:bg-white/[0.04]">
                    <Link
                      href={`/${siteParam}?tab=terbaru`}
                      className={`rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-all ${
                        feedTab === 'terbaru'
                          ? 'bg-white text-brand-red shadow-sm dark:bg-slate-800'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      Terbaru
                    </Link>
                    <Link
                      href={`/${siteParam}?tab=populer`}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-all ${
                        feedTab === 'populer'
                          ? 'bg-white text-brand-red shadow-sm dark:bg-slate-800'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <Star size={12} className={feedTab === 'populer' ? 'fill-brand-red' : ''} />
                      Populer
                    </Link>
                  </div>
                )}
              </div>

              {showSavedFeed ? (
                <SavedArticlesFeed site={siteParam} />
              ) : displayFeed.length > 0 ? (
                <div className="space-y-10 md:space-y-12">
                  {featuredFeed.length > 0 && (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8">
                      {featuredFeed.map((article: any) => (
                        <NewsCard key={article.id} article={article} site={siteParam} priority={true} />
                      ))}
                    </div>
                  )}

                  {showInlineSponsor && (
                    <div className="rounded-3xl border border-black/5 bg-brand-surface/80 p-7 dark:border-white/5 dark:bg-white/[0.03]">
                      <div className="mb-6 flex items-center justify-between">
                        <span className={sectionEyebrowMutedClass}>Sponsorship</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">Advertisement</span>
                      </div>
                      <AdSpace type="in-feed" className="mx-auto" />
                    </div>
                  )}

                  {streamFeed.length > 0 && (
                    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.05)] dark:border-white/5 dark:bg-white/[0.02] md:p-7">
                      <div className="mb-6 flex items-center justify-between gap-4">
                        <div>
                          <span className={`${sectionEyebrowClass} text-brand-red`}>News Stream</span>
                          <p className="mt-2 text-sm leading-relaxed text-brand-text-muted dark:text-gray-400">
                            Ringkasan berita lanjutan yang bergerak cepat, dirancang untuk pembacaan scan-friendly.
                          </p>
                        </div>
                        <Link
                          href={`/${siteParam}?tab=${feedTab}`}
                          className="hidden items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-brand-black transition-colors hover:text-brand-red dark:text-white md:inline-flex"
                        >
                          Lihat Arsip
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                      <div className="space-y-6">
                        {streamFeed.map((article: any) => (
                          <NewsCard key={article.id} article={article} variant="horizontal" site={siteParam} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-16 rounded-3xl border border-dashed border-gray-200 bg-gray-50/70 p-10 text-center dark:border-white/10 dark:bg-white/[0.02]">
                  <p className="text-lg font-serif font-black text-brand-black dark:text-white">Belum ada berita untuk konteks ini.</p>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    Coba kembali ke topik terbaru atau gunakan kata kunci yang lebih umum.
                  </p>
                  <div className="mt-6">
                    <Link
                      href={`/${siteParam}`}
                      className="inline-flex items-center justify-center rounded-full bg-brand-red px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90"
                    >
                      Kembali Ke Berita Terbaru
                    </Link>
                  </div>
                </div>
              )}

              {!showSavedFeed && (
                <div className="mt-12 border-t border-black/5 pt-12 dark:border-white/5">
                  <LoadMoreArticles siteId={siteConfig.id} category={categoryFilter} search={searchQuery} initialPage={1} />
                </div>
              )}
            </div>

            <aside className="space-y-7 lg:col-span-4">
              {socialChannels.length > 0 && (
                <div className="rounded-3xl border border-white/5 bg-slate-950 p-5 text-white shadow-[0_28px_56px_rgba(2,6,23,0.26)] md:p-6">
                  <div className="pb-4">
                    <span className={`${sectionEyebrowClass} text-brand-red`}>Ikuti Kami</span>
                    <h4 className="mt-2 text-2xl font-serif font-black leading-tight text-white">{siteConfig.name}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">
                      Terhubung langsung dengan distribusi headline, video, dan pembaruan redaksi dari semua kanal utama kami.
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {socialChannels.map((channel) => {
                      const Icon = channel.Icon
                      return (
                        <a
                          key={channel.label}
                          href={channel.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={channel.label}
                          title={channel.label}
                          className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 transition-all hover:border-white/20 hover:bg-white/10"
                        >
                          <Icon size={20} className="text-white" />
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {showPopularSidebar && (
                <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] dark:border-white/5 dark:bg-white/[0.02] md:p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <Star size={18} className="fill-brand-red text-brand-red" />
                    <h4 className={`${sectionEyebrowClass} text-brand-black dark:text-white`}>Paling Populer</h4>
                  </div>
                  <div className="flex flex-col gap-6">
                    {popular.map((article: any, index: number) => (
                      <div key={article.id} className="group flex items-start gap-5">
                        <span className="tabular-nums font-serif text-4xl font-black text-gray-100 transition-colors group-hover:text-brand-red dark:text-white/5">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <NewsCard article={article} variant="minimal" site={siteParam} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(whatsappUrl || reportUrl) && (
                <div className="rounded-3xl border border-black/5 bg-brand-surface/80 p-5 dark:border-white/5 dark:bg-white/[0.02] md:p-6">
                  <span className={`${sectionEyebrowClass} text-brand-red`}>Akses Cepat</span>
                  <h4 className="mt-3 text-2xl font-serif font-black leading-tight text-brand-black dark:text-white">
                    Terhubung dengan redaksi.
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-brand-text-muted dark:text-gray-400">
                    Kirim laporan warga, tips, atau jangkau tim kami lewat kanal yang paling cepat ditindaklanjuti.
                  </p>
                  <div className="mt-5 grid gap-3">
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-brand-black transition-colors hover:border-brand-red/30 hover:text-brand-red dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                      >
                        <span className="inline-flex items-center gap-3">
                          <MessageCircle size={16} />
                          WhatsApp Channel
                        </span>
                        <ArrowRight size={15} />
                      </a>
                    )}
                    <a
                      href={reportUrl}
                      className="inline-flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-brand-black transition-colors hover:border-brand-red/30 hover:text-brand-red dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                    >
                      <span className="inline-flex items-center gap-3">
                        <FileText size={16} />
                        Kirim Laporan Warga
                      </span>
                      <ArrowRight size={15} />
                    </a>
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] dark:border-white/5 dark:bg-white/[0.02] md:p-6">
                {siteSettings?.featuredVideo ? (
                  <VideoWidget
                    title={siteSettings.featuredVideo.title}
                    thumbnail={siteSettings.featuredVideo.thumbnail}
                    duration={siteSettings.featuredVideo.duration}
                  />
                ) : (
                  <AdSpace type="rectangle" />
                )}
              </div>
            </aside>
          </div>

          {showEditorialExtras && (
            <div className="mt-16 space-y-16 border-t border-black/5 pt-16 dark:border-white/5 md:mt-24 md:space-y-20">
              {showEditorChoice && (
                <ScrollAnimate>
                  <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star size={16} className="fill-amber-500 text-amber-500" />
                        <h3 className={`${sectionEyebrowClass} text-brand-black dark:text-white`}>Pilihan Editor</h3>
                      </div>
                      <p className={sectionDeckClass}>
                        Paket berita yang kami anggap paling bernilai untuk memberi konteks, kedalaman, dan sudut pandang paling kuat.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {editorChoice.map((article: any) => (
                      <div key={article.id} className="rounded-3xl border border-amber-100 bg-amber-50/50 p-5 transition-all duration-300 hover:shadow-xl dark:border-amber-950/30 dark:bg-amber-950/5">
                        <NewsCard article={article} variant="medium" site={siteParam} />
                      </div>
                    ))}
                  </div>
                </ScrollAnimate>
              )}

              {showOpinionSection && (
                <ScrollAnimate>
                  <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-brand-red"></span>
                        <h3 className={`${sectionEyebrowClass} text-brand-black dark:text-white`}>Opini & Analisis</h3>
                      </div>
                      <p className={sectionDeckClass}>
                        Kolom dan analisis untuk pembaca yang membutuhkan perspektif, bukan hanya pembaruan cepat.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-8 divide-y divide-black/5 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.05)] dark:divide-white/5 dark:border-white/5 dark:bg-white/[0.02] md:grid-cols-3 md:divide-x md:divide-y-0 md:p-8">
                    {opinionAnalisis.map((article: any, idx: number) => (
                      <div key={article.id} className={`flex h-full flex-col justify-between gap-4 pt-6 md:pt-0 ${idx > 0 ? 'md:pl-8' : ''}`}>
                        <div>
                          <span className={`${sectionMetaClass} mb-2 block uppercase tracking-[0.12em]`}>Kolom Analisis</span>
                          <Link href={`/${siteParam}/artikel/${article.slug}`}>
                            <h4 className="mb-2 line-clamp-3 text-xl font-serif font-black leading-tight text-brand-black transition-colors hover:text-brand-red dark:text-white">
                              &ldquo;{article.title}&rdquo;
                            </h4>
                          </Link>
                          <p className="line-clamp-3 text-sm font-light leading-relaxed text-gray-500 dark:text-gray-400">
                            {article.excerpt || article.blocks?.find((b: any) => b.type === 'paragraph')?.content || ''}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center gap-2 border-t border-black/5 pt-4 dark:border-white/5">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-red/10 text-[10px] font-black text-brand-red">
                            {article.author?.name?.charAt(0) || 'S'}
                          </div>
                          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-black dark:text-white">
                            {article.author?.name || 'Redaksi'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollAnimate>
              )}

              {showPhotoSection && (
                <ScrollAnimate>
                  <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-brand-red"></span>
                        <h3 className={`${sectionEyebrowClass} text-brand-black dark:text-white`}>Foto Jurnalistik</h3>
                      </div>
                      <p className={sectionDeckClass}>
                        Visual pilihan yang menambah emosi dan rasa kehadiran pada peristiwa yang sedang dibicarakan.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {photojournalism.map((article: any) => (
                      <div key={article.id} className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lg">
                        {article.featuredImage && (
                          <img src={article.featuredImage} alt={article.title} className="h-full w-full object-cover transition-transform duration-[5s] group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                        <div className="absolute bottom-0 left-0 z-10 w-full p-6">
                          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-red">Jurnal Foto</span>
                          <h4 className="line-clamp-3 text-base font-serif font-black leading-snug text-white">{article.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollAnimate>
              )}

              {showVideoSection && (
                <ScrollAnimate className="rounded-3xl bg-slate-950 px-6 py-8 text-white md:px-8 md:py-12">
                  <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="fill-red-500 text-red-500" />
                        <h3 className={`${sidebarEyebrowClass} tracking-[0.14em]`}>Laporan Video Eksklusif</h3>
                      </div>
                      <p className="max-w-2xl text-sm leading-relaxed text-white/65">
                        Klip dan laporan visual dengan treatment yang lebih sinematik untuk memperluas pengalaman homepage.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {videoStories.map((article: any) => (
                      <div key={article.id} className="group relative aspect-video overflow-hidden rounded-2xl bg-black shadow-lg">
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/60">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-white/20 backdrop-blur-md transition-transform group-hover:scale-110 group-hover:border-transparent group-hover:bg-brand-red">
                            <span className="ml-1 text-lg text-white">▶</span>
                          </div>
                        </div>
                        {article.featuredImage && (
                          <img src={article.featuredImage} alt={article.title} className="h-full w-full object-cover transition-transform duration-[4s] group-hover:scale-105" />
                        )}
                        <div className="absolute bottom-0 left-0 z-20 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-5">
                          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-red">Video Report</span>
                          <h4 className="line-clamp-2 text-sm font-bold text-white">{article.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollAnimate>
              )}
            </div>
          )}
        </Container>
      </main>
    </PublicSiteLayout>
  )
}
