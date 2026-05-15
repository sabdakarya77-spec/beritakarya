import { Router } from 'express'
import { prisma } from '../../db/client'
import { requireAuth, requireRole } from '../../middleware/auth.middleware'
import { requireSiteAccess } from '../../middleware/site-scope.middleware'
import { asyncHandler } from '../../utils/asyncHandler'
import { emailService } from '../../services/email.service'

export const userRouter = Router() as any

userRouter.get('/',
  requireAuth,
  requireSiteAccess,
  asyncHandler(async (req: any, res: any) => {
    const { siteId } = req
    const users = await prisma.user.findMany({
      where: { siteId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, data: users })
  })
)

userRouter.get('/stats',
  requireAuth,
  requireSiteAccess,
  asyncHandler(async (req: any, res: any) => {
    const siteId = req.site
    const users = await prisma.user.findMany({
      where: { siteId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        articles: {
          where: { status: 'published' },
          select: { viewCount: true, wordCount: true }
        }
      }
    })

    const stats = users.map(user => {
      const publishedCount = user.articles.length
      const totalViews = user.articles.reduce((acc, art) => acc + art.viewCount, 0)
      const validWordCounts = user.articles.filter(a => a.wordCount).map(a => a.wordCount as number)
      const avgWords = validWordCounts.length > 0 
        ? Math.round(validWordCounts.reduce((a, b) => a + b, 0) / validWordCounts.length) 
        : 0

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOnline: Math.random() > 0.5,
        publishedCount,
        totalViews,
        avgWords,
        createdAt: user.createdAt
      }
    })

    res.json({ success: true, data: stats })
  })
)

userRouter.get('/:id',
  requireAuth,
  requireSiteAccess,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params
    const user = await prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        siteId: true,
        isVerified: true,
        createdAt: true
      }
    })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      })
    }
    res.json({ success: true, data: user })
  })
)

userRouter.put('/:id/role',
  requireAuth,
  requireSiteAccess,
  requireRole(['superadmin', 'wapimred']),
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params
    const { role } = req.body

    const validRoles = ['reader', 'journalist', 'wapimred', 'superadmin']
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid role provided' }
      })
    }

    if (req.user!.role !== 'superadmin' && role === 'superadmin') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only superadmin can grant superadmin role' }
      })
    }
    const siteId = req.site

    // Verify user belongs to same site
    const user = await prisma.user.findFirst({
      where: { id, siteId }
    })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found or does not belong to this site' }
      })
    }

    // Get old role for audit log
    const oldRole = user.role

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        siteId: true
      }
    })

    // Audit log for role change
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        siteId: req.site!,
        action: 'user.role_change',
        entityType: 'user',
        entityId: id,
        oldValue: { role: oldRole },
        newValue: { role: role }
      }
    })

    // TODO: Send email notification to user about role change (when email service is ready)

    res.json({ success: true, data: updated })
  })
)