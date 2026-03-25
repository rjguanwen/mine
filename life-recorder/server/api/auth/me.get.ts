import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const db = useDb()

  const user = db.select().from(users).where(eq(users.id, userId)).get()
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    birthDate: user.birthDate,
    expectedLifespan: user.expectedLifespan,
    avatarUrl: user.avatarUrl,
    isSetupComplete: user.isSetupComplete === 1,
  }
})
