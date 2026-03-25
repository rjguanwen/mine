import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { useDb } from '../../database'
import { hashPassword, signToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, displayName } = body

  if (!email || !password || !displayName) {
    throw createError({ statusCode: 400, statusMessage: 'Email, password and display name are required' })
  }

  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email format' })
  }

  const db = useDb()

  // Check if email already exists
  const existing = db.select().from(users).where(eq(users.email, email)).get()
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
  }

  const passwordHash = await hashPassword(password)
  const now = new Date().toISOString()

  const result = db.insert(users).values({
    email,
    passwordHash,
    displayName,
    createdAt: now,
    updatedAt: now,
  }).returning().get()

  const token = signToken({ userId: result.id, email: result.email })

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return {
    token,
    user: {
      id: result.id,
      email: result.email,
      displayName: result.displayName,
      isSetupComplete: result.isSetupComplete === 1,
    },
  }
})
