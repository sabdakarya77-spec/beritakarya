import { Router, Request, Response } from 'express'
import { prisma } from '../../db/client'
import { requireAuth, requireRole } from '../../middleware/auth.middleware'
import { siteMiddleware, requireSiteAccess } from '../../middleware/site.middleware'
import { asyncHandler } from '../../utils/asyncHandler'

export const adRouter = Router()

// Public endpoint for tracking views/clicks
adRouter.post('/track/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { action } = req.query // 'impression' | 'click'
    
    try {
      if (action === 'click') {
        await prisma.advertisement.update({
          where: { id },
          data: { clicks: { increment: 1 } }
        })
      } else if (action === 'impression') {
        await prisma.advertisement.update({
          where: { id },
          data: { impressions: { increment: 1 } }
        })
      }
    } catch (e) {
      // Ignore if ad not found
    }
    
    res.json({ success: true })
  })
)

adRouter.get('/',
  requireAuth,
  siteMiddleware,
  requireRole(['superadmin', 'wapimred']),
  requireSiteAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
    const skip = (page - 1) * limit

    const [ads, total] = await Promise.all([
      prisma.advertisement.findMany({
        where: { siteId: req.site! },
        skip,
        take: limit,
        orderBy: { slot: 'asc' }
      }),
      prisma.advertisement.count({ where: { siteId: req.site! } })
    ])

    res.json({ 
      success: true, 
      data: ads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  })
)

adRouter.post('/',
  requireAuth,
  siteMiddleware,
  requireRole(['superadmin', 'wapimred']),
  requireSiteAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const { slot, code, imageUrl, linkUrl, isActive } = req.body
    const ad = await prisma.advertisement.create({
      data: {
        siteId: req.site!,
        slot,
        code: code || null,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        isActive: isActive ?? true
      },
      select: { id: true, slot: true, code: true, imageUrl: true, linkUrl: true, isActive: true, impressions: true, clicks: true, createdAt: true }
    })
    res.status(201).json({ success: true, data: ad })
  })
)

adRouter.patch('/:id',
  requireAuth,
  siteMiddleware,
  requireRole(['superadmin', 'wapimred']),
  requireSiteAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { slot, code, imageUrl, linkUrl, isActive } = req.body
    const ad = await prisma.advertisement.update({
      where: { id },
      data: {
        slot,
        code: code || null,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        isActive
      },
      select: { id: true, slot: true, code: true, imageUrl: true, linkUrl: true, isActive: true, impressions: true, clicks: true, createdAt: true }
    })
    res.json({ success: true, data: ad })
  })
)

adRouter.delete('/:id',
  requireAuth,
  siteMiddleware,
  requireRole(['superadmin', 'wapimred']),
  requireSiteAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    await prisma.advertisement.delete({
      where: { id }
    })
    res.json({ success: true, message: 'Advertisement deleted' })
  })
)