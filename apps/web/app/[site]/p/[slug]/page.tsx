import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_MAP } from '@beritakarya/config'
import PublicSiteLayout from '../../../../components/layout/PublicSiteLayout'
import { constructMetadata } from '../../../../lib/metadata'
import Link from 'next/link'
import { ArrowRight, Image as ImageIcon, Video, CheckCircle2, ChevronRight } from 'lucide-react'
import { Container } from '../../../../components/layout/Container'

async function getSiteSettings(site: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/api/v1/sites/settings?site=${site}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data
  } catch (e) {
    return null
  }
}

export async function generateMetadata({ params }: { params: { site: string; slug: string } }): Promise<Metadata> {
  const resolvedParams = await params
  const siteParam = resolvedParams.site
  const slug = resolvedParams.slug
  
  const titles: Record<string, string> = {
    about: 'Tentang Kami',
    ethics: 'Kode Etik',
    editorial: 'Redaksi',
    ads: 'Iklan'
  }

  const siteSettings = await getSiteSettings(siteParam)
  const siteName = siteSettings?.name || siteParam.charAt(0).toUpperCase() + siteParam.slice(1)

  return constructMetadata({
    title: `${titles[slug] || 'Informasi'} - ${siteName}`,
    siteParam
  })
}

export default async function InfoPage({ params }: { params: { site: string; slug: string } }) {
  const resolvedParams = await params
  const siteParam = resolvedParams.site
  const slug = resolvedParams.slug

  const siteSettings = await getSiteSettings(siteParam)
  
  const siteConfig = {
    id: siteParam,
    name: siteSettings?.name || (SITE_MAP[siteParam] as any)?.name || siteParam,
    logoUrl: siteSettings?.logoUrl || (SITE_MAP[siteParam] as any)?.logoUrl || null,
    address: siteSettings?.address || (SITE_MAP[siteParam] as any)?.address || null,
    contactEmail: siteSettings?.contactEmail || (SITE_MAP[siteParam] as any)?.contactEmail || null,
    appearance: siteSettings?.appearance || (SITE_MAP[siteParam] as any)?.appearance || { primaryColor: '#e11d48' },
    socialLinks: siteSettings?.socialLinks || (SITE_MAP[siteParam] as any)?.socialLinks || {}
  }

  const contentMap: Record<string, { title: string; content: string | null }> = {
    about: { title: 'Tentang Kami', content: siteSettings?.aboutUs },
    ethics: { title: 'Kode Etik', content: siteSettings?.codeOfEthics },
    editorial: { title: 'Redaksi', content: siteSettings?.editorial },
    ads: { title: 'Iklan', content: siteSettings?.advertising }
  }

  const info = contentMap[slug]
  if (!info) notFound()

  const isAds = slug === 'ads'

  return (
    <PublicSiteLayout siteConfig={siteConfig as any}>
      <Container>
        <div className={`py-20 ${isAds ? 'max-w-6xl' : 'max-w-4xl'} mx-auto`}>
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[1px] bg-brand-red"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red">Halaman Informasi</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tight">
              {isAds ? 'Layanan Iklan Mandiri' : info.title}
            </h1>
            {isAds && (
              <p className="text-sm md:text-base text-gray-500 font-bold uppercase tracking-widest mt-4 max-w-2xl leading-relaxed">
                Skyrocket Bisnis Anda Melalui Jaringan Pembaca Lokal Terbesar dan Militan di Wilayah {siteConfig.name}!
              </p>
            )}
          </div>

          {isAds ? (
            <div className="space-y-20">
              {/* Value Proposition Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-8 shadow-2xl shadow-black/5 rounded-sm hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-brand-red/10 rounded-sm flex items-center justify-center mb-6">
                    <CheckCircle2 size={24} className="text-brand-red" />
                  </div>
                  <h3 className="text-base font-black text-brand-black dark:text-white uppercase tracking-tight mb-2">Trafik Regional Murni</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    Iklan Anda ditampilkan langsung kepada audiens lokal yang aktif mencari berita daerah mereka di seluruh portal jaringan BeritaKarya.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-8 shadow-2xl shadow-black/5 rounded-sm hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-brand-red/10 rounded-sm flex items-center justify-center mb-6">
                    <ImageIcon size={24} className="text-brand-red" />
                  </div>
                  <h3 className="text-base font-black text-brand-black dark:text-white uppercase tracking-tight mb-2">Gambar & Video Banner</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    Dukung format banner statis premium, GIF animasi dinamis, hingga pemutar klip video promosi interaktif beresolusi tinggi.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-8 shadow-2xl shadow-black/5 rounded-sm hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-brand-red/10 rounded-sm flex items-center justify-center mb-6">
                    <Video size={24} className="text-brand-red" />
                  </div>
                  <h3 className="text-base font-black text-brand-black dark:text-white uppercase tracking-tight mb-2">Transparansi Performa</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    Akses langsung ke dasbor mitra pengiklan untuk memantau grafik penayangan (impresi), jumlah klik, serta rasio CTR iklan Anda secara real-time.
                  </p>
                </div>
              </div>

              {/* Featured Slot Packages */}
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-6">
                  <div>
                    <h3 className="text-xl font-serif font-black text-brand-black dark:text-white uppercase tracking-tight">Pilihan Slot Iklan Unggulan</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Format standardisasi Dewan Pers & IAB Internasional</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Slot 1 */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-8 rounded-sm shadow-xl shadow-black/5 flex flex-col justify-between">
                    <div>
                      <span className="px-2.5 py-1 bg-brand-red/10 text-brand-red text-[9px] font-black uppercase tracking-wider rounded-sm">Slot Premium</span>
                      <h4 className="text-base font-black text-brand-black dark:text-white uppercase tracking-tight mt-4 mb-2">Leaderboard Atas (Header Banner)</h4>
                      <p className="text-xs text-brand-text-muted leading-relaxed mb-6">
                        Slot paling prestisius yang berada langsung di bagian atas header halaman utama. Memberikan tingkat impresi instan (First fold) tertinggi saat portal pertama kali dimuat.
                      </p>
                      <ul className="space-y-2 mb-8 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                        <li className="flex items-center gap-2"><ChevronRight size={14} className="text-brand-red" /> Ukuran: 970 x 90 piksel / Mobile: 320 x 50px</li>
                        <li className="flex items-center gap-2"><ChevronRight size={14} className="text-brand-red" /> Format: Gambar statis, GIF, Video klip</li>
                        <li className="flex items-center gap-2"><ChevronRight size={14} className="text-brand-red" /> Tarif: Kontrol penuh super admin</li>
                      </ul>
                    </div>
                    <div className="h-[90px] w-full bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-sm flex items-center justify-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mockup Banner: 970 x 90</p>
                    </div>
                  </div>

                  {/* Slot 2 */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-8 rounded-sm shadow-xl shadow-black/5 flex flex-col justify-between">
                    <div>
                      <span className="px-2.5 py-1 bg-brand-red/10 text-brand-red text-[9px] font-black uppercase tracking-wider rounded-sm">Slot Populer</span>
                      <h4 className="text-base font-black text-brand-black dark:text-white uppercase tracking-tight mt-4 mb-2">Dalam Artikel (In-Feed Article Body)</h4>
                      <p className="text-xs text-brand-text-muted leading-relaxed mb-6">
                        Iklan yang disisipkan secara mulus di sela-sela bacaan artikel (biasanya setelah paragraf ke-3). Memiliki tingkat klik-tayang (CTR) tertinggi karena berada tepat di jalur baca pembaca.
                      </p>
                      <ul className="space-y-2 mb-8 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                        <li className="flex items-center gap-2"><ChevronRight size={14} className="text-brand-red" /> Ukuran: 300 x 250 piksel (Rectangle)</li>
                        <li className="flex items-center gap-2"><ChevronRight size={14} className="text-brand-red" /> Format: Gambar statis, Animasi GIF</li>
                        <li className="flex items-center gap-2"><ChevronRight size={14} className="text-brand-red" /> Tarif: Sesuai jangkauan wilayah</li>
                      </ul>
                    </div>
                    <div className="h-[120px] w-full bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-sm flex items-center justify-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mockup Banner: 300 x 250</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glowing Call to Action Box */}
              <div className="bg-brand-black dark:bg-[#080d18] border border-white/5 p-10 sm:p-12 text-center rounded-sm relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand-red/10 to-transparent pointer-events-none" />
                <h3 className="text-2xl md:text-3xl font-serif font-black text-white uppercase tracking-tight mb-4">
                  Siap Meluncurkan Kampanye Iklan Anda?
                </h3>
                <p className="text-xs md:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed mb-8">
                  Bergabunglah bersama ribuan mitra pengiklan regional BeritaKarya sekarang. Proses pendaftaran instan, buat iklan Anda mengudara, dan pantau hasilnya langsung secara transparan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link 
                    href="/register?role=advertiser"
                    className="px-8 py-4 bg-brand-red text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-brand-black transition-all rounded-sm flex items-center gap-2 group shadow-lg shadow-brand-red/20 w-full sm:w-auto justify-center"
                  >
                    Daftar Sebagai Pengiklan
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    href="/login"
                    className="px-8 py-4 bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-brand-black transition-all rounded-sm w-full sm:w-auto justify-center"
                  >
                    Masuk Portal Mitra
                  </Link>
                </div>
              </div>

              {/* Terms and Conditions (the original advertising content from DB) */}
              <div className="border-t border-gray-100 dark:border-white/5 pt-12">
                <div className="max-w-4xl mx-auto">
                  <h4 className="text-sm font-serif font-black text-brand-black dark:text-white uppercase tracking-wider mb-6">Syarat & Ketentuan Umum Periklanan</h4>
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                    {info.content ? (
                      <div className="whitespace-pre-wrap text-brand-text-muted leading-relaxed">
                        {info.content}
                      </div>
                    ) : (
                      <p className="text-brand-text-muted italic text-xs">
                        Ketentuan umum periklanan tertulis belum diunggah oleh redaksi regional {siteConfig.name}. Hubungi admin kami untuk detail syarat lengkap.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              {info.content ? (
                <div className="whitespace-pre-wrap text-brand-text-muted leading-relaxed">
                  {info.content}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 p-12 text-center rounded-sm">
                  <p className="text-brand-text-muted italic text-sm">
                    Konten belum tersedia untuk halaman ini. Silakan hubungi redaksi {siteConfig.name} untuk informasi lebih lanjut.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </PublicSiteLayout>
  )
}