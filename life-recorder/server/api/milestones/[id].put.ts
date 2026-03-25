import { eq, and } from 'drizzle-orm'
import { milestones, milestoneTags, media } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const id = parseInt(getRouterParam(event, 'id') as string)
  const body = await readBody(event)
  const db = useDb()

  const existing = db.select().from(milestones)
    .where(and(eq(milestones.id, id), eq(milestones.userId, userId))).get()
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Milestone not found' })

  const { title, description, eventDate, endDate, category, importance, tagIds, mediaIds } = body

  const result = db.update(milestones).set({
    title: title ?? existing.title,
    description: description !== undefined ? description : existing.description,
    eventDate: eventDate || existing.eventDate,
    endDate: endDate !== undefined ? endDate : existing.endDate,
    category: category || existing.category,
    importance: importance ?? existing.importance,
    updatedAt: new Date().toISOString(),
  }).where(eq(milestones.id, id)).returning().get()

  if (tagIds !== undefined) {
    db.delete(milestoneTags).where(eq(milestoneTags.milestoneId, id)).run()
    for (const tagId of (tagIds || [])) {
      db.insert(milestoneTags).values({ milestoneId: id, tagId }).run()
    }
  }

  if (mediaIds !== undefined) {
    for (const mediaId of (mediaIds || [])) {
      db.update(media).set({ entityType: 'milestone', entityId: id })
        .where(eq(media.id, mediaId)).run()
    }
  }

  return result
})
