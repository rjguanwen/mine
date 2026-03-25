import { eq, and, sql } from 'drizzle-orm'
import { ideas, ideaTags, tags, media } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const id = parseInt(getRouterParam(event, 'id') as string)
  const db = useDb()

  const idea = db.select().from(ideas)
    .where(and(eq(ideas.id, id), eq(ideas.userId, userId))).get()
  if (!idea) throw createError({ statusCode: 404, statusMessage: 'Idea not found' })

  const tagRows = db.select({ tagId: ideaTags.tagId })
    .from(ideaTags).where(eq(ideaTags.ideaId, id)).all()
  const tagList = tagRows.length > 0
    ? db.select().from(tags).where(sql`${tags.id} IN (${sql.join(tagRows.map(r => sql`${r.tagId}`), sql`, `)})`)
        .all()
    : []
  const ideaMedia = db.select().from(media)
    .where(sql`${media.entityType} = 'idea' AND ${media.entityId} = ${id}`)
    .all()

  return {
    ...idea,
    tags: tagList,
    media: ideaMedia.map(m => ({ ...m, url: `/uploads/${m.filePath}` })),
  }
})
