import { eq, and, sql } from 'drizzle-orm'
import { milestones, milestoneTags, tags, media } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const id = parseInt(getRouterParam(event, 'id') as string)
  const db = useDb()

  const milestone = db.select().from(milestones)
    .where(and(eq(milestones.id, id), eq(milestones.userId, userId))).get()

  if (!milestone) throw createError({ statusCode: 404, statusMessage: 'Milestone not found' })

  const tagRows = db.select({ tagId: milestoneTags.tagId })
    .from(milestoneTags).where(eq(milestoneTags.milestoneId, id)).all()
  const tagList = tagRows.length > 0
    ? db.select().from(tags).where(sql`${tags.id} IN (${sql.join(tagRows.map(r => sql`${r.tagId}`), sql`, `)})`)
        .all()
    : []
  const milestoneMedia = db.select().from(media)
    .where(sql`${media.entityType} = 'milestone' AND ${media.entityId} = ${id}`)
    .all()

  return {
    ...milestone,
    tags: tagList,
    media: milestoneMedia.map(m => ({ ...m, url: `/uploads/${m.filePath}` })),
  }
})
