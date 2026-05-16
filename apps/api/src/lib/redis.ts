import Redis from 'ioredis'
import { env } from './env'

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  password: env.REDIS_PASSWORD,
  retryStrategy: (times: number) => {
    // Stop retrying if not configured or after 3 attempts to avoid log spam
    if (!process.env.REDIS_HOST || times > 3) return null
    return Math.min(times * 50, 2000)
  }
})

redis.on('error', (err: Error) => {
  if (process.env.REDIS_HOST) {
    console.error('Redis Error:', err)
  }
})

export async function getCache<T>(key: string): Promise<T | null> {
  if (!process.env.REDIS_HOST) return null
  try {
    const data = await redis.get(key)
    if (!data) return null
    return JSON.parse(data)
  } catch {
    return null
  }
}

export async function setCache(key: string, value: any, ttlSeconds: number = 3600) {
  if (!process.env.REDIS_HOST) return
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {}
}

export async function deleteCache(key: string) {
  if (!process.env.REDIS_HOST) return
  try {
    await redis.del(key)
  } catch {}
}

export async function clearPattern(pattern: string): Promise<void> {
  if (!process.env.REDIS_HOST) return
  try {
    const keys = await redis.keys(pattern)
    if (keys.length === 0) return

    // [H-008] Batch deletion to avoid blocking Redis
    const BATCH_SIZE = 1000
    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
      const batch = keys.slice(i, i + BATCH_SIZE)
      if (batch.length > 0) {
        await redis.del(...batch)
      }
    }
  } catch (err) {
    console.error(`[Redis] Failed to clear pattern ${pattern}:`, err)
  }
}
