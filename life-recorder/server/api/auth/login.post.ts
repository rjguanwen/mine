import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { useDb } from '../../database'
import { comparePassword, signToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const db = useDb()

  const user = db.select().from(users).where(eq(users.email, email)).get()
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const isValid = await comparePassword(password, user.passwordHash)
  if (!isValid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const token = signToken({ userId: user.id, email: user.email })

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      birthDate: user.birthDate,
      expectedLifespan: user.expectedLifespan,
      avatarUrl: user.avatarUrl,
      isSetupComplete: user.isSetupComplete === 1,
    },
  }
})
