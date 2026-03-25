import { eq, and } from 'drizzle-orm'
import { ideas, ideaTags } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const id = parseInt(getRouterParam(event, 'id') as string)
  const db = useDb()

  const existing = db.select().from(ideas)
    .where(and(eq(ideas.id, id), eq(ideas.userId, userId))).get()
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Idea not found' })

  db.delete(ideaTags).where(eq(ideaTags.ideaId, id)).run()
  db.delete(ideas).where(eq(ideas.id, id)).run()
  return { success: true }
})
