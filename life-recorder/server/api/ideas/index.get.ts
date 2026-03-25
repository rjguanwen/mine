import { eq, desc, sql } from 'drizzle-orm'
import { ideas, ideaTags, tags, media } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const query = getQuery(event)
  const db = useDb()

  const { page = '1', limit = '20' } = query as Record<string, string>

  const allIdeas = db.select().from(ideas)
    .where(eq(ideas.userId, userId))
    .orderBy(desc(ideas.createdAt))
    .all()

  const total = allIdeas.length
  const offset = (parseInt(page) - 1) * parseInt(limit)
  const paged = allIdeas.slice(offset, offset + parseInt(limit))

  const result = paged.map(idea => {
    const tagRows = db.select({ tagId: ideaTags.tagId })
      .from(ideaTags).where(eq(ideaTags.ideaId, idea.id)).all()
    const tagList = tagRows.length > 0
      ? db.select().from(tags).where(sql`${tags.id} IN (${sql.join(tagRows.map(r => sql`${r.tagId}`), sql`, `)})`)
          .all()
      : []
    const ideaMedia = db.select().from(media)
      .where(sql`${media.entityType} = 'idea' AND ${media.entityId} = ${idea.id}`)
      .all()
    return {
      ...idea,
      tags: tagList,
      media: ideaMedia.map(m => ({ ...m, url: `/uploads/${m.filePath}` })),
    }
  })

  return { items: result, total, page: parseInt(page), limit: parseInt(limit) }
})
