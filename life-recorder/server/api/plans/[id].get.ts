import { eq, and } from 'drizzle-orm'
import { plans } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const id = parseInt(getRouterParam(event, 'id') as string)
  const db = useDb()

  const plan = db.select().from(plans)
    .where(and(eq(plans.id, id), eq(plans.userId, userId))).get()
  if (!plan) throw createError({ statusCode: 404, statusMessage: 'Plan not found' })

  return plan
})
