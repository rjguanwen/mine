import { plans } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const body = await readBody(event)
  const db = useDb()

  const { title, description, targetDate, startDate, status, priority } = body

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  const now = new Date().toISOString()
  const plan = db.insert(plans).values({
    userId, title,
    description: description || null,
    targetDate: targetDate || null,
    startDate: startDate || null,
    status: status || 'not_started',
    priority: priority || 'medium',
    createdAt: now, updatedAt: now,
  }).returning().get()

  return plan
})
