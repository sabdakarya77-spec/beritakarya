import { Router } from 'express'
import { prisma } from '../../db/client'
import { requireAuth, requireRole } from '../../middleware/auth.middleware'
import { siteMiddleware, requireSiteAccess } from '../../middleware/site.middleware'
import { asyncHandler } from '../../utils/asyncHandler'
import { redis } from '../../lib/redis'

export const userRouter = Router() as any

userRouter.get('/',
  requireAuth,
  siteMiddleware,
  requireSiteAccess,
  asyncHandler(async (req: any, res: any) => {
    const { siteId } = req
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { siteId, deletedAt: null },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: { siteId, deletedAt: null } })
    ])

    // Fetch online status from Redis for each user
    const usersWithOnlineStatus = await Promise.all(users.map(async (u) => {
      const isOnline = await redis.get(`user:online:${u.id}`)
      return { ...u, isOnline: !!isOnline }
    }))

    res.json({ 
      success: true, 
      data: usersWithOnlineStatus,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  })
)

userRouter.get('/stats',
  requireAuth,
  siteMiddleware,
  requireSiteAccess,
  asyncHandler(async (req: any, res: any) => {
    const siteId = req.site
    const users = await prisma.user.findMany({
      where: { siteId, deletedAt: null },
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
        isOnline: false, // Placeholder, will be updated below
        publishedCount,
        totalViews,
        avgWords,
        createdAt: user.createdAt
      }
    })

    // Fetch real online status from Redis
    const statsWithOnlineStatus = await Promise.all(stats.map(async (s) => {
      const isOnline = await redis.get(`user:online:${s.id}`)
      return { ...s, isOnline: !!isOnline }
    }))

    res.json({ success: true, data: statsWithOnlineStatus })
  })
)

userRouter.get('/:id',
  requireAuth,
  siteMiddleware,
  requireSiteAccess,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
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
  siteMiddleware,
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
      where: { id, siteId, deletedAt: null }
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

/**
 * POST /api/v1/users/heartbeat
 * Update user's online status in Redis
 */
userRouter.post('/heartbeat',
  requireAuth,
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user.userId
    // Set online status in Redis with 60s expiration
    // This supports a 30s polling interval from the frontend
    await redis.set(`user:online:${userId}`, '1', 'EX', 60)
    
    res.json({ success: true })
  })
)