import { eq, and } from 'drizzle-orm'
import { milestones, milestoneTags } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const id = parseInt(getRouterParam(event, 'id') as string)
  const db = useDb()

  const existing = db.select().from(milestones)
    .where(and(eq(milestones.id, id), eq(milestones.userId, userId))).get()
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Milestone not found' })

  db.delete(milestoneTags).where(eq(milestoneTags.milestoneId, id)).run()
  db.delete(milestones).where(eq(milestones.id, id)).run()
  return { success: true }
})
