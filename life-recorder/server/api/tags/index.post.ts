import { eq, and } from 'drizzle-orm'
import { tags } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const body = await readBody(event)
  const db = useDb()

  const { name, color } = body
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Tag name is required' })

  // Check duplicate
  const existing = db.select().from(tags)
    .where(and(eq(tags.userId, userId), eq(tags.name, name))).get()
  if (existing) return existing

  const tag = db.insert(tags).values({
    userId, name, color: color || null,
    createdAt: new Date().toISOString(),
  }).returning().get()

  return tag
})
