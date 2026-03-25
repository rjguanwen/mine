import { eq, and } from 'drizzle-orm'
import { records, recordTags } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const id = parseInt(getRouterParam(event, 'id') as string)
  const body = await readBody(event)
  const db = useDb()

  const existing = db.select().from(records)
    .where(and(eq(records.id, id), eq(records.userId, userId)))
    .get()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Record not found' })
  }

  const { title, content, recordDate, mood, weather, tagIds, mediaIds } = body

  const result = db.update(records).set({
    title: title !== undefined ? title : existing.title,
    content: content !== undefined ? content : existing.content,
    recordDate: recordDate || existing.recordDate,
    mood: mood !== undefined ? mood : existing.mood,
    weather: weather !== undefined ? weather : existing.weather,
    updatedAt: new Date().toISOString(),
  }).where(eq(records.id, id)).returning().get()

  // Update tags if provided
  if (tagIds !== undefined) {
    db.delete(recordTags).where(eq(recordTags.recordId, id)).run()
    for (const tagId of (tagIds || [])) {
      db.insert(recordTags).values({ recordId: id, tagId }).run()
    }
  }

  // Update media references
  if (mediaIds !== undefined) {
    const { media } = await import('../../database/schema')
    for (const mediaId of (mediaIds || [])) {
      db.update(media)
        .set({ entityType: 'record', entityId: id })
        .where(eq(media.id, mediaId))
        .run()
    }
  }

  return result
})
