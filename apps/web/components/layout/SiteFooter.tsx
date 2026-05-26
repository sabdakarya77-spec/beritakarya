'use client';

import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';
import { SiFacebook, SiInstagram, SiTelegram, SiTiktok, SiWhatsapp, SiX, SiYoutube } from 'react-icons/si';

import { CategoryItem } from '../../lib/constants';
import { Container } from './Container';
import { ALL_LEGAL_PAGES } from '../../lib/legalPages';

interface SiteFooterProps {
  siteConfig: any;
  categories: CategoryItem[];
}

function buildWhatsAppLink(phone?: string | null) {
  if (!phone) return '';

  const normalized = phone.replace(/[^\d+]/g, '');
  if (!normalized) return '';

  if (normalized.startsWith('+')) {
    return `https://wa.me/${normalized.slice(1)}`;
  }

  if (normalized.startsWith('0')) {
    return `https://wa.me/62${normalized.slice(1)}`;
  }

  return `https://wa.me/${normalized}`;
}

export default function SiteFooter({ siteConfig, categories }: SiteFooterProps) {
  const activeSite = siteConfig?.id || 'pusat';
  const resolvedSocialLinks = {
    whatsapp: siteConfig?.socialLinks?.whatsapp?.trim() || buildWhatsAppLink(siteConfig?.phone),
    facebook: siteConfig?.socialLinks?.facebook?.trim() || '',
    tiktok: siteConfig?.socialLinks?.tiktok?.trim() || '',
    telegram: siteConfig?.socialLinks?.telegram?.trim() || '',
    youtube: siteConfig?.socialLinks?.youtube?.trim() || '',
    twitter: siteConfig?.socialLinks?.twitter?.trim() || '',
    instagram: siteConfig?.socialLinks?.instagram?.trim() || '',
  };
  const mainCategories = categories
    .filter(c => c.slug !== 'terbaru' && c.slug !== 'tersimpan' && c.slug !== 'advertorial')
    .slice(0, 9);
  
  const partnershipLinks = [
    { href: `/${activeSite}/p/ads`, label: 'Iklan' },
    { href: `/${activeSite}?cat=advertorial`, label: 'Advertorial' },
    { href: `/${activeSite}/p/ads`, label: 'Kemitraan & Partner' },
  ];

  const bottomLinks = ALL_LEGAL_PAGES.map((page) => ({
    href: page.href(activeSite),
    label: page.title,
  }));
  const socialLinks = [
    { href: resolvedSocialLinks.whatsapp, label: 'WhatsApp', Icon: SiWhatsapp },
    { href: resolvedSocialLinks.facebook, label: 'Facebook', Icon: SiFacebook },
    { href: resolvedSocialLinks.tiktok, label: 'TikTok', Icon: SiTiktok },
    { href: resolvedSocialLinks.telegram, label: 'Telegram', Icon: SiTelegram },
    { href: resolvedSocialLinks.youtube, label: 'YouTube', Icon: SiYoutube },
    { href: resolvedSocialLinks.twitter, label: 'X', Icon: SiX },
    { href: resolvedSocialLinks.instagram, label: 'Instagram', Icon: SiInstagram },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="mt-28 border-t border-black/5 bg-white pt-16 pb-12 text-brand-text transition-colors duration-500 dark:border-white/5 dark:bg-[#020617]">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="col-span-1">
            <Link href={`/${activeSite}`} className="flex flex-col mb-5">
              <span className="font-serif text-3xl font-black tracking-tighter uppercase">
                {(() => {
                  const siteName = siteConfig?.name || 'BERITA KARYA';
                  const nameParts = siteName.split(' ');
                  const firstName = nameParts[0] || 'BERITA';
                  const lastName = nameParts.slice(1).join(' ') || 'KARYA';
                  return (
                    <>
                      <span className="text-brand-red">{firstName}</span>{' '}
                      <span className="text-brand-black dark:text-white">{lastName}</span>
                    </>
                  );
                })()}
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-brand-text-muted opacity-80">
              {siteConfig?.description || "Portal berita independen yang berfokus pada kedalaman investigasi dan kejernihan melihat realitas Nusantara."}
            </p>
            <div className="mb-6 flex gap-2">
              {socialLinks.map(({ href, label, Icon }, index) => (
                <a
                  key={`${href}-${index}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-brand-red transition-colors rounded-xl group"
                >
                  <Icon size={14} className="text-brand-text-muted group-hover:text-white" />
                </a>
              ))}
            </div>
            <div className="space-y-2">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-brand-text-muted">
                <MapPin size={12} className="shrink-0 mt-0.5 text-brand-red" />
                <span>{siteConfig?.address || "Jl. Merdeka No. 123, Jakarta Pusat, Indonesia"}</span>
              </p>
              <p className="flex items-center gap-2 text-sm text-brand-text-muted">
                <Phone size={12} className="text-brand-text-muted opacity-60" /> {siteConfig?.phone || "+62 815 9921 922"}
              </p>
              {siteConfig?.contactEmail && (
                <p className="flex items-center gap-2 text-sm text-brand-text-muted">
                  <Mail size={12} className="text-brand-text-muted opacity-60" /> {siteConfig.contactEmail}
                </p>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <h5 className="mb-5 text-[11px] font-black uppercase tracking-[0.16em] text-brand-red">KATEGORI UTAMA</h5>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {mainCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${siteConfig.id}?cat=${encodeURIComponent(cat.slug)}`}
                  className="text-sm font-semibold text-brand-text-muted transition-all hover:text-brand-red dark:text-gray-400"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h5 className="mb-5 text-[11px] font-black uppercase tracking-[0.16em] text-brand-red">KERJA SAMA</h5>
            <ul className="space-y-3 text-sm text-brand-text-muted">
              {partnershipLinks.map((item, index) => (
                <li key={`${item.href}-${index}`}>
                  <Link href={item.href} className="hover:text-brand-red transition-colors font-semibold">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 border-t border-black/5 pt-8 dark:border-white/5 mb-6">
          {bottomLinks.map((item) => (
            <Link key={item.href} href={item.href} className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-text-muted opacity-80 hover:text-brand-red transition-colors">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="text-center">
          <span suppressHydrationWarning className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-text-muted opacity-60">
            {siteConfig?.footerText || `© ${new Date().getFullYear()} PT SABDA KARYA NUSANTARA (BERITA KARYA DIGITAL GROUP). ALL RIGHTS RESERVED.`}
          </span>
        </div>
      </Container>
    </footer>
  );
}
