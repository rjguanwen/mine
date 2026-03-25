import { eq, desc, sql } from 'drizzle-orm'
import { plans, planTags, tags } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const query = getQuery(event)
  const db = useDb()

  const { status, priority, page = '1', limit = '50' } = query as Record<string, string>

  let allPlans = db.select().from(plans)
    .where(eq(plans.userId, userId))
    .orderBy(desc(plans.createdAt))
    .all()

  if (status) allPlans = allPlans.filter(p => p.status === status)
  if (priority) allPlans = allPlans.filter(p => p.priority === priority)

  const total = allPlans.length
  const offset = (parseInt(page) - 1) * parseInt(limit)
  const paged = allPlans.slice(offset, offset + parseInt(limit))

  const result = paged.map(plan => {
    const tagRows = db.select({ tagId: planTags.tagId })
      .from(planTags).where(eq(planTags.planId, plan.id)).all()
    const tagList = tagRows.length > 0
      ? db.select().from(tags).where(sql`${tags.id} IN (${sql.join(tagRows.map(r => sql`${r.tagId}`), sql`, `)})`)
          .all()
      : []
    return { ...plan, tags: tagList }
  })

  return { items: result, total, page: parseInt(page), limit: parseInt(limit) }
})
