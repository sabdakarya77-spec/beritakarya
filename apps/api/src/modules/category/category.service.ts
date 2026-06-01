import { prisma } from '../../db/client'
import { getSiteAssignmentFilter } from '../site/site-category.utils'

const categoryInclude = {
  site: true,
  parent: true
} as const

export class CategoryService {
  // Helper: Convert flat list to recursive tree structure
  buildCategoryTree(categories: any[]): any[] {
    const map = new Map<string, any>()
    const roots: any[] = []

    // Initialize map with nodes having empty children array
    for (const cat of categories) {
      map.set(cat.id, { ...cat, subCategories: [] })
    }

    // Build tree by assigning children to parents
    for (const cat of categories) {
      const node = map.get(cat.id)
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId).subCategories.push(node)
      } else {
        roots.push(node)
      }
    }

    // Sort recursively by order
    const sortRecursive = (nodes: any[]) => {
      nodes.sort((a, b) => (a.order || 0) - (b.order || 0))
      nodes.forEach(node => sortRecursive(node.subCategories))
    }
    sortRecursive(roots)

    return roots
  }

  // Helper: Deduplicate categories by slug, preferring site-specific over global
  deduplicateCategories(categories: any[], siteId: string): any[] {
    const slugMap = new Map<string, any>()
    for (const cat of categories) {
      const existing = slugMap.get(cat.slug)
      if (!existing || (cat.siteId === siteId && existing.siteId !== siteId)) {
        slugMap.set(cat.slug, cat)
      }
    }

    const deduplicated = Array.from(slugMap.values())

    const idMapping = new Map<string, string>()
    for (const cat of categories) {
      const active = slugMap.get(cat.slug)
      if (active && active.id !== cat.id) {
        idMapping.set(cat.id, active.id)
      }
    }

    return deduplicated.map(cat => {
      if (cat.parentId && idMapping.has(cat.parentId)) {
        return {
          ...cat,
          parentId: idMapping.get(cat.parentId)
        }
      }
      return cat
    })
  }

  private async findCategoriesForSite(siteId: string) {
    const assignment = await getSiteAssignmentFilter(siteId)

    const where =
      assignment.isConfigured
        ? {
            OR: [
              { siteId },
              {
                isGlobal: true,
                id: { in: assignment.expandedGlobalIds }
              }
            ]
          }
        : {
            OR: [{ siteId }, { isGlobal: true }]
          }

    return prisma.category.findMany({
      where,
      include: categoryInclude,
      orderBy: { order: 'asc' }
    })
  }

  async getSiteCategories(siteId: string) {
    const all = await this.findCategoriesForSite(siteId)
    return this.deduplicateCategories(all, siteId)
  }

  async getAllCategories() {
    return await prisma.category.findMany({
      include: {
        site: true,
        parent: true
      },
      orderBy: [
        { siteId: 'asc' },
        { order: 'asc' }
      ]
    })
  }

  async getGlobalCategories() {
    return await prisma.category.findMany({
      where: { isGlobal: true },
      include: { 
      site: true,
      parent: true
      },
      orderBy: {
        order: 'asc'
      }
    })
  }

  async getCategoryTree(siteId: string) {
    const all = await this.findCategoriesForSite(siteId)
    const deduplicated = this.deduplicateCategories(all, siteId)
    return this.buildCategoryTree(deduplicated)
  }

  async createCategory(data: {
    name: string
    slug: string
    siteId?: string | null
    description?: string
    parentId?: string | null
    order?: number
    color?: string | null
  }, _actorUserId: string) {
    const isGlobal = data.siteId === null
    const effectiveSiteId = data.siteId === '' ? null : data.siteId

    const where = effectiveSiteId
      ? { slug: data.slug, siteId: effectiveSiteId }
      : { slug: data.slug, isGlobal: true }

    const existing = await prisma.category.findFirst({ where })
    if (existing) {
      throw Object.assign(
        new Error(`Category with slug "${data.slug}" already exists in this scope`),
        { statusCode: 409 }
      )
    }

    if (data.parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: data.parentId }
      })
      if (!parentExists) {
        throw Object.assign(new Error('Parent category not found'), { statusCode: 404 })
      }
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        siteId: effectiveSiteId,
        isGlobal,
        description: data.description,
        parentId: data.parentId || null,
        order: data.order !== undefined ? data.order : 0,
        color: data.color || null
      },
      include: { site: true, parent: true }
    })

    return category
  }

  async updateCategory(
    categoryId: string,
    data: Partial<{
      name: string
      description: string
      siteId?: string | null
      parentId?: string | null
      order?: number
      color?: string | null
    }>,
    _actorUserId: string
  ) {
    const existing = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existing) {
      throw Object.assign(new Error('Category not found'), { statusCode: 404 })
    }

    if (existing.isGlobal && data.siteId !== undefined && data.siteId !== null) {
      throw Object.assign(
        new Error('Cannot change global category to site-specific'),
        { statusCode: 400 }
      )
    }

    if (data.siteId !== undefined && data.siteId !== existing.siteId) {
      const newSiteId = data.siteId === null ? null : data.siteId
      const whereCondition = newSiteId
        ? { slug: existing.slug, siteId: newSiteId, id: { not: categoryId } }
        : { slug: existing.slug, isGlobal: true, id: { not: categoryId } }

      const conflict = await prisma.category.findFirst({
        where: whereCondition
      })

      if (conflict) {
        throw Object.assign(
          new Error(`Category slug "${existing.slug}" already exists in the target site`),
          { statusCode: 409 }
        )
      }
    }

    if (data.parentId !== undefined) {
      if (data.parentId === categoryId) {
        throw Object.assign(new Error('Category cannot be its own parent'), { statusCode: 400 })
      }
      if (data.parentId !== null) {
        const parentExists = await prisma.category.findUnique({
          where: { id: data.parentId }
        })
        if (!parentExists) {
          throw Object.assign(new Error('Parent category not found'), { statusCode: 404 })
        }
      }
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        description: data.description,
        siteId: data.siteId !== undefined
          ? (data.siteId === '' ? null : data.siteId)
          : undefined,
        parentId: data.parentId !== undefined ? data.parentId : undefined,
        order: data.order !== undefined ? data.order : undefined,
        color: data.color !== undefined ? data.color : undefined
      },
      include: { site: true, parent: true }
    })

    return category
  }

  async deleteCategory(categoryId: string, _actorUserId: string) {
    const existing = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existing) {
      throw Object.assign(new Error('Category not found'), { statusCode: 404 })
    }

    if (existing.isGlobal) {
      throw Object.assign(
        new Error('Cannot delete global category'),
        { statusCode: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: categoryId }
    })

    return { success: true, message: 'Category deleted' }
  }
}

export const categoryService = new CategoryService()