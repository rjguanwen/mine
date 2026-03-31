import { eq, and, desc, like, sql } from 'drizzle-orm'
import { records, recordTags, tags, media } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const query = getQuery(event)
  const db = useDb()

  const { from, to, mood, page = '1', limit = '20' } = query as Record<string, string>
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let conditions = [eq(records.userId, userId)]

  const allRecords = db.select().from(records)
    .where(and(...conditions))
    .orderBy(desc(records.recordDate))
    .limit(parseInt(limit))
    .offset(offset)
    .all()

  // Filter by date range and mood in JS for simplicity
  let filtered = allRecords
  if (from) filtered = filtered.filter(r => r.recordDate >= from)
  if (to) filtered = filtered.filter(r => r.recordDate <= to)
  if (mood) filtered = filtered.filter(r => r.mood === mood)

  // Get tags for each record
  const result = filtered.map(record => {
    const recordTagRows = db.select({ tagId: recordTags.tagId })
      .from(recordTags)
      .where(eq(recordTags.recordId, record.id))
      .all()
    const tagIds = recordTagRows.map(rt => rt.tagId)
    const recordTagList = tagIds.length > 0
      ? db.select().from(tags).where(sql`${tags.id} IN (${sql.join(tagIds.map(id => sql`${id}`), sql`, `)})`)
          .all()
      : []

    // Get media
    const recordMedia = db.select().from(media)
      .where(and(eq(media.entityType, 'record'), eq(media.entityId, record.id)))
      .all()

    return {
      ...record,
      tags: recordTagList,
      media: recordMedia.map(m => ({ ...m, url: `/api/uploads/${m.filePath}` })),
    }
  })

  // Get total count
  const countResult = db.select({ count: sql<number>`count(*)` })
    .from(records)
    .where(eq(records.userId, userId))
    .get()

  return {
    items: result,
    total: countResult?.count || 0,
    page: parseInt(page),
    limit: parseInt(limit),
  }
})
