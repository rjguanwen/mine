import { eq, sql } from 'drizzle-orm'
import { tags } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const db = useDb()

  const allTags = db.select().from(tags).where(eq(tags.userId, userId)).all()
  return allTags
})
