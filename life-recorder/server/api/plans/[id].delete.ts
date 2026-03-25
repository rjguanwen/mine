import { eq, and } from 'drizzle-orm'
import { plans, planTags } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const id = parseInt(getRouterParam(event, 'id') as string)
  const db = useDb()

  const existing = db.select().from(plans)
    .where(and(eq(plans.id, id), eq(plans.userId, userId))).get()
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Plan not found' })

  db.delete(planTags).where(eq(planTags.planId, id)).run()
  db.delete(plans).where(eq(plans.id, id)).run()
  return { success: true }
})
