import { Router } from 'express'
import { prisma } from '../../db/client'
import { requireAuth, requireRole } from '../../middleware/auth.middleware'
import { siteMiddleware, requireSiteAccess } from '../../middleware/site.middleware'
import { asyncHandler } from '../../utils/asyncHandler'
import { redis } from '../../lib/redis'
import { emailService } from '../../services/email.service'
import { logger } from '../../lib/logger'

export const userRouter = Router() as any

userRouter.get('/',
  requireAuth,
  siteMiddleware,
  requireSiteAccess,
  asyncHandler(async (req: any, res: any) => {
    const siteId = req.site
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const skip = (page - 1) * limit

    const fetchAll = req.query.site === 'all' && req.user!.role === 'superadmin'
    const whereClause = fetchAll ? { deletedAt: null } : { siteId, deletedAt: null }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          siteId: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereClause })
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
      where: { 
        siteId, 
        deletedAt: null,
        role: { in: ['jurnalis', 'wapimred', 'superadmin'] }
      },
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
    const siteId = req.site
    const user = await prisma.user.findFirst({
      where: { id, siteId, deletedAt: null },
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
    const { role, siteId } = req.body

    const validRoles = ['reader', 'jurnalis', 'wapimred', 'superadmin']
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
    const currentRequestSiteId = req.site

    // Verify user exists
    const userQuery: any = { id, deletedAt: null }
    if (req.user!.role !== 'superadmin') {
      userQuery.siteId = currentRequestSiteId
    }

    const user = await prisma.user.findFirst({
      where: userQuery
    })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found or you do not have permission to manage this user' }
      })
    }

    // Get old fields for audit log
    const oldRole = user.role
    const oldSiteId = user.siteId

    // Compile update fields
    const updateData: any = { role }

    // Only superadmin can assign/change branches (siteId)
    if (req.user!.role === 'superadmin') {
      if (siteId === '' || siteId === null || siteId === undefined) {
        updateData.siteId = null
      } else {
        // Validate that siteId exists in database
        const siteExists = await prisma.site.findUnique({
          where: { id: siteId }
        })
        if (!siteExists) {
          return res.status(400).json({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Cabang yang dipilih tidak valid' }
          })
        }
        updateData.siteId = siteId
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        siteId: true
      }
    })

    // Audit log for role/site change
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        siteId: currentRequestSiteId || 'pusat',
        action: 'user.role_change',
        entityType: 'user',
        entityId: id,
        oldValue: { role: oldRole, siteId: oldSiteId },
        newValue: { role: role, siteId: updateData.siteId }
      }
    })

    // Send email notification to user about role/site change
    try {
      await emailService.sendRoleChangeNotification(
        updated.email,
        updated.name,
        oldRole,
        updated.role,
        req.user!.name || 'Superadmin'
      )
    } catch (emailErr) {
      logger.error('Gagal mengirim email notifikasi perubahan peran:', emailErr)
    }

    res.json({ success: true, data: updated })
  })
)

userRouter.delete('/:id',
  requireAuth,
  siteMiddleware,
  requireSiteAccess,
  requireRole(['superadmin']),
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params
    const siteId = req.site

    if (id === req.user!.userId) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Anda tidak dapat menghapus akun Anda sendiri' }
      })
    }

    const user = await prisma.user.findFirst({
      where: { id, siteId, deletedAt: null }
    })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User tidak ditemukan' }
      })
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        siteId: req.site!,
        action: 'user.delete',
        entityType: 'user',
        entityId: id,
        oldValue: { name: user.name, email: user.email, role: user.role },
        newValue: { deletedAt: new Date() }
      }
    })

    res.json({ success: true, message: 'User berhasil dihapus' })
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