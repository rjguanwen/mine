import { eq, and } from 'drizzle-orm'
import { plans } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const id = parseInt(getRouterParam(event, 'id') as string)
  const body = await readBody(event)
  const db = useDb()

  const existing = db.select().from(plans)
    .where(and(eq(plans.id, id), eq(plans.userId, userId))).get()
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Plan not found' })

  const { title, description, targetDate, startDate, status, priority, linkedMilestoneId } = body

  const result = db.update(plans).set({
    title: title ?? existing.title,
    description: description !== undefined ? description : existing.description,
    targetDate: targetDate !== undefined ? targetDate : existing.targetDate,
    startDate: startDate !== undefined ? startDate : existing.startDate,
    status: status || existing.status,
    priority: priority || existing.priority,
    linkedMilestoneId: linkedMilestoneId !== undefined ? linkedMilestoneId : existing.linkedMilestoneId,
    updatedAt: new Date().toISOString(),
  }).where(eq(plans.id, id)).returning().get()

  return result
})
