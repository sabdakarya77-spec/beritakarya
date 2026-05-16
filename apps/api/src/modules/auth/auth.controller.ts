import { Router, Request, Response } from 'express'
import { z } from 'zod'
import * as authService from './auth.service'
import { asyncHandler } from '../../utils/asyncHandler'
import { checkAccountLockout, recordFailedAttempt, resetFailedAttempts } from '../../lib/accountLockout'
import { requireAuth } from '../../middleware/auth.middleware'
import { prisma } from '../../db/client'

export const authRouter: Router = Router()

authRouter.get('/me', requireAuth, asyncHandler(async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, name: true, email: true, role: true, siteId: true, isVerified: true, kycStatus: true, kycNotes: true, kycSubmittedAt: true }
  })
  res.json({ success: true, data: { user } })
}))

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter')
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus mengandung huruf kapital')
    .regex(/[0-9]/, 'Harus mengandung angka')
    .regex(/[^A-Za-z0-9]/, 'Harus mengandung karakter spesial'),
  name: z.string().min(2),
  siteId: z.string().nullable().default(null)
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid')
})

const resetPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
  token: z.string(),
  newPassword: z.string()
})

authRouter.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body)
  
  // Check account lockout
  if (await checkAccountLockout(email)) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'ACCOUNT_LOCKED',
        message: 'Akun terkunci sementara. Coba lagi dalam 15 menit.'
      }
    })
  }
  
  try {
    const result = await authService.loginUser(email, password)
    await resetFailedAttempts(email)
    
    // Set httpOnly cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 15 * 60 * 1000 // 15 mins
    })
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })

    res.json({ success: true, data: { user: result.user } })
  } catch (error) {
    await recordFailedAttempt(email)
    throw error
  }
}))

authRouter.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body)
  const result = await authService.registerUser(
    input.email, input.password, input.name,
    'reader', input.siteId
  )
  
  // Set httpOnly cookies
  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 15 * 60 * 1000
  })
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000
  })

  res.status(201).json({ success: true, data: { user: result.user } })
}))

authRouter.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  let refreshToken = req.body.refreshToken || (req.cookies ? req.cookies.refreshToken : undefined)
  
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token is required' })
  }

  const result = await authService.refreshAccessToken(refreshToken)
  
  // Update cookies
  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 15 * 60 * 1000
  })
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000
  })

  res.json({ success: true, data: { user: result.user } })
}))

authRouter.post('/logout', requireAuth, asyncHandler(async (req: any, res: Response) => {
  const refreshToken = req.body.refreshToken || (req.cookies ? req.cookies.refreshToken : undefined)
  
  // Clear cookies
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')

  if (refreshToken) {
    await authService.logoutUser(req.user.userId, refreshToken)
  }
  res.json({ success: true, message: 'Logout berhasil' })
}))

authRouter.post('/forgot-password', asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body)
  const result = await authService.forgotPassword(email)
  res.json(result)
}))

authRouter.post('/reset-password', asyncHandler(async (req: Request, res: Response) => {
  const { email, token, newPassword } = resetPasswordSchema.parse(req.body)
  const result = await authService.resetPassword(email, token, newPassword)
  res.json(result)
}))