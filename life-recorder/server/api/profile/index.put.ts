import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const body = await readBody(event)
  const { displayName, birthDate, expectedLifespan } = body

  const db = useDb()
  const now = new Date().toISOString()

  const updateData: Record<string, unknown> = { updatedAt: now }

  if (displayName !== undefined) updateData.displayName = displayName
  if (birthDate !== undefined) updateData.birthDate = birthDate
  if (expectedLifespan !== undefined) updateData.expectedLifespan = expectedLifespan

  // If birth date is being set, mark setup as complete
  if (birthDate) {
    updateData.isSetupComplete = 1
  }

  const result = db.update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning()
    .get()

  return {
    id: result.id,
    email: result.email,
    displayName: result.displayName,
    birthDate: result.birthDate,
    expectedLifespan: result.expectedLifespan,
    avatarUrl: result.avatarUrl,
    isSetupComplete: result.isSetupComplete === 1,
  }
})
