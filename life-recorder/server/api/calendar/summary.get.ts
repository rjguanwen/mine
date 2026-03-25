import { eq, and, gte, lte, sql } from 'drizzle-orm'
import { users, records, milestones, plans, ideas } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const db = useDb()

  // Get user info
  const user = db.select().from(users).where(eq(users.id, userId)).get()
  if (!user || !user.birthDate) {
    throw createError({ statusCode: 400, statusMessage: 'Birth date not set' })
  }

  // Get all records grouped by date
  const allRecords = db.select({
    recordDate: records.recordDate,
    count: sql<number>`count(*)`.as('count'),
  })
    .from(records)
    .where(eq(records.userId, userId))
    .groupBy(records.recordDate)
    .all()

  // Get all milestones
  const allMilestones = db.select({
    id: milestones.id,
    title: milestones.title,
    category: milestones.category,
    eventDate: milestones.eventDate,
    importance: milestones.importance,
  })
    .from(milestones)
    .where(eq(milestones.userId, userId))
    .all()

  // Get all plans
  const allPlans = db.select({
    id: plans.id,
    title: plans.title,
    targetDate: plans.targetDate,
    startDate: plans.startDate,
    status: plans.status,
  })
    .from(plans)
    .where(eq(plans.userId, userId))
    .all()

  // Get all ideas
  const allIdeas = db.select({
    id: ideas.id,
    createdAt: ideas.createdAt,
  })
    .from(ideas)
    .where(eq(ideas.userId, userId))
    .all()

  return {
    birthDate: user.birthDate,
    expectedLifespan: user.expectedLifespan,
    records: allRecords,
    milestones: allMilestones,
    plans: allPlans,
    ideas: allIdeas,
  }
})
