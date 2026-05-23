'use client';

import Link from 'next/link';
import { MapPin, Mail, MessageCircle } from 'lucide-react';
import { SiFacebook, SiInstagram, SiTelegram, SiTiktok, SiWhatsapp, SiX, SiYoutube } from 'react-icons/si';

import { CategoryItem } from '../../lib/constants';

interface SiteFooterProps {
  siteConfig: any;
  categories: CategoryItem[];
}

export default function SiteFooter({ siteConfig, categories }: SiteFooterProps) {
  const activeSite = siteConfig?.id || 'pusat';
  const supportEmail = siteConfig?.contactEmail || 'support.beritakarya@gmail.com';
  const infoLinks = [
    { href: `/${activeSite}/p/about`, label: 'Tentang Kami' },
    { href: `/${activeSite}/p/ethics`, label: 'Kode Etik' },
    { href: `/${activeSite}/p/editorial`, label: 'Redaksi' },
    { href: `/${activeSite}/p/ads`, label: 'Iklan' },
  ];
  const legalLinks = [
    { href: `/${activeSite}/kebijakan-privasi`, label: 'Kebijakan Privasi' },
    { href: `/${activeSite}/p/ethics`, label: 'Kode Etik' },
    { href: `/${activeSite}/p/editorial`, label: 'Redaksi' },
  ];
  const socialLinks = [
    { href: siteConfig?.socialLinks?.whatsapp, Icon: SiWhatsapp },
    { href: siteConfig?.socialLinks?.facebook, Icon: SiFacebook },
    { href: siteConfig?.socialLinks?.tiktok, Icon: SiTiktok },
    { href: siteConfig?.socialLinks?.telegram, Icon: SiTelegram },
    { href: siteConfig?.socialLinks?.youtube, Icon: SiYoutube },
    { href: siteConfig?.socialLinks?.twitter, Icon: SiX },
    { href: siteConfig?.socialLinks?.instagram, Icon: SiInstagram },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="bg-white dark:bg-black/90 text-brand-text mt-32 pt-16 pb-12 border-t border-gray-100 dark:border-white/5 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <Link href={`/${activeSite}`} className="flex flex-col mb-5">
              <span className="font-serif text-3xl font-black tracking-tighter uppercase">
                <span className="text-brand-red">BERITA</span>
                <span className="text-brand-black dark:text-white">KARYA</span>
              </span>
            </Link>
            <p className="text-brand-text-muted text-xs leading-relaxed mb-6 max-w-xs opacity-80">
              {siteConfig?.description || "Portal berita independen yang berfokus pada kedalaman investigasi dan kejernihan melihat realitas Nusantara."}
            </p>
            <div className="mb-6 space-y-2">
              <p className="text-brand-text-muted text-xs flex items-start gap-2 leading-relaxed">
                <MapPin size={12} className="shrink-0 mt-0.5 text-brand-red" />
                <span>{siteConfig?.address || "Jl. Merdeka No. 123, Jakarta Pusat, Indonesia"}</span>
              </p>
              {siteConfig?.contactEmail && (
                <p className="text-brand-text-muted text-xs flex items-center gap-2">
                  <Mail size={12} className="text-brand-text-muted opacity-60" /> {siteConfig.contactEmail}
                </p>
              )}
              {siteConfig?.phone && (
                <p className="text-brand-text-muted text-xs flex items-center gap-2">
                  <MessageCircle size={12} className="text-brand-text-muted opacity-60" /> {siteConfig.phone}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {socialLinks.map(({ href, Icon }, index) => (
                <a
                  key={`${href}-${index}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-brand-red transition-colors rounded-xl group"
                >
                  <Icon size={14} className="text-brand-text-muted group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-5 text-brand-red">Kategori</h5>
            <div className="flex flex-wrap gap-1.5">
              {categories.filter(c => c.slug !== 'terbaru' && c.slug !== 'tersimpan').slice(0, 12).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${siteConfig.id}?cat=${encodeURIComponent(cat.slug)}`}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-white/5 hover:bg-brand-red/10 hover:text-brand-red text-[9px] font-black uppercase tracking-wider rounded-full transition-all"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            {categories.filter(c => c.slug !== 'terbaru' && c.slug !== 'tersimpan').length > 12 && (
              <p className="text-[9px] text-brand-text-muted mt-3 opacity-60">
                +{categories.filter(c => c.slug !== 'terbaru' && c.slug !== 'tersimpan').length - 12} kategori lainnya
              </p>
            )}
          </div>

          <div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-5 text-brand-red">Informasi</h5>
            <ul className="text-brand-text-muted text-xs space-y-3">
              {infoLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-brand-red transition-colors font-semibold">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-5 text-brand-red">Dukungan</h5>
            <div className="flex flex-col gap-3">
              <p className="text-brand-text-muted text-xs leading-relaxed">
                Bantu kami menjaga independensi jurnalisme dengan menjadi anggota.
              </p>
              <a
                href={`mailto:${supportEmail}?subject=${encodeURIComponent(`Dukungan untuk ${siteConfig?.name || 'BeritaKarya'}`)}`}
                className="inline-flex items-center justify-center bg-brand-red text-white py-2.5 px-5 text-[10px] font-black uppercase tracking-widest hover:bg-brand-black dark:hover:bg-white dark:hover:text-brand-black transition-all rounded-xl"
              >
                Dukung Kami
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span suppressHydrationWarning className="text-[9px] uppercase font-black tracking-[0.3em] text-brand-text-muted opacity-60">
            {siteConfig?.footerText || `© ${new Date().getFullYear()} BERITA KARYA. ALL RIGHTS RESERVED.`}
          </span>
          <div className="flex gap-6 text-[9px] uppercase font-black tracking-widest text-brand-text-muted opacity-60">
            {legalLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-brand-red">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
