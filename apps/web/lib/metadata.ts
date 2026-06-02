import { Metadata } from 'next'

function resolveBaseUrl() {
  return process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
}

export function constructMetadata({
  title = 'BeritaKarya — Portal Berita Terpercaya',
  description = 'Informasi terkini dan terpercaya dari berbagai penjuru daerah.',
  image = '/logo.png',
  icons = '/favicon.ico',
  noIndex = false,
  siteParam = '',
  slug = '',
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  keywords,
  canonicalPath,
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
  siteParam?: string
  slug?: string
  type?: 'website' | 'article' | 'profile' | 'book'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  keywords?: string[]
  canonicalPath?: string
} = {}): Metadata {
  const baseUrl = resolveBaseUrl()
  const canonical = canonicalPath
    ? `${baseUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
    : slug
    ? siteParam
      ? `${baseUrl}/${siteParam}/artikel/${slug}`
      : `${baseUrl}/artikel/${slug}`
    : siteParam
    ? `${baseUrl}/${siteParam}`
    : `${baseUrl}/`

  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`
  const resolvedType = slug ? 'article' : type

  return {
    title,
    description,
    keywords,
    authors: author ? [{ name: author }] : undefined,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'BeritaKarya',
      locale: 'id_ID',
      type: resolvedType,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(author ? { authors: [author] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@beritakarya',
    },
    icons,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'BeritaKarya',
    },
    metadataBase: new URL(baseUrl),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}
