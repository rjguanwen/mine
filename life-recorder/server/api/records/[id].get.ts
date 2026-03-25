import { eq, and, sql } from 'drizzle-orm'
import { records, recordTags, tags, media } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const id = parseInt(getRouterParam(event, 'id') as string)
  const db = useDb()

  const record = db.select().from(records)
    .where(and(eq(records.id, id), eq(records.userId, userId)))
    .get()

  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'Record not found' })
  }

  // Get tags
  const tagRows = db.select({ tagId: recordTags.tagId })
    .from(recordTags)
    .where(eq(recordTags.recordId, id))
    .all()
  const tagIds = tagRows.map(r => r.tagId)
  const recordTagList = tagIds.length > 0
    ? db.select().from(tags).where(sql`${tags.id} IN (${sql.join(tagIds.map(tid => sql`${tid}`), sql`, `)})`)
        .all()
    : []

  // Get media
  const recordMedia = db.select().from(media)
    .where(and(eq(media.entityType, 'record'), eq(media.entityId, id)))
    .all()

  return {
    ...record,
    tags: recordTagList,
    media: recordMedia.map(m => ({ ...m, url: `/uploads/${m.filePath}` })),
  }
})
