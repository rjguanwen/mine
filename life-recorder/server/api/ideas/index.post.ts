import { eq } from 'drizzle-orm'
import { ideas, media } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const body = await readBody(event)
  const db = useDb()

  const { title, content, linkedPlanId, linkedMilestoneId, mediaIds } = body

  if (!content && !title) {
    throw createError({ statusCode: 400, statusMessage: 'Title or content is required' })
  }

  const now = new Date().toISOString()
  const idea = db.insert(ideas).values({
    userId,
    title: title || null,
    content: content || null,
    linkedPlanId: linkedPlanId || null,
    linkedMilestoneId: linkedMilestoneId || null,
    createdAt: now, updatedAt: now,
  }).returning().get()

  if (mediaIds?.length) {
    for (const mediaId of mediaIds) {
      db.update(media).set({ entityType: 'idea', entityId: idea.id })
        .where(eq(media.id, mediaId)).run()
    }
  }

  return idea
})
