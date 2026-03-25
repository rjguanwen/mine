import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { H3Event } from 'h3'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: { userId: number; email: string }): string {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret as string, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwtSecret as string) as { userId: number; email: string }
  } catch {
    return null
  }
}

export function getUserIdFromEvent(event: H3Event): number {
  const userId = event.context.userId
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return userId as number
}
