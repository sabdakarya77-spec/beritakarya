import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, CalendarDays, Eye, FileText, Sparkles, User2 } from 'lucide-react'
import { SITE_MAP } from '@beritakarya/config'
import PublicSiteLayout from '../../../../components/layout/PublicSiteLayout'
import { Container } from '../../../../components/layout/Container'
import NewsCard from '../../../../components/ui/NewsCard'
import { ROLE_LABELS } from '../../../../lib/constants'

interface Props {
  params: { site: string; id: string }
}

interface AuthorProfileResponse {
  profile: {
    id: string
    name: string
    role: string
    bio: string | null
    createdAt: string
  }
  stats: {
    publishedCount: number
    totalViews: number
  }
  recentArticles: any[]
}

async function getSiteSettings(siteId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/api/v1/sites/settings?site=${siteId}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json?.data || null
  } catch {
    return null
  }
}

async function getAuthorProfile(siteId: string, authorId: string): Promise<AuthorProfileResponse | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/api/v1/users/public/${authorId}?site=${siteId}`, {
      next: { revalidate: 60 }
    })
    if (!res.ok) return null
    const json = await res.json()
    return json?.data || null
  } catch {
    return null
  }
}

function getFallbackBio(name: string, role: string, siteName: string) {
  const roleLabel = ROLE_LABELS[role] || 'Penulis'
  return `${name} merupakan ${roleLabel.toLowerCase()} di ${siteName} yang aktif menyajikan informasi secara akurat, ringkas, dan relevan bagi pembaca.`
}

function formatJoinDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const siteParam = resolvedParams?.site || 'pusat'
  const authorId = resolvedParams?.id
  const siteConfig = SITE_MAP[siteParam] || SITE_MAP.pusat
  const profileData = await getAuthorProfile(siteParam, authorId)

  if (!profileData) {
    return {
      title: 'Profil Penulis Tidak Ditemukan',
      description: 'Profil penulis yang Anda cari tidak tersedia.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  const title = `${profileData.profile.name} - Profil Penulis ${siteConfig.name || 'BeritaKarya'}`
  const description = (profileData.profile.bio || getFallbackBio(profileData.profile.name, profileData.profile.role, siteConfig.name || 'BeritaKarya')).slice(0, 160)
  const url = `${baseUrl}/${siteParam}/penulis/${authorId}`

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      url,
      siteName: 'BeritaKarya',
      locale: 'id_ID',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@beritakarya',
    },
  }
}

export default async function AuthorProfilePage({ params }: Props) {
  const resolvedParams = await params
  const siteParam = resolvedParams?.site || 'pusat'
  const authorId = resolvedParams?.id

  const [siteSettings, profileData] = await Promise.all([
    getSiteSettings(siteParam),
    getAuthorProfile(siteParam, authorId),
  ])

  if (!profileData) notFound()

  const siteConfig = {
    id: siteParam,
    name: siteSettings?.name || SITE_MAP[siteParam]?.name || (siteParam.charAt(0).toUpperCase() + siteParam.slice(1)),
    domain: siteSettings?.domain || SITE_MAP[siteParam]?.domain || `${siteParam}.beritakarya.co`,
    description: siteSettings?.description || SITE_MAP[siteParam]?.description || `Portal berita resmi ${siteParam}.`,
    footerText: siteSettings?.footerText || SITE_MAP[siteParam]?.footerText || `© ${new Date().getFullYear()} BERITA KARYA. ALL RIGHTS RESERVED.`,
    address: siteSettings?.address || SITE_MAP[siteParam]?.address || 'Jl. Merdeka No. 123, Jakarta Pusat, Indonesia',
    contactEmail: siteSettings?.contactEmail || SITE_MAP[siteParam]?.contactEmail || 'support.beritakarya@gmail.com',
    phone: siteSettings?.phone || SITE_MAP[siteParam]?.phone || null,
    socialLinks: siteSettings?.socialLinks || SITE_MAP[siteParam]?.socialLinks || {},
    appearance: siteSettings?.appearance || SITE_MAP[siteParam]?.appearance || { primaryColor: '#e11d48' },
    trendingTopics: siteSettings?.trendingTopics || [],
    devDomain: SITE_MAP[siteParam]?.devDomain || `${siteParam}.localhost:3000`
  }

  const { profile, stats, recentArticles } = profileData
  const roleLabel = ROLE_LABELS[profile.role] || 'Penulis'
  const bio = profile.bio || getFallbackBio(profile.name, profile.role, siteConfig.name)
  const joinedAt = formatJoinDate(profile.createdAt)
  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const featuredArticle = recentArticles[0]
  const remainingArticles = recentArticles.slice(1)

  return (
    <PublicSiteLayout siteConfig={siteConfig}>
      <main className="min-h-screen bg-white dark:bg-slate-950">
        <section className="relative overflow-hidden border-b border-gray-100 bg-brand-surface pt-20 pb-16 dark:border-white/5 dark:bg-white/[0.02] md:pt-32 md:pb-24">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.16),transparent_48%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.12),transparent_55%)] dark:bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_55%)]" />
          <Container>
            <Link
              href={`/${siteParam}`}
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 transition-colors hover:text-brand-red"
            >
              <ArrowLeft size={14} />
              Kembali ke Beranda
            </Link>

            <div className="relative mt-10 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px] xl:gap-8">
              <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/5 dark:bg-white/[0.02] dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-8 xl:p-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.6rem] bg-brand-red text-2xl font-serif font-black text-white shadow-[0_24px_60px_rgba(225,29,72,0.28)] md:h-24 md:w-24 md:text-3xl">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center rounded-full border border-brand-red/15 bg-brand-red/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-brand-red">
                        Profil Penulis
                      </span>
                      <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                        <CalendarDays size={13} className="text-brand-red" />
                        Bergabung sejak {joinedAt}
                      </span>
                    </div>

                    <h1 className="mt-4 max-w-4xl text-3xl font-serif font-black tracking-tight text-brand-black dark:text-white sm:text-4xl lg:text-5xl xl:text-[3.75rem] xl:leading-[1.02]">
                      {profile.name}
                    </h1>
                    <p className="mt-4 text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">
                      {roleLabel}
                    </p>
                    <p className="mt-5 max-w-4xl text-base leading-7 text-gray-600 dark:text-gray-300 md:text-lg md:leading-8">
                      {bio}
                    </p>
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/5 dark:bg-white/[0.02] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                    <Sparkles size={14} className="text-brand-red" />
                    Ringkasan Kiprah
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 dark:border-white/5 dark:bg-white/[0.03]">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                        <FileText size={14} className="text-brand-red" />
                        Artikel Terbit
                      </div>
                      <p className="mt-3 text-2xl font-black text-brand-black dark:text-white md:text-3xl">
                        {stats.publishedCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 dark:border-white/5 dark:bg-white/[0.03]">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                        <Eye size={14} className="text-brand-red" />
                        Total Dilihat
                      </div>
                      <p className="mt-3 text-2xl font-black text-brand-black dark:text-white md:text-3xl">
                        {stats.totalViews.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-gray-100 bg-brand-black p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] dark:border-white/5 dark:bg-slate-950">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">
                    Catatan Redaksi
                  </p>
                  <p className="mt-4 text-sm leading-7 text-gray-300">
                    Seluruh artikel penulis ini telah tayang di kanal publik {siteConfig.name} dan tetap mengikuti proses kurasi serta standar editorial BeritaKarya.
                  </p>
                </div>
              </aside>
            </div>
          </Container>
        </section>

        <section className="py-16 md:py-20">
          <Container>
            <div className="mb-10 flex items-center gap-3">
              <div className="h-8 w-1 bg-brand-red" />
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-brand-black dark:text-white">
                  Tulisan Terbaru
                </h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  Artikel terbaru dari {profile.name}
                </p>
              </div>
            </div>

            {recentArticles.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] xl:gap-10">
                <div className="min-w-0">
                  {featuredArticle && (
                    <NewsCard article={featuredArticle} variant="medium" site={siteParam} priority />
                  )}
                </div>
                <div className="space-y-6">
                  {remainingArticles.length > 0 ? (
                    remainingArticles.map((article) => (
                      <NewsCard key={article.id} article={article} variant="horizontal" site={siteParam} />
                    ))
                  ) : featuredArticle ? (
                    <div className="rounded-[2rem] border border-gray-100 bg-gray-50 px-6 py-10 dark:border-white/5 dark:bg-white/[0.02]">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                        Penulis ini baru memiliki satu artikel terbit saat ini.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 px-6 py-14 text-center dark:border-white/10">
                <User2 size={34} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Belum ada artikel terbit dari penulis ini.
                </p>
              </div>
            )}
          </Container>
        </section>
      </main>
    </PublicSiteLayout>
  )
}
