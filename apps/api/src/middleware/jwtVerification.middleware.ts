import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWTPayload } from '@beritakarya/types'
import { env } from '../lib/env'

/**
 * OPTIONAL Auth Middleware — diaplikasikan secara global.
 *
 * Perilaku:
 * - Token ADA dan VALID   → set req.user, lanjutkan ✅
 * - Token ADA tapi RUSAK  → return 401 (token palsu/dimanipulasi) 🚫
 * - Token ADA tapi EXPIRED → return 401 (minta refresh) 🚫
 * - Token TIDAK ADA       → lanjutkan tanpa req.user ✅ (route publik boleh lewat)
 *
 * Route yang memerlukan login wajib menggunakan middleware `requireAuth`
 * secara eksplisit di definisi route masing-masing.
 */
export function jwtVerify(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  // Tidak ada token — izinkan lewat (route publik tidak memerlukan auth)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.substring(7) // Hapus prefix 'Bearer '

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload
    req.user = decoded
    next()
  } catch (error) {
    // Token ada tapi expired — minta client untuk refresh
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token telah kadaluarsa, silakan refresh token Anda'
        }
      })
    }

    // Token ada tapi tidak valid / dimanipulasi — tolak
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token tidak valid'
      }
    })
  }
}