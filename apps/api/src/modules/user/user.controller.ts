import { Router } from 'express'
import { prisma } from '../../db/client'
import { requireAuth, requireRole } from '../../middleware/auth.middleware'
import { requireSiteAccess } from '../../middleware/site-scope.middleware'
import { asyncHandler } from '../../utils/asyncHandler'

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