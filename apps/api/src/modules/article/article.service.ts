import * as repo from './article.repository'
import {
  resolveUniqueSlug,
  createArticleWithSlugRetry,
  updateArticleWithSlugRetry
} from './article.slug'
import type { JWTPayload } from '@beritakarya/types'
import { sendNotification } from '../notification/notification.controller'
import { prisma } from '../../db/client'
import { recordView } from '../analytics/analytics.service'
import * as searchService from './search.service'
import { getCache, setCache, deleteCache } from '../../lib/redis'
import { googleIndexingService } from '../../services/google-indexing.service'

export async function getArticles(
  siteId: string,
  query: { status?: string; search?: string; category?: string; page?: number; limit?: number },
  user?: JWTPayload
) {
  // If search is provided, use Meilisearch
  if (query.search) {
    const searchResult = await searchService.searchArticles(query.search, {
      siteId,
      status: query.status
    })
    
    if (searchResult) {
      // In a real app, we'd fetch full objects from DB using IDs from search results
      // or ensure Meilisearch has all needed fields. 
      // For now, we'll return the search hits directly as articles.
      return {
        items: searchResult.hits,
        total: searchResult.estimatedTotalHits,
        page: 1,
        limit: query.limit || 20
      }
    }
  }

  const opts: any = { ...query }
  
  // If user is a reporter or kontributor, they can only see their own articles
  if (user?.role === 'reporter' || user?.role === 'kontributor') {
    opts.authorId = user.userId
  }

  return repo.findArticlesBySite(siteId, opts)
}

export async function getArticleById(id: string, siteId: string, user?: JWTPayload) {
  const article = await repo.findArticleById(id, siteId)
  if (!article) throw Object.assign(new Error('Post tidak ditemukan'), { statusCode: 404 })
  
  // Authorization: Reporters and kontributors can only view their own articles (unless published, but dashboard usually shows drafts)
  if (user && !['superadmin', 'wapimred'].includes(user.role) && article.authorId !== user.userId) {
    throw Object.assign(new Error('Anda tidak punya akses ke post ini'), { statusCode: 403 })
  }

  return article
}

export async function getArticleBySlug(slug: string, siteId: string) {
  const article = await repo.findArticleBySlug(slug, siteId)
  if (!article) throw Object.assign(new Error('Post tidak ditemukan'), { statusCode: 404 })
  return article
}

export async function getPublishedArticleBySlug(
  slug: string, 
  siteId: string, 
  meta?: { ipAddress?: string; userAgent?: string; referrer?: string }
) {
  const cacheKey = `article:${siteId}:${slug}`
  const cached = await getCache<any>(cacheKey)
  
  let article = cached
  if (!article) {
    article = await repo.findPublishedArticleBySlug(slug, siteId)
    if (!article) throw Object.assign(new Error('Post tidak ditemukan'), { statusCode: 404 })
    await setCache(cacheKey, article, 3600) // Cache for 1 hour
  }
  
  // Async recording (don't block the response)
  recordView({
    siteId,
    articleId: article.id,
    path: `/artikel/${slug}`,
    ...meta
  }).catch(err => console.error('Failed to record view:', err))
  
  return article
}

export async function createArticle(
  input: { 
    title: string; 
    blocks?: any[]; 
    categoryId?: string | null; 
    tags?: string[];
    metaTitle?: string;
    metaDescription?: string;
    isBreaking?: boolean;
    isExclusive?: boolean;
    isFeatured?: boolean;
    featuredImage?: string;
  },
  user: JWTPayload, siteId: string
) {
  // Fetch fresh user data to check KYC status and current role
  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { role: true, kycStatus: true }
  })

  if (!dbUser) {
    throw Object.assign(new Error('User tidak ditemukan'), { statusCode: 404 })
  }

  // Role validation: Readers cannot create articles
  if (dbUser.role === 'reader') {
    throw Object.assign(new Error('Akses ditolak: Pembaca tidak dapat membuat artikel'), { statusCode: 403 })
  }

  // KYC validation: Reporters and kontributors must be APPROVED to create articles
  if ((dbUser.role === 'reporter' || dbUser.role === 'kontributor') && dbUser.kycStatus !== 'APPROVED') {
    throw Object.assign(new Error('Akses ditolak: Verifikasi identitas (KYC) Anda belum disetujui'), { statusCode: 403 })
  }

  const slug = await resolveUniqueSlug(input.title, siteId)
  const article = await createArticleWithSlugRetry({
    title: input.title,
    slug,
    siteId,
    authorId: user.userId,
    categoryId: input.categoryId,
    tags: input.tags ?? [],
    blocks: input.blocks ?? [],
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    isBreaking: input.isBreaking ?? false,
    isExclusive: input.isExclusive ?? false,
    isFeatured: input.isFeatured ?? false,
    featuredImage: input.featuredImage ?? ''
  })

  await repo.createAuditLog({
    userId: user.userId,
    siteId,
    action: 'post.create',
    entityType: 'post',
    entityId: article.id,
    newValue: article
  })

  // Indexing
  searchService.indexArticle(article).catch(err => console.error('Failed to index article:', err))

  return article
}

export async function updateArticle(
  id: string, siteId: string,
  input: Partial<{ 
    title: string; blocks: any[]; metaTitle: string; metaDescription: string; 
    categoryId: string | null; tags: string[]; status: string;
    isBreaking: boolean; isExclusive: boolean; isFeatured: boolean;
    featuredImage: string; reviewNotes: string; reviewedBy: string;
  }>,
  user: JWTPayload
) {
  // Fetch fresh user data to check KYC status and current role
  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { role: true, kycStatus: true }
  })

  if (!dbUser) {
    throw Object.assign(new Error('User tidak ditemukan'), { statusCode: 404 })
  }

  // Role validation: Readers cannot update articles
  if (dbUser.role === 'reader') {
    throw Object.assign(new Error('Akses ditolak: Pembaca tidak dapat mengubah artikel'), { statusCode: 403 })
  }

  // KYC validation: Reporters and kontributors must be APPROVED to update articles
  if ((dbUser.role === 'reporter' || dbUser.role === 'kontributor') && dbUser.kycStatus !== 'APPROVED') {
    throw Object.assign(new Error('Akses ditolak: Verifikasi identitas (KYC) Anda belum disetujui'), { statusCode: 403 })
  }

  const article = await repo.findArticleById(id, siteId)
  if (!article) throw Object.assign(new Error('Post tidak ditemukan'), { statusCode: 404 })
  
  // Authorization
  if (!['superadmin', 'wapimred'].includes(user.role) && article.authorId !== user.userId) {
    throw Object.assign(new Error('Anda tidak punya akses ke post ini'), { statusCode: 403 })
  }

  // [H-006] State Machine Workflow Validation
  const WORKFLOW_TRANSITIONS: Record<string, string[]> = {
    draft: ['submitted', 'deleted'],
    submitted: ['draft', 'approved', 'published', 'rejected', 'review', 'revision'],
    review: ['revision', 'approved', 'rejected'],
    revision: ['submitted', 'draft'],
    approved: ['published', 'scheduled', 'draft'],
    scheduled: ['published', 'draft'],
    published: ['archived', 'draft'],
    archived: ['published', 'draft'],
    rejected: ['draft', 'submitted']
  }

  if (input.status && input.status !== article.status) {
    const allowed = WORKFLOW_TRANSITIONS[article.status] || []
    if (!allowed.includes(input.status)) {
      throw Object.assign(
        new Error(`Transisi status tidak valid: ${article.status} -> ${input.status}`), 
        { statusCode: 400 }
      )
    }
  }

  // Prevent reporters and kontributors from setting certain statuses directly
  if ((user.role === 'reporter' || user.role === 'kontributor') && input.status && !['draft', 'submitted'].includes(input.status)) {
     if (article.status !== 'revision' && input.status !== 'submitted') {
        throw Object.assign(new Error('Hanya Wapimred yang dapat mengubah status ke ' + input.status), { statusCode: 403 })
     }
  }

  let data: any = { ...input }
  
  // [S-Tier] Propagate blur hash and dominant color if featuredImage is updated
  if ('featuredImage' in input) {
    if (input.featuredImage) {
      const media = await prisma.media.findFirst({
        where: { url: input.featuredImage },
        select: { blurHash: true, dominantColor: true }
      })
      if (media) {
        data.featuredImageBlur = media.blurHash || null
        data.featuredImageColor = media.dominantColor || null
      } else {
        data.featuredImageBlur = null
        data.featuredImageColor = null
      }
    } else {
      data.featuredImageBlur = null
      data.featuredImageColor = null
    }
  }

  // Handle Slug Change
  if (input.title && input.title !== article.title) {
    data.slug = await resolveUniqueSlug(input.title, siteId, id)
  }

  // Auto-calculate word count and reading time if blocks changed
  if (input.blocks) {
    const textContent = input.blocks
      .filter((b: any) => b.type === 'paragraph' || b.type === 'heading')
      .map((b: any) => b.content)
      .join(' ')
    const words = textContent.trim().split(/\s+/).length
    data.wordCount = words
    data.readingTimeMin = Math.max(1, Math.ceil(words / 200))
  }

  const updated = data.slug
    ? await updateArticleWithSlugRetry(id, siteId, data)
    : await repo.updateArticle(id, siteId, data)

  // Auto-save version on submission
  if (input.status === 'submitted') {
     await saveArticleVersion(id, user.userId, siteId)
  }

  // Notifications
  if (input.status === 'submitted') {
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true }
    })
    const userName = userData?.name || 'User'

    const editors = await prisma.user.findMany({
      where: { siteId, role: { in: ['superadmin', 'wapimred'] } },
      select: { id: true }
    })
    for (const editor of editors) {
      await sendNotification({
        userId: editor.id,
        siteId,
        type: 'post_submitted',
        title: 'Post Baru Masuk Antrian',
        message: `${userName} baru saja mengirim post "${updated.title}" untuk di-review.`,
        link: `/${siteId}/dashboard/review`
      })
    }
  } else if (input.status === 'revision') {
    await sendNotification({
      userId: updated.authorId,
      siteId,
      type: 'post_reviewed',
      title: 'Revisi Diperlukan',
      message: `Editor meminta revisi untuk post "${updated.title}". Catatan: ${input.reviewNotes || 'Cek dashboard.'}`,
      link: `/${siteId}/dashboard/articles/${id}`
    })
  } else if (input.status === 'archived') {
    await sendNotification({
      userId: updated.authorId,
      siteId,
      type: 'post_reviewed',
      title: 'Post Ditolak',
      message: `Maaf, post "${updated.title}" Anda telah ditolak/diarsipkan oleh editor.`,
      link: `/${siteId}/dashboard/articles/${id}`
    })
  }

  await repo.createAuditLog({
    userId: user.userId,
    siteId,
    action: 'post.update',
    entityType: 'post',
    entityId: id,
    oldValue: article,
    newValue: updated
  })

  // Re-indexing
  searchService.indexArticle(updated).catch(err => console.error('Failed to index article:', err))

  // Invalidate cache
  deleteCache(`article:${siteId}:${updated.slug}`).catch(() => {})

  return updated
}

export async function publishArticle(id: string, siteId: string, user: JWTPayload) {
  const article = await repo.findArticleById(id, siteId)
  if (!article) throw Object.assign(new Error('Post tidak ditemukan'), { statusCode: 404 })
  
  if (!['superadmin', 'wapimred'].includes(user.role)) {
    throw Object.assign(new Error('Akses ditolak: Hanya Wapimred dan Superadmin yang dapat mem-publish post'), { statusCode: 403 })
  }

  const updated = await repo.updateArticle(id, siteId, {
    status: 'published',
    publishedAt: new Date()
  } as any)

  // Auto-save version on publish
  await saveArticleVersion(id, user.userId, siteId)

  // Notify author
  await sendNotification({
    userId: updated.authorId,
    siteId,
    type: 'post_reviewed',
    title: 'Post Berhasil Terbit!',
    message: `Selamat! Post "${updated.title}" Anda telah disetujui and terbit sekarang.`,
    link: `/${siteId}/artikel/${updated.slug}`
  })

  await repo.createAuditLog({
    userId: user.userId,
    siteId,
    action: 'post.publish',
    entityType: 'post',
    entityId: id,
    oldValue: article,
    newValue: updated
  })

  // [SEO Indexing API Automation] Auto-submit URL to Google Indexing API on publish
  prisma.site.findUnique({ where: { id: siteId } }).then(site => {
    if (site) {
      const domain = site.domain || 'beritakarya.co'
      const protocol = domain.includes('localhost') || domain.includes('127.0.0.1') ? 'http' : 'https'
      const articleUrl = `${protocol}://${domain}/artikel/${updated.slug}`
      googleIndexingService.submitUrl(siteId, articleUrl, 'URL_UPDATED')
        .then(res => console.log('Auto Google Indexing API trigger result:', res))
        .catch(err => console.error('Auto Google Indexing API trigger error:', err))
    }
  }).catch(err => console.error('Failed to fetch site details for indexing:', err))

  searchService.indexArticle(updated).catch(err =>
    console.error('Failed to index article on publish:', err)
  )
  deleteCache(`article:${siteId}:${updated.slug}`).catch(err =>
    console.error('Failed to invalidate article cache on publish:', err)
  )

  return updated
}

export async function deleteArticle(id: string, siteId: string, user: JWTPayload) {
  const article = await repo.findArticleById(id, siteId)
  if (!article) throw Object.assign(new Error('Post tidak ditemukan'), { statusCode: 404 })
  
  if (!['superadmin', 'wapimred'].includes(user.role) && article.authorId !== user.userId) {
    throw Object.assign(new Error('Akses ditolak'), { statusCode: 403 })
  }

  await repo.createAuditLog({
    userId: user.userId,
    siteId,
    action: 'post.delete',
    entityType: 'post',
    entityId: id,
    oldValue: article
  })

  // Remove from search index and public cache
  searchService.deleteIndexedArticle(id).catch(err =>
    console.error('Failed to delete indexed article:', err)
  )
  deleteCache(`article:${siteId}:${article.slug}`).catch(err =>
    console.error('Failed to invalidate article cache on delete:', err)
  )

  return repo.softDeleteArticle(id)
}

export async function getArticleVersions(articleId: string) {
  return repo.findVersions(articleId)
}

export async function saveArticleVersion(articleId: string, authorId: string, siteId: string) {
  const article = await repo.findArticleById(articleId, siteId)
  if (!article) throw new Error('Post tidak ditemukan')

  const versionNumber = await repo.getNextVersionNumber(articleId)
  return repo.createVersion({
    articleId,
    title: article.title,
    blocks: article.blocks as any[],
    version: versionNumber,
    authorId
  })
}

export async function restoreArticleVersion(versionId: string, siteId: string, user: JWTPayload) {
  const version = await repo.findVersionById(versionId)
  if (!version) throw new Error('Versi tidak ditemukan')

  const article = await repo.findArticleById(version.articleId, siteId)
  if (!article) throw new Error('Post tidak ditemukan')

  // Authorization check
  if (!['superadmin', 'wapimred'].includes(user.role) && article.authorId !== user.userId) {
    throw new Error('Akses ditolak')
  }

  const updated = await repo.updateArticle(article.id, siteId, {
    title: version.title,
    blocks: version.blocks as any[]
  })

  await repo.createAuditLog({
    userId: user.userId,
    siteId,
    action: 'post.restore_version',
    entityType: 'post',
    entityId: article.id,
    oldValue: article,
    newValue: updated
  })

  return updated
}

export async function getArticleStats(siteId: string) {
  const counts = await prisma.article.groupBy({
    by: ['status'],
    where: { siteId, deletedAt: null },
    _count: { id: true }
  })
  
  const stats = counts.reduce((acc, curr) => {
    acc[curr.status] = curr._count.id
    return acc
  }, {} as Record<string, number>)

  // Ensure all relevant statuses exist even if 0
  const statuses = ['draft', 'submitted', 'review', 'revision', 'approved', 'published', 'archived']
  statuses.forEach(s => {
    if (stats[s] === undefined) stats[s] = 0
  })

  return stats
}

export async function indexGoogleArticle(id: string, siteId: string) {
  const article = await repo.findArticleById(id, siteId)
  if (!article) throw Object.assign(new Error('Post tidak ditemukan'), { statusCode: 404 })
  if (article.status !== 'published') {
    throw Object.assign(new Error('Hanya artikel yang sudah terbit (Published) yang dapat di-indeks ke Google'), { statusCode: 400 })
  }

  const site = await prisma.site.findUnique({
    where: { id: siteId }
  })

  const domain = site?.domain || 'beritakarya.co'
  const protocol = domain.includes('localhost') || domain.includes('127.0.0.1') ? 'http' : 'https'
  const articleUrl = `${protocol}://${domain}/artikel/${article.slug}`

  const result = await googleIndexingService.submitUrl(siteId, articleUrl, 'URL_UPDATED')
  return result
}