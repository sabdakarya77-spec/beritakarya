import { prisma } from '../../db/client'
import type { Prisma, ArticleStatus } from '@prisma/client'

export async function findArticlesBySite(
  siteId: string,
  opts: { status?: string; search?: string; category?: string; page?: number; limit?: number; authorId?: string } = {}
) {
  const { status, search, category, page = 1, limit = 20, authorId } = opts
  const categoryFilter: Prisma.ArticleWhereInput = {}

  if (category) {
    const catRecord = await prisma.category.findFirst({
      where: {
        AND: [
          {
            OR: [
              { name: { equals: category, mode: 'insensitive' } },
              { slug: { equals: category, mode: 'insensitive' } }
            ]
          },
          {
            OR: [
              { siteId },
              { isGlobal: true }
            ]
          }
        ]
      },
      include: {
        subCategories: {
          select: { id: true }
        }
      }
    })
    
    if (catRecord) {
      const ids = [catRecord.id, ...catRecord.subCategories.map((sub: { id: string }) => sub.id)]
      categoryFilter.categoryId = { in: ids }
    } else {
      // Return no results if category doesn't exist
      categoryFilter.categoryId = { in: [] }
    }
  }

  const where: Prisma.ArticleWhereInput = {
    siteId,
    ...(status && { status: status as ArticleStatus }),
    ...(authorId && { authorId }),
    ...categoryFilter,
    ...(search && { 
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { blocks: { path: ['$'], string_contains: search } }
      ]
    })
  }

  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: {
        id: true, title: true, slug: true, status: true,
        siteId: true, authorId: true, publishedAt: true, createdAt: true,
        isBreaking: true, isExclusive: true, isFeatured: true,
        featuredImage: true, featuredImageBlur: true, featuredImageColor: true,
        viewCount: true, wordCount: true, readingTimeMin: true,
        category: { select: { name: true } },
        author: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.article.count({ where })
  ])
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function findArticleById(id: string, siteId: string) {
  return prisma.article.findFirst({
    where: { id, siteId },
    include: { 
      author: { select: { id: true, name: true, email: true, role: true } },
      category: { select: { name: true } },
      blocks: true
    }
  })
}

export async function findArticleBySlug(slug: string, siteId: string) {
  return prisma.article.findUnique({
    where: { siteId_slug: { siteId, slug } },
    include: { 
      author: { select: { id: true, name: true, role: true } },
      category: { select: { name: true } },
      blocks: true
    }
  })
}

export async function findPublishedArticleBySlug(slug: string, siteId: string) {
  return prisma.article.findFirst({
    where: { siteId, slug, status: 'published' },
    include: { 
      author: { select: { id: true, name: true, role: true } },
      category: { select: { name: true } },
      blocks: true
    }
  })
}

export async function createArticle(data: {
  title: string; slug: string; siteId: string
  authorId: string; categoryId?: string | null; tags?: any; blocks?: any[]
}) {
  return prisma.article.create({
    data: { ...data, blocks: data.blocks ?? [] },
    include: {
      category: { select: { name: true } },
      author: { select: { id: true, name: true, role: true } }
    }
  })
}

export async function updateArticle(
  id: string, siteId: string,
  data: Partial<{ 
    title: string; blocks: any[]; metaTitle: string; metaDescription: string; 
    status: string; categoryId: string | null; tags: any;
    isBreaking: boolean; isExclusive: boolean; isFeatured: boolean;
    wordCount: number; readingTimeMin: number; publishedAt: Date;
    reviewNotes: string; reviewedBy: string; reviewedAt: Date;
    featuredImage: string; featuredImageBlur?: string | null; featuredImageColor?: string | null;
  }>
) {
  return prisma.article.update({
    where: { id },
    data: data as any,
    include: {
      category: { select: { name: true } },
      author: { select: { id: true, name: true, role: true } }
    }
  })
}

export async function deleteArticle(id: string) {
  return prisma.article.delete({ where: { id } })
}

export async function slugExists(slug: string, siteId: string, excludeId?: string) {
  const article = await prisma.article.findFirst({
    where: { slug, siteId, ...(excludeId && { id: { not: excludeId } }) }
  })
  return !!article
}

export async function createAuditLog(data: {
  userId: string; siteId: string; action: string;
  entityType: string; entityId: string;
  oldValue?: any; newValue?: any;
}) {
  return (prisma as any).auditLog.create({ data })
}

export async function createVersion(data: {
  articleId: string; title: string; blocks: any[]; version: number; authorId: string
}) {
  return prisma.articleVersion.create({ data })
}

export async function incrementViewCount(id: string) {
  return prisma.article.update({
    where: { id },
    data: { viewCount: { increment: 1 } }
  })
}

export async function findVersions(articleId: string) {
  return prisma.articleVersion.findMany({
    where: { articleId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, version: true, createdAt: true, authorId: true
    }
  })
}

export async function findVersionById(id: string) {
  return prisma.articleVersion.findUnique({ where: { id } })
}

export async function getNextVersionNumber(articleId: string) {
  const last = await prisma.articleVersion.findFirst({
    where: { articleId },
    orderBy: { version: 'desc' }
  })
  return (last?.version || 0) + 1
}