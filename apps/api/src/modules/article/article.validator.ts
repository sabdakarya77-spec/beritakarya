import { z } from 'zod'

const baseBlock = z.object({ id: z.string() })

export const blockSchema = z.discriminatedUnion('type', [
  baseBlock.extend({ type: z.literal('paragraph'), content: z.string() }),
  baseBlock.extend({
    type: z.literal('heading'),
    level: z.union([z.literal(1),z.literal(2),z.literal(3),z.literal(4),z.literal(5),z.literal(6)]),
    content: z.string()
  }),
  baseBlock.extend({ type: z.literal('quote'), content: z.string(), attribution: z.string().optional() }),
  baseBlock.extend({
    type: z.literal('image'),
    url: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional()
  }),
  baseBlock.extend({
    type: z.literal('imageGrid'),
    columns: z.union([z.literal(2), z.literal(3)]),
    images: z.array(z.object({ url: z.string(), alt: z.string(), caption: z.string().optional() }))
  }),
  baseBlock.extend({
    type: z.literal('gallery'),
    images: z.array(z.object({ url: z.string(), alt: z.string(), caption: z.string().optional() }))
  }),
  baseBlock.extend({
    type: z.literal('embed'),
    url: z.string(),
    embedType: z.enum(['youtube','twitter','instagram','other']),
    title: z.string().optional()
  }),
  // [FIX] Previously missing block types that caused silent save failures
  baseBlock.extend({
    type: z.literal('list'),
    items: z.array(z.string()),
    ordered: z.boolean().optional()
  }),
  baseBlock.extend({
    type: z.literal('callout'),
    content: z.string(),
    variant: z.string().optional(),
    icon: z.string().optional()
  }),
  baseBlock.extend({
    type: z.literal('mediaText'),
    url: z.string(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    content: z.string(),
    align: z.enum(['left', 'right']).optional()
  }),
])

const blocksField = z
  .array(blockSchema)
  .max(200, 'Maksimal 200 blok konten per artikel')
  .default([])

export const createArticleSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter').max(200),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  blocks: blocksField,
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  isBreaking: z.boolean().optional(),
  isExclusive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  featuredImage: z.string().optional(),
})

export const updateArticleSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  blocks: blocksField.optional(),
  scheduledAt: z.coerce.date().optional().nullable(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  // [FIX] Extended status enum to cover all workflow states
  status: z.enum(['draft','submitted','review','revision','approved','scheduled','published','archived']).optional(),
  publishedAt: z.coerce.date().optional(),
  // [FIX] Added missing editorial fields that were silently stripped before
  isBreaking: z.boolean().optional(),
  isExclusive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  featuredImage: z.string().optional(),
  reviewNotes: z.string().optional(),
  reviewedBy: z.string().optional(),
  slug: z.string().optional(),
})

export const articleQuerySchema = z.object({
  status: z.enum(['draft','submitted','review','revision','approved','scheduled','published','archived']).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20)
})

/** Public list / sitemap — allows larger page size. */
export const publicArticleQuerySchema = articleQuerySchema.extend({
  limit: z.coerce.number().positive().max(100).default(100)
})

export const publishArticleSchema = z.object({
  forcePublish: z.coerce.boolean().optional().default(false)
})
