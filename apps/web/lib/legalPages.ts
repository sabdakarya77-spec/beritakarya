/** Metadata & helpers for public legal / policy document pages. */

export const LEGAL_PAGE_EYEBROW = 'Halaman Informasi'
export const LEGAL_DOCUMENT_EYEBROW = 'Dokumen Portal'

export const LEGAL_SLUGS = [
  'about',
  'ethics',
  'editorial',
  'terms',
  'media-siber',
] as const

export type LegalSlug = (typeof LEGAL_SLUGS)[number]

export const LEGAL_SLUG_TITLES: Record<LegalSlug, string> = {
  about: 'Tentang Kami',
  ethics: 'Kode Etik',
  editorial: 'Redaksi',
  terms: 'Ketentuan Penggunaan',
  'media-siber': 'Pedoman Media Siber',
}

export const LEGAL_PAGE_INTROS: Record<LegalSlug, string> = {
  about: 'Mengenal identitas, arah editorial, dan komitmen portal dalam melayani pembaca di wilayah ini.',
  ethics: 'Pedoman etika redaksi dan prinsip kerja jurnalistik yang menjadi dasar setiap proses peliputan.',
  editorial: 'Struktur redaksi, penanggung jawab, dan informasi kelembagaan yang menjadi fondasi operasional portal.',
  terms: 'Ketentuan penggunaan layanan, hak cipta, serta batas tanggung jawab yang berlaku bagi seluruh pengguna.',
  'media-siber':
    'Rujukan pedoman media siber dan praktik publikasi yang mengikuti prinsip tanggung jawab pers.',
}

export const PRIVACY_PAGE = {
  title: 'Kebijakan Privasi',
  intro:
    'Penjelasan mengenai bagaimana portal mengumpulkan, menggunakan, menyimpan, dan melindungi data pengguna serta informasi yang relevan dengan operasional layanan.',
  settingsKey: 'privacyPolicy' as const,
}

type SiteSettingsLike = {
  aboutUs?: string | null
  codeOfEthics?: string | null
  editorial?: string | null
  termsOfService?: string | null
  mediaSiber?: string | null
  privacyPolicy?: string | null
}

const CONTENT_BY_SLUG: Record<
  LegalSlug,
  { title: string; settingsKey: keyof SiteSettingsLike }
> = {
  about: { title: LEGAL_SLUG_TITLES.about, settingsKey: 'aboutUs' },
  ethics: { title: LEGAL_SLUG_TITLES.ethics, settingsKey: 'codeOfEthics' },
  editorial: { title: LEGAL_SLUG_TITLES.editorial, settingsKey: 'editorial' },
  terms: { title: LEGAL_SLUG_TITLES.terms, settingsKey: 'termsOfService' },
  'media-siber': { title: LEGAL_SLUG_TITLES['media-siber'], settingsKey: 'mediaSiber' },
}

export function isLegalSlug(slug: string): slug is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(slug)
}

export function resolveLegalPage(
  slug: LegalSlug,
  siteSettings: SiteSettingsLike | null | undefined
): { title: string; content: string | null | undefined; intro: string } {
  const meta = CONTENT_BY_SLUG[slug]
  const content = siteSettings?.[meta.settingsKey] ?? null

  return {
    title: meta.title,
    content,
    intro: LEGAL_PAGE_INTROS[slug],
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

/** Normalize CMS HTML or plain text into safe HTML for legal document bodies. */
export function formatLegalRichContent(value: string | null | undefined) {
  if (!value) return ''
  if (looksLikeHtml(value)) return value

  return value
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('')
}
