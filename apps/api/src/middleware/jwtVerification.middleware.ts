import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWTPayload } from '@beritakarya/types'
import { env } from '../lib/env'

/**
 * Middleware to verify JWT token from Authorization header
 * Sets req.user with the decoded token payload
 */
export function jwtVerify(req: Request, res: Response, next: NextFunction) {
  // Skip auth routes to allow login/register/refresh
  const isAuthRoute = req.path.startsWith('/api/v1/auth') || req.path.includes('/auth')
  if (isAuthRoute) {
    return next()
  }

  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'No authentication token provided'
      }
    })
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload
    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token expired'
        }
      })
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token'
      }
    })
  }
}