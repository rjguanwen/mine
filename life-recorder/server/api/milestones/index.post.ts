import { eq } from 'drizzle-orm'
import { milestones, milestoneTags, media } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const body = await readBody(event)
  const db = useDb()

  const { title, description, eventDate, endDate, category, importance, tagIds, mediaIds } = body

  if (!title || !eventDate) {
    throw createError({ statusCode: 400, statusMessage: 'Title and event date are required' })
  }

  const now = new Date().toISOString()
  const milestone = db.insert(milestones).values({
    userId, title, description, eventDate,
    endDate: endDate || null,
    category: category || 'other',
    importance: importance || 3,
    createdAt: now, updatedAt: now,
  }).returning().get()

  if (tagIds?.length) {
    for (const tagId of tagIds) {
      db.insert(milestoneTags).values({ milestoneId: milestone.id, tagId }).run()
    }
  }

  if (mediaIds?.length) {
    for (const mediaId of mediaIds) {
      db.update(media).set({ entityType: 'milestone', entityId: milestone.id })
        .where(eq(media.id, mediaId)).run()
    }
  }

  return milestone
})
