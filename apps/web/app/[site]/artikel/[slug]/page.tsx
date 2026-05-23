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
import AuthorCard from '../../../../components/ui/AuthorCard'
import ArticleSharePanel from '../../../../components/ui/ArticleSharePanel'
import EditorialBadge from '../../../../components/ui/EditorialBadge'
import { resolveArticleBadge } from '../../../../lib/resolveArticleBadge'
import { BookOpen, Printer } from 'lucide-react'
import { SiWhatsapp, SiX } from 'react-icons/si'
import { Metadata } from 'next'
import { cn } from '../../../../lib/utils'
import CommentSection from '../../../../components/ui/CommentSection'
import FontSizeControl from '../../../../components/ui/FontSizeControl'
import ArticleActions from '../../../../components/ui/ArticleActions'
import ImageLightboxWrapper from '../../../../components/ui/ImageLightboxWrapper'
import { Container } from '../../../../components/layout/Container'

interface Props {
  params: { site: string; slug: string }
}

import { constructMetadata } from '../../../../lib/metadata'

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
  } catch (e) {
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
      "url": `${process.env.NEXT_PUBLIC_URL}/${siteParam}`
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

  return (
    <PublicSiteLayout siteConfig={siteConfig}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />
      <ShareSidebar title={article.title} url={articleUrl} />
      
      <ImageLightboxWrapper>
        <article className="min-h-screen bg-white dark:bg-slate-950">
          {/* --- HEADER SECTION --- */}
          <header className="w-full bg-brand-surface dark:bg-white/[0.02] pt-20 pb-16 md:pt-36 md:pb-28 border-b border-gray-100 dark:border-white/5">
            <Container size="content">
              <div className="flex flex-col items-start gap-4 mb-12 md:mb-14">
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  {badgeVariant && (
                    <EditorialBadge
                      variant={badgeVariant}
                      size="sm"
                      className="rounded-full px-3 py-1 shadow-sm shadow-black/5"
                    />
                  )}
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em]">
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

              <h1 className="max-w-4xl text-4xl md:text-7xl font-serif font-black text-brand-black dark:text-white leading-[1.02] tracking-tighter mb-14 md:mb-16 text-balance">
                {article.title}
              </h1>

              <div className="flex items-center gap-3 mb-10 md:mb-12">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + articleUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                >
                  <SiWhatsapp className="text-sm" />
                  WhatsApp
                </a>
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-800 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-slate-950"
                >
                  <SiX className="text-sm" />
                  X
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-8 gap-x-8 border-t border-gray-100 dark:border-white/10 pt-10 md:pt-12">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-red flex items-center justify-center text-white text-lg font-serif italic shadow-lg shadow-brand-red/20">
                    {article.author?.name?.[0] || 'R'}
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-black text-brand-black dark:text-white uppercase tracking-widest">{article.author?.name || 'Redaksi'}</div>
                    <div className="text-[9px] text-brand-text-muted font-bold uppercase tracking-widest mt-0.5">Staf Redaksi BeritaKarya</div>
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

                <div className="ml-auto hidden lg:flex items-center gap-3 rounded-full border border-gray-100 bg-gray-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/[0.025]">
                  <span className="pl-1 text-[9px] font-black uppercase tracking-[0.22em] text-gray-400">
                    Reader Tools
                  </span>
                  <FontSizeControl />
                  <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />
                  <ArticleActions />
                </div>
              </div>
            </Container>
          </header>

          {/* --- HERO IMAGE --- */}
          <div className="mb-20 md:mb-24">
            <Container>
              <figure className="max-w-6xl mx-auto">
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
                <figcaption className="mt-5 flex flex-col gap-3 border-b border-gray-100 pb-6 text-brand-text-muted dark:border-white/5 dark:text-gray-400 md:flex-row md:items-start md:justify-between">
                  {coverImageCaption ? (
                    <p className="max-w-2xl text-sm italic leading-relaxed">
                      {coverImageCaption}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-[9px] font-black uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500">
                    Foto / Dokumentasi Redaksi
                  </span>
                </figcaption>
              </figure>
            </Container>
          </div>

          {/* --- CONTENT SECTION --- */}
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-16 md:gap-32 mb-32">
              {/* Main Content */}
              <div className="max-w-[760px] mx-auto lg:mx-0">
                {/* Lead Paragraph */}
                <div className="mb-20 md:mb-24">
                  <div className="max-w-3xl border-l border-brand-red/20 pl-6 md:pl-8">
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

                {/* Author Bio */}
                <div className="mt-20">
                  <AuthorCard author={article.author} site={siteParam} />
                </div>

                {/* Comment Section */}
                <div id="comments">
                  <CommentSection articleId={article.id} />
                </div>
              </div>

              {/* Sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-40 space-y-20">
                  {/* Share Box */}
                  <ArticleSharePanel title={article.title} url={articleUrl} />

                  {/* Recommended Widget */}
                  <div>
                    <div className="flex items-center gap-3 mb-10">
                       <div className="w-1 h-8 bg-brand-red" />
                       <h4 className="text-xs font-black uppercase tracking-[0.3em] text-brand-black dark:text-white">Rekomendasi</h4>
                    </div>
                    <div className="space-y-10">
                      {relatedArticles.length > 0 ? (
                        relatedArticles.map((rel: any) => (
                          <NewsCard key={rel.id} article={rel} variant="minimal" site={params.site} />
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">Memuat post terkait...</p>
                      )}
                    </div>
                  </div>

                  {/* Sidebar Ad */}
                  <div className="pt-10">
                    <AdSpace type="rectangle" />
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
        <div className="relative my-16 py-12 px-16 border-l-4 border-brand-red bg-gray-50 dark:bg-white/[0.03] rounded-r-2xl">
          <span className="absolute top-6 left-8 text-8xl font-serif text-brand-red opacity-10 leading-none select-none">“</span>
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
