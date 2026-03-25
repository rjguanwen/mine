import { verifyToken } from '../utils/auth'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  // Skip auth for public routes
  if (url.pathname.startsWith('/api/auth/login') ||
      url.pathname.startsWith('/api/auth/register')) {
    return
  }

  // Only protect /api/ routes
  if (!url.pathname.startsWith('/api/')) {
    return
  }

  // Try cookie first, then Authorization header
  const tokenFromCookie = getCookie(event, 'auth_token')
  const authHeader = getHeader(event, 'authorization')
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const token = tokenFromCookie || tokenFromHeader

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const payload = verifyToken(token)
  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }

  // Attach userId to event context for downstream handlers
  event.context.userId = payload.userId
  event.context.userEmail = payload.email
})
