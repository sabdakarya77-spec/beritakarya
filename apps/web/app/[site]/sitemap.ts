import { MetadataRoute } from 'next'

const SITEMAP_MAX_PAGES = 50 // Safety cap

async function getArticles(site: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const all: any[] = []

  try {
    // Fetch all published articles by paginating with larger page size
    for (let page = 1; page <= SITEMAP_MAX_PAGES; page++) {
      const params = new URLSearchParams({
        site,
        limit: '1000', // Use maximum allowed
        page: String(page)
      })
      const res = await fetch(
        `${apiUrl}/api/v1/articles/public?${params.toString()}`,
        { cache: 'no-store' }
      )
      if (!res.ok) break

      const json = await res.json()
      const data = json.data
      const items = data?.articles || data?.items || []
      all.push(...items)

      const totalPages = data?.totalPages ?? 1
      if (page >= totalPages || items.length === 0) break
    }
  } catch {
    return []
  }

  return all
}

async function getCategories(site: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/api/v1/categories?site=${site}`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

export default async function sitemap({ params }: { params: { site: string } }): Promise<MetadataRoute.Sitemap> {
  const { site } = await params
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  const siteUrl = `${baseUrl}/${site}`

  const articles = await getArticles(site)
  const categories = await getCategories(site)

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1
    }
  ]

  categories.forEach((cat: { name: string }) => {
    entries.push({
      url: `${siteUrl}?cat=${encodeURIComponent(cat.name)}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8
    })
  })

  articles.forEach((article: { slug: string; publishedAt?: string; updatedAt?: string }) => {
    entries.push({
      url: `${siteUrl}/artikel/${article.slug}`,
      lastModified: new Date(article.publishedAt || article.updatedAt || new Date()),
      changeFrequency: 'monthly',
      priority: 0.6
    })
  })

  return entries
}