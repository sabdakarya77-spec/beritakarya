'use client';

import Link from 'next/link';
import { MapPin, Mail, MessageCircle } from 'lucide-react';
import { SiFacebook, SiInstagram, SiTelegram, SiTiktok, SiWhatsapp, SiX, SiYoutube } from 'react-icons/si';

import { CategoryItem } from '../../lib/constants';
import { Container } from './Container';

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
  const supportEmail = siteConfig?.contactEmail || 'support.beritakarya@gmail.com';
  const resolvedSocialLinks = {
    whatsapp: siteConfig?.socialLinks?.whatsapp?.trim() || buildWhatsAppLink(siteConfig?.phone),
    facebook: siteConfig?.socialLinks?.facebook?.trim() || '',
    tiktok: siteConfig?.socialLinks?.tiktok?.trim() || '',
    telegram: siteConfig?.socialLinks?.telegram?.trim() || '',
    youtube: siteConfig?.socialLinks?.youtube?.trim() || '',
    twitter: siteConfig?.socialLinks?.twitter?.trim() || '',
    instagram: siteConfig?.socialLinks?.instagram?.trim() || '',
  };
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
    { href: resolvedSocialLinks.whatsapp, label: 'WhatsApp', Icon: SiWhatsapp },
    { href: resolvedSocialLinks.facebook, label: 'Facebook', Icon: SiFacebook },
    { href: resolvedSocialLinks.tiktok, label: 'TikTok', Icon: SiTiktok },
    { href: resolvedSocialLinks.telegram, label: 'Telegram', Icon: SiTelegram },
    { href: resolvedSocialLinks.youtube, label: 'YouTube', Icon: SiYoutube },
    { href: resolvedSocialLinks.twitter, label: 'X', Icon: SiX },
    { href: resolvedSocialLinks.instagram, label: 'Instagram', Icon: SiInstagram },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="mt-28 border-t border-black/5 bg-white pt-16 pb-12 text-brand-text transition-colors duration-500 dark:border-white/5 dark:bg-black/90">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <Link href={`/${activeSite}`} className="flex flex-col mb-5">
              <span className="font-serif text-3xl font-black tracking-tighter uppercase">
                <span className="text-brand-red">BERITA</span>
                <span className="text-brand-black dark:text-white">KARYA</span>
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-brand-text-muted opacity-80">
              {siteConfig?.description || "Portal berita independen yang berfokus pada kedalaman investigasi dan kejernihan melihat realitas Nusantara."}
            </p>
            <div className="mb-6 space-y-2">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-brand-text-muted">
                <MapPin size={12} className="shrink-0 mt-0.5 text-brand-red" />
                <span>{siteConfig?.address || "Jl. Merdeka No. 123, Jakarta Pusat, Indonesia"}</span>
              </p>
              {siteConfig?.contactEmail && (
                <p className="flex items-center gap-2 text-sm text-brand-text-muted">
                  <Mail size={12} className="text-brand-text-muted opacity-60" /> {siteConfig.contactEmail}
                </p>
              )}
              {siteConfig?.phone && (
                <p className="flex items-center gap-2 text-sm text-brand-text-muted">
                  <MessageCircle size={12} className="text-brand-text-muted opacity-60" /> {siteConfig.phone}
                </p>
              )}
            </div>
            <div className="flex gap-2">
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
          </div>

          <div>
            <h5 className="mb-5 text-[11px] font-black uppercase tracking-[0.16em] text-brand-red">Kategori</h5>
            <div className="flex flex-wrap gap-1.5">
              {categories.filter(c => c.slug !== 'terbaru' && c.slug !== 'tersimpan').slice(0, 12).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${siteConfig.id}?cat=${encodeURIComponent(cat.slug)}`}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all hover:bg-brand-red/10 hover:text-brand-red dark:bg-white/5"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            {categories.filter(c => c.slug !== 'terbaru' && c.slug !== 'tersimpan').length > 12 && (
              <p className="mt-3 text-[11px] text-brand-text-muted opacity-60">
                +{categories.filter(c => c.slug !== 'terbaru' && c.slug !== 'tersimpan').length - 12} kategori lainnya
              </p>
            )}
          </div>

          <div>
            <h5 className="mb-5 text-[11px] font-black uppercase tracking-[0.16em] text-brand-red">Informasi</h5>
            <ul className="space-y-3 text-sm text-brand-text-muted">
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
            <h5 className="mb-5 text-[11px] font-black uppercase tracking-[0.16em] text-brand-red">Dukungan</h5>
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-brand-text-muted">
                Bantu kami menjaga independensi jurnalisme dengan menjadi anggota.
              </p>
              <a
                href={`mailto:${supportEmail}?subject=${encodeURIComponent(`Dukungan untuk ${siteConfig?.name || 'BeritaKarya'}`)}`}
                className="inline-flex items-center justify-center rounded-xl bg-brand-red px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-all hover:bg-brand-black dark:hover:bg-white dark:hover:text-brand-black"
              >
                Dukung Kami
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-8 dark:border-white/5 md:flex-row">
          <span suppressHydrationWarning className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-text-muted opacity-60">
            {siteConfig?.footerText || `© ${new Date().getFullYear()} BERITA KARYA. ALL RIGHTS RESERVED.`}
          </span>
          <div className="flex gap-6 text-[11px] font-black uppercase tracking-[0.16em] text-brand-text-muted opacity-60">
            {legalLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-brand-red">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
