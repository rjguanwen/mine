import { eq, and } from 'drizzle-orm'
import { records, recordTags, tags } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const body = await readBody(event)
  const db = useDb()

  const { title, content, recordDate, mood, weather, tagIds, mediaIds } = body

  if (!recordDate) {
    throw createError({ statusCode: 400, statusMessage: 'Record date is required' })
  }

  const now = new Date().toISOString()
  const record = db.insert(records).values({
    userId,
    title: title || null,
    content: content || null,
    recordDate,
    mood: mood || null,
    weather: weather || null,
    createdAt: now,
    updatedAt: now,
  }).returning().get()

  // Associate tags
  if (tagIds?.length) {
    for (const tagId of tagIds) {
      db.insert(recordTags).values({ recordId: record.id, tagId }).run()
    }
  }

  // Update media entity references
  if (mediaIds?.length) {
    const { media } = await import('../../database/schema')
    for (const mediaId of mediaIds) {
      db.update(media)
        .set({ entityType: 'record', entityId: record.id })
        .where(eq(media.id, mediaId))
        .run()
    }
  }

  return record
})
