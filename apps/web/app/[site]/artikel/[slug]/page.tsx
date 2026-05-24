import { notFound } from 'next/navigation'
import { SmartImage } from '../../../../components/ui/SmartImage'
import Link from 'next/link'
import type { Block } from '@beritakarya/types'
import PublicSiteLayout from '../../../../components/layout/PublicSiteLayout'
import { SITE_MAP } from '@beritakarya/config'
import NewsCard from '../../../../components/ui/NewsCard'
import ReadingProgress from '../../../../components/ui/ReadingProgress'
import AdSpace from '../../../../components/ui/AdSpace'
import ShareSidebar from '../../../../components/ui/ShareSidebar'
import EditorialBadge from '../../../../components/ui/EditorialBadge'
import { resolveArticleBadge } from '../../../../lib/resolveArticleBadge'
import { BookOpen, CalendarDays, Printer, Sparkles, Tags, User2 } from 'lucide-react'
import { Metadata } from 'next'
import CommentSection from '../../../../components/ui/CommentSection'
import FontSizeControl from '../../../../components/ui/FontSizeControl'
import ArticleActions from '../../../../components/ui/ArticleActions'
import ImageLightboxWrapper from '../../../../components/ui/ImageLightboxWrapper'
import { Container } from '../../../../components/layout/Container'
import ArticleShareActions from '../../../../components/ui/ArticleShareActions'
import ArticleBookmarkButton from '../../../../components/ui/ArticleBookmarkButton'

interface Props {
  params: { site: string; slug: string }
}

import { constructMetadata } from '../../../../lib/metadata'
import { cn } from '../../../../lib/utils'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const siteParam = resolvedParams?.site || 'pusat';
  const slugParam = resolvedParams?.slug;
  
  const article = await getArticle(siteParam, slugParam)
  if (!article) return { title: 'Post Tidak Ditemukan' }

  const siteConfig = SITE_MAP[siteParam] || SITE_MAP['pusat']
  const siteName = siteConfig?.name || (siteParam.charAt(0).toUpperCase() + siteParam.slice(1));
  
  const excerpt = article.blocks.find((b: any) => b.type === 'paragraph')?.content || ''
  const coverImage = article.featuredImage || article.blocks.find((b: any) => b.type === 'image')?.url || '/logo.png'

  return constructMetadata({
    title: article.metaTitle || `${article.title} - ${siteName}`,
    description: article.metaDescription || excerpt.substring(0, 160),
    image: coverImage,
    siteParam,
    slug: slugParam
  })
}

async function getArticle(site: string, slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(
      `${apiUrl}/api/v1/articles/slug/${slug}?site=${site}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.data
  } catch (e) {
    console.error('Failed to get article:', e)
    return null
  }
}

async function getRelatedArticles(site: string, currentSlug: string, category?: string) {
  try {
    const params = new URLSearchParams({
      site,
      status: 'published',
      limit: '6',
      ...(category && { category })
    })
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(
      `${apiUrl}/api/v1/articles/public?${params.toString()}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return []
    const json = await res.json()
    const articles = json.data?.articles || json.data?.items || []
    return articles.filter((a: any) => a.slug !== currentSlug).slice(0, 3)
  } catch {
    return []
  }
}

async function getSiteSettings(siteId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/v1/sites/settings?site=${siteId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export default async function ArticlePage({ params }: Props) {
  const resolvedParams = await params;
  const siteParam = resolvedParams?.site || 'pusat';
  const slugParam = resolvedParams?.slug;

  const siteSettings = await getSiteSettings(siteParam)
  
  if (!siteSettings && siteParam !== 'pusat') {
    notFound()
  }

  const siteConfig = {
    id: siteParam,
    name: siteSettings?.name || SITE_MAP[siteParam]?.name || (siteParam.charAt(0).toUpperCase() + siteParam.slice(1)),
    domain: siteSettings?.domain || SITE_MAP[siteParam]?.domain || `${siteParam}.beritakarya.co`,
    description: siteSettings?.description || SITE_MAP[siteParam]?.description || `Portal berita resmi ${siteParam}. Menyajikan informasi terbaru, investigasi, dan analisis tajam dari seluruh Nusantara.`,
    footerText: siteSettings?.footerText || SITE_MAP[siteParam]?.footerText || `© ${new Date().getFullYear()} BERITA KARYA. ALL RIGHTS RESERVED.`,
    address: siteSettings?.address || SITE_MAP[siteParam]?.address || "Jl. Merdeka No. 123, Jakarta Pusat, Indonesia",
    contactEmail: siteSettings?.contactEmail || SITE_MAP[siteParam]?.contactEmail || "support.beritakarya@gmail.com",
    phone: siteSettings?.phone || SITE_MAP[siteParam]?.phone || null,
    socialLinks: siteSettings?.socialLinks || SITE_MAP[siteParam]?.socialLinks || {},
    appearance: siteSettings?.appearance || SITE_MAP[siteParam]?.appearance || { primaryColor: '#e11d48' },
    trendingTopics: siteSettings?.trendingTopics || [],
    devDomain: SITE_MAP[siteParam]?.devDomain || `${siteParam}.localhost:3000`
  }

  const article = await getArticle(siteParam, slugParam)
  if (!article || article.status !== 'published') notFound()

  const relatedArticles = await getRelatedArticles(siteParam, slugParam, article.category?.name)
  const coverImage = article.featuredImage || article.blocks.find((b: any) => b.type === 'image')?.url || '/placeholder.jpg'
  const coverImageBlock = article.blocks.find((b: any) => b.type === 'image' && b.url === coverImage)
    || article.blocks.find((b: any) => b.type === 'image')
  const coverImageCaption = coverImageBlock?.caption || null
  const excerpt = article.blocks.find((b: any) => b.type === 'paragraph')?.content || ''
  const articleUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/${siteParam}/artikel/${slugParam}`
  const authorProfileUrl = article.author?.id
    ? `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/${siteParam}/penulis/${article.author.id}`
    : `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/${siteParam}`
  const authorProfilePath = article.author?.id ? `/${siteParam}/penulis/${article.author.id}` : null
  const sidebarRelatedArticles = relatedArticles.slice(0, 2)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": [coverImage],
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "author": [{
      "@type": "Person",
      "name": article.author?.name || 'Redaksi',
      "url": authorProfileUrl
    }],
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.name || "BeritaKarya",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_URL}/logo.png`
      }
    },
    "description": excerpt
  }

  const badgeVariant = resolveArticleBadge(article);
  const readingTime = article.readingTimeMin || Math.max(1, Math.ceil((article.wordCount || 0) / 200)) || 3;
  const articleRailClassName = 'xl:grid xl:grid-cols-[minmax(0,1.75fr)_20rem] 2xl:grid-cols-[minmax(0,1.75fr)_22.5rem] xl:justify-between xl:gap-12 2xl:gap-16'

  return (
    <PublicSiteLayout siteConfig={siteConfig}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />
      <ShareSidebar title={article.title} url={articleUrl} />
      
      <ImageLightboxWrapper>
        <article className="min-h-screen bg-[var(--bg-main)] dark:bg-[#020617]">
          {/* --- HEADER SECTION --- */}
          <header className="w-full pt-8 pb-8 md:pt-12 md:pb-12 border-b border-gray-100 dark:border-white/5">
            <Container>
              <div className={articleRailClassName}>
                <div className="min-w-0">
                  <div className="flex flex-col items-start gap-4 mb-10 md:mb-12 lg:mb-14">
                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                      {badgeVariant && (
                        <EditorialBadge
                          variant={badgeVariant}
                          size="sm"
                          className="rounded-full px-3 py-1 shadow-sm shadow-black/5"
                        />
                      )}
                      <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide">
                        <span className="text-brand-red">
                          {article.category?.name || 'NASIONAL'}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-white/20" />
                        <span className="text-brand-text-muted">
                          Edisi Hari Ini
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-white/20" />
                        <span className="text-brand-text-muted">
                        {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif font-black text-brand-black dark:text-white leading-[1.1] tracking-tighter mb-8 md:mb-10 lg:mb-12">
                    {article.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-y-6 gap-x-6 border-t border-gray-100 dark:border-white/10 pt-8 md:pt-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-red flex items-center justify-center text-white text-lg font-serif italic shadow-lg shadow-brand-red/20">
                        {article.author?.name?.[0] || 'R'}
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] font-bold text-brand-black dark:text-white">{article.author?.name || 'Redaksi'}</div>
                        <div className="text-[10px] text-brand-text-muted font-medium mt-0.5">Staf Redaksi BeritaKarya</div>
                        {article.author?.id && (
                          <Link
                            href={`/${siteParam}/penulis/${article.author.id}`}
                            className="mt-2 inline-flex text-[10px] font-black uppercase tracking-[0.18em] text-brand-red transition-colors hover:text-brand-black dark:hover:text-white"
                          >
                            Lihat Profil
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-white/10" />
                    
                    <div className="flex items-center gap-6 text-brand-text-muted dark:text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-brand-red" />
                        {readingTime} MENIT BACA
                      </div>
                      <div className="flex items-center gap-2">
                        <Printer size={14} className="text-brand-red" />
                        {article.wordCount || 0} KATA
                      </div>
                    </div>

                    <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-white/10" />
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-400">
                        Bagikan
                      </span>
                      <ArticleShareActions title={article.title} url={articleUrl} />
                    </div>

                    <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-white/10" />
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-400">
                        Simpan
                      </span>
                      <ArticleBookmarkButton
                        article={article}
                        site={siteParam}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"
                        activeClassName="border-brand-red/40 bg-brand-red/5 text-brand-red"
                        idleClassName="text-brand-text-muted hover:text-brand-red hover:border-brand-red/40"
                        iconSize={16}
                      />
                    </div>

                    <div className="ml-auto hidden lg:flex items-center gap-3 rounded-full border border-gray-100 bg-gray-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/[0.025]">
                      <span className="pl-1 text-[9px] font-black uppercase tracking-[0.22em] text-gray-400">
                        Reader Tools
                      </span>
                      <FontSizeControl />
                      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />
                      <ArticleActions />
                    </div>
                  </div>
                </div>
                <div className="hidden xl:block" />
              </div>
            </Container>
          </header>

          {/* --- HERO IMAGE --- */}
          <div className="mb-16 md:mb-20">
            <Container>
              <figure>
                <div className="rounded-[1.75rem] border border-gray-100/90 bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/5 dark:bg-white/[0.02] dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                  <div className="aspect-[16/10] md:aspect-[16/9] w-full relative overflow-hidden rounded-[1.15rem] bg-slate-100 dark:bg-slate-900">
                    <SmartImage 
                      src={coverImage} 
                      blur={article.featuredImageBlur}
                      dominantColor={article.featuredImageColor}
                      context="article_cover"
                      alt={article.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
                <figcaption className="mt-5 grid gap-3 border-b border-gray-100 pb-6 text-brand-text-muted dark:border-white/5 dark:text-gray-400 md:grid-cols-[minmax(0,var(--content-max-width))_1fr] md:items-start">
                  <p className="text-sm italic leading-relaxed">
                    {coverImageCaption || ''}
                  </p>
                  <span className="text-[9px] font-black uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500">
                    Foto / Dokumentasi Redaksi
                  </span>
                </figcaption>
              </figure>
            </Container>
          </div>

          {/* --- CONTENT SECTION --- */}
          <Container>
            <div className={cn(articleRailClassName, 'mb-20 md:mb-28')}>
              {/* Main Content */}
              <div className="min-w-0">
                {/* Lead Paragraph */}
                <div className="mb-16 md:mb-20">
                  <div className="border-l border-brand-red/20 pl-6 md:pl-8">
                    <span className="inline-flex text-[10px] font-black uppercase tracking-[0.26em] text-brand-red">
                      Pembuka
                    </span>
                    <p className="mt-5 text-[1.8rem] md:text-[2.35rem] font-serif text-brand-black dark:text-white leading-[1.45] tracking-tight">
                      {excerpt}
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="article-content space-y-12 transition-all duration-300">
                    {(article.blocks as Block[]).map((block: Block, i: number) => (
                      <PublicBlock key={i} block={block} />
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-24 pt-16 border-t border-gray-100 dark:border-white/5 flex flex-wrap gap-3">
                  {(article.tags || ['Investigasi', 'KaryaNyata', 'Nusantara', 'Politik']).map((tag: string) => (
                    <Link 
                      key={tag} 
                      href={`/${siteParam}?q=${encodeURIComponent(tag)}`}
                      className="px-5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[10px] font-black text-brand-text-muted dark:text-gray-400 uppercase tracking-[0.2em] hover:bg-brand-red hover:text-white hover:border-brand-red transition-all rounded-full"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>

                {/* Comment Section */}
                <div id="comments">
                  <CommentSection articleId={article.id} />
                </div>

                {/* Recommended Articles */}
                <section className="mt-20 border-t border-gray-100 pt-16 dark:border-white/5">
                  <div className="mb-10 flex items-center gap-3">
                    <div className="h-8 w-1 bg-brand-red" />
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-brand-black dark:text-white">
                        Rekomendasi Artikel
                      </h3>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Lanjutkan bacaan terkait topik ini
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {relatedArticles.length > 0 ? (
                      relatedArticles.map((rel: any) => (
                        <NewsCard key={rel.id} article={rel} variant="medium" site={siteParam} />
                      ))
                    ) : (
                      <div className="col-span-full rounded-3xl border border-dashed border-gray-200 px-6 py-12 text-center dark:border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Belum ada rekomendasi artikel terkait.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <aside className="hidden xl:block">
                <div className="sticky top-32 space-y-6">
                  <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/5 dark:bg-white/[0.02] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                      <Sparkles size={14} className="text-brand-red" />
                      Ringkasan Artikel
                    </div>

                    <div className="mt-5 rounded-[1.25rem] border border-gray-100 bg-gray-50/80 p-4 dark:border-white/5 dark:bg-white/[0.03]">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-red text-base font-serif font-black text-white shadow-lg shadow-brand-red/20">
                          {article.author?.name?.[0] || 'R'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                            Penulis
                          </p>
                          <p className="mt-2 text-sm font-black text-brand-black dark:text-white leading-snug">
                            {article.author?.name || 'Redaksi'}
                          </p>
                          {authorProfilePath && (
                            <Link
                              href={authorProfilePath}
                              className="mt-2 inline-flex text-[11px] font-semibold text-brand-red transition-colors hover:text-brand-black dark:hover:text-white"
                            >
                              Lihat Profil
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-white/5 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">
                          <BookOpen size={12} className="text-brand-red" />
                          Baca
                        </div>
                        <p className="mt-2 text-sm font-black text-brand-black dark:text-white">
                          {readingTime} menit
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-white/5 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">
                          <Printer size={12} className="text-brand-red" />
                          Kata
                        </div>
                        <p className="mt-2 text-sm font-black text-brand-black dark:text-white">
                          {(article.wordCount || 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-white/5 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">
                          <CalendarDays size={12} className="text-brand-red" />
                          Terbit
                        </div>
                        <p className="mt-2 text-sm font-black text-brand-black dark:text-white">
                          {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-white/5 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">
                          <User2 size={12} className="text-brand-red" />
                          Kanal
                        </div>
                        <p className="mt-2 text-sm font-black text-brand-black dark:text-white">
                          {article.category?.name || 'Umum'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/5 dark:bg-white/[0.02] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                      Bagikan & Simpan
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <ArticleShareActions title={article.title} url={articleUrl} />
                      <ArticleBookmarkButton
                        article={article}
                        site={siteParam}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"
                        activeClassName="border-brand-red/40 bg-brand-red/5 text-brand-red"
                        idleClassName="text-brand-text-muted hover:text-brand-red hover:border-brand-red/40"
                        iconSize={16}
                      />
                    </div>
                  </div>

                  {(article.tags || []).length > 0 && (
                    <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/5 dark:bg-white/[0.02] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                        <Tags size={14} className="text-brand-red" />
                        Topik Terkait
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(article.tags || []).slice(0, 8).map((tag: string) => (
                          <Link
                            key={tag}
                            href={`/${siteParam}?q=${encodeURIComponent(tag)}`}
                            className="rounded-full border border-gray-100 bg-gray-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 transition-colors hover:border-brand-red/20 hover:bg-brand-red/5 hover:text-brand-red dark:border-white/5 dark:bg-white/[0.03] dark:text-gray-300"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <AdSpace type="rectangle" label="Advertisement" />

                  <AdSpace
                    type="rectangle"
                    slot="rectangle_secondary"
                    label="Promosi Lainnya"
                    className="!mb-0"
                  />

                  <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/5 dark:bg-white/[0.02] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                      Baca Berikutnya
                    </p>
                    <div className="mt-5 space-y-6">
                      {sidebarRelatedArticles.length > 0 ? (
                        sidebarRelatedArticles.map((rel: any) => (
                          <NewsCard key={rel.id} article={rel} variant="minimal" site={siteParam} />
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center dark:border-white/10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Belum ada artikel terkait.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </Container>
        </article>
      </ImageLightboxWrapper>

    </PublicSiteLayout>
  )
}

function PublicBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="font-serif text-xl md:text-2xl antialiased">{block.content}</p>
    case 'heading':
      const Tag = `h${block.level}` as any
      return (
        <Tag className="font-serif font-black text-3xl md:text-5xl mt-20 mb-10 text-brand-black dark:text-white tracking-tight text-balance">
          {block.content}
        </Tag>
      )
    case 'quote':
      return (
        <div className="relative my-16 rounded-r-2xl border-l-4 border-brand-red bg-gray-50 px-6 py-10 dark:bg-white/[0.03] md:px-10 md:py-12 lg:px-16">
          <span className="absolute left-5 top-5 text-7xl font-serif leading-none text-brand-red opacity-10 select-none md:left-8 md:top-6 md:text-8xl">“</span>
          <blockquote className="italic font-serif text-2xl md:text-3xl text-brand-black dark:text-white leading-[1.3] relative z-10">
            {block.content}
            {block.attribution && (
              <footer className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red mt-6">— {block.attribution}</footer>
            )}
          </blockquote>
        </div>
      )
    case 'image':
      return (
        <figure className="my-16">
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/5">
            <SmartImage 
              src={block.url} 
              context="article_block"
              alt={block.alt || 'Post image'}
              fill
              className="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-6 flex justify-between items-start border-b border-gray-100 dark:border-white/5 pb-6">
              <span className="text-sm text-brand-text-muted dark:text-gray-400 italic leading-relaxed max-w-[80%]">{block.caption}</span>
              <span className="text-[9px] text-brand-text-muted dark:text-gray-500 uppercase tracking-widest font-black shrink-0">Foto / BeritaKarya</span>
            </figcaption>
          )}
        </figure>
      )
    case 'imageGrid':
      return (
        <div className={cn(
          "grid gap-4 my-16",
          block.columns === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
        )}>
          {block.images.map((img, i) => (
            <figure key={i} className="m-0">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/5">
                <SmartImage 
                  src={img.url} 
                  context="article_block"
                  alt={img.alt || `Grid image ${i+1}`}
                  fill
                  className="object-cover"
                />
              </div>
              {img.caption && (
                <figcaption className="mt-3 text-xs text-brand-text-muted dark:text-gray-400 italic text-center">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )
    case 'gallery':
      return (
        <div className="my-16 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {block.images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 dark:border-white/5">
                <SmartImage 
                  src={img.url} 
                  context="gallery_thumb"
                  alt={img.alt || `Gallery image ${i+1}`}
                  fill
                  className="object-cover cursor-pointer hover:scale-110 transition-transform"
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted text-center italic">
            Klik gambar untuk memperbesar galeri
          </p>
        </div>
      )
    case 'list':
      const ListTag = block.ordered ? 'ol' : 'ul'
      return (
        <ListTag className={cn(
          "my-12 space-y-4 pl-8",
          block.ordered ? "list-decimal" : "list-disc"
        )}>
          {block.items.map((item, i) => (
            <li key={i} className="font-serif text-xl md:text-2xl antialiased leading-relaxed">
              {item}
            </li>
          ))}
        </ListTag>
      )
    case 'callout':
      const variants = {
        info: 'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-300',
        warning: 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-300',
        error: 'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-300',
        success: 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300',
        editorial: 'bg-brand-surface border-gray-100 text-brand-black dark:bg-white/[0.03] dark:border-white/10 dark:text-white'
      }
      return (
        <div className={cn(
          "my-16 p-8 md:p-12 rounded-2xl border-l-4 font-serif text-xl md:text-2xl antialiased leading-relaxed shadow-sm",
          variants[block.variant as keyof typeof variants] || variants.editorial
        )}>
          {block.content}
        </div>
      )
    case 'embed':
      return (
        <div className="my-16">
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex items-center justify-center">
            {block.embedType === 'youtube' ? (
              <iframe
                src={block.url.replace('watch?v=', 'embed/')}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                title={block.title || 'YouTube video'}
              />
            ) : (
              <a href={block.url} target="_blank" rel="noopener noreferrer" className="text-brand-red font-bold underline">
                Buka konten eksternal: {block.title || block.url}
              </a>
            )}
          </div>
          {block.title && <p className="mt-4 text-center text-xs text-brand-text-muted uppercase tracking-widest font-black">{block.title}</p>}
        </div>
      )
    case 'mediaText':
      return (
        <div 
          className={cn(
            "flex flex-col gap-8 my-16 items-center w-full",
            block.align === 'right' ? "md:flex-row-reverse" : "md:flex-row"
          )}
        >
          {/* Image Column */}
          <div className="w-full md:w-1/2">
            <figure className="m-0">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/5">
                <SmartImage 
                  src={block.url || '/placeholder.jpg'} 
                  context="media_text"
                  alt={block.alt || 'Post image'}
                  fill
                  className="object-cover"
                />
              </div>
              {block.caption && (
                <figcaption className="mt-3 text-xs text-brand-text-muted dark:text-gray-400 italic text-center">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          </div>
          {/* Text Column */}
          <div className="w-full md:w-1/2">
            <p className="font-serif text-xl md:text-2xl antialiased leading-relaxed m-0 whitespace-pre-wrap">
              {block.content}
            </p>
          </div>
        </div>
      )
    default:
      return null
  }
}
