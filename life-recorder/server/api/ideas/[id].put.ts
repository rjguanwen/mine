import { eq, and } from 'drizzle-orm'
import { ideas, media } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const id = parseInt(getRouterParam(event, 'id') as string)
  const body = await readBody(event)
  const db = useDb()

  const existing = db.select().from(ideas)
    .where(and(eq(ideas.id, id), eq(ideas.userId, userId))).get()
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Idea not found' })

  const { title, content, linkedPlanId, linkedMilestoneId, mediaIds } = body

  const result = db.update(ideas).set({
    title: title !== undefined ? title : existing.title,
    content: content !== undefined ? content : existing.content,
    linkedPlanId: linkedPlanId !== undefined ? linkedPlanId : existing.linkedPlanId,
    linkedMilestoneId: linkedMilestoneId !== undefined ? linkedMilestoneId : existing.linkedMilestoneId,
    updatedAt: new Date().toISOString(),
  }).where(eq(ideas.id, id)).returning().get()

  if (mediaIds !== undefined) {
    for (const mediaId of (mediaIds || [])) {
      db.update(media).set({ entityType: 'idea', entityId: id })
        .where(eq(media.id, mediaId)).run()
    }
  }

  return result
})
