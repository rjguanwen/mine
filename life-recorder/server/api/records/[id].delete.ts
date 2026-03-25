import { eq, and } from 'drizzle-orm'
import { records, recordTags } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const id = parseInt(getRouterParam(event, 'id') as string)
  const db = useDb()

  const existing = db.select().from(records)
    .where(and(eq(records.id, id), eq(records.userId, userId)))
    .get()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Record not found' })
  }

  db.delete(recordTags).where(eq(recordTags.recordId, id)).run()
  db.delete(records).where(eq(records.id, id)).run()

  return { success: true }
})
