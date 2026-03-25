import { eq, desc, sql } from 'drizzle-orm'
import { milestones, milestoneTags, tags, media } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const query = getQuery(event)
  const db = useDb()

  const { category, from, to, page = '1', limit = '20' } = query as Record<string, string>

  let allMilestones = db.select().from(milestones)
    .where(eq(milestones.userId, userId))
    .orderBy(desc(milestones.eventDate))
    .all()

  if (category) allMilestones = allMilestones.filter(m => m.category === category)
  if (from) allMilestones = allMilestones.filter(m => m.eventDate >= from)
  if (to) allMilestones = allMilestones.filter(m => m.eventDate <= to)

  const total = allMilestones.length
  const offset = (parseInt(page) - 1) * parseInt(limit)
  const paged = allMilestones.slice(offset, offset + parseInt(limit))

  const result = paged.map(milestone => {
    const tagRows = db.select({ tagId: milestoneTags.tagId })
      .from(milestoneTags).where(eq(milestoneTags.milestoneId, milestone.id)).all()
    const tagList = tagRows.length > 0
      ? db.select().from(tags).where(sql`${tags.id} IN (${sql.join(tagRows.map(r => sql`${r.tagId}`), sql`, `)})`)
          .all()
      : []
    const milestoneMedia = db.select().from(media)
      .where(sql`${media.entityType} = 'milestone' AND ${media.entityId} = ${milestone.id}`)
      .all()

    return {
      ...milestone,
      tags: tagList,
      media: milestoneMedia.map(m => ({ ...m, url: `/uploads/${m.filePath}` })),
    }
  })

  return { items: result, total, page: parseInt(page), limit: parseInt(limit) }
})
