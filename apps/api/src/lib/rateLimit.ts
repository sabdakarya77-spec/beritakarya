import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { redis } from './redis'

// @ts-expect-error - ioredis type signature mismatch with spread operator
const store = process.env.REDIS_HOST ? new RedisStore({ sendCommand: (...args: string[]) => redis.call(...args) }) : undefined

export const authLimiter = rateLimit({
  store,
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Terlalu banyak percobaan login. Coba lagi dalam 1 menit.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
})

export const apiLimiter = rateLimit({
  store,
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Terlalu banyak request. Coba lagi sebentar.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
})

export const aiLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMITED',
      message: 'Batas penggunaan AI tercapai. Coba lagi dalam 1 jam.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
})