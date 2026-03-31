import { createReadStream, existsSync } from 'fs'
import { stat } from 'fs/promises'
import { join, resolve } from 'path'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const filename = getRouterParam(event, 'filename')

  if (!filename) {
    throw createError({ statusCode: 400, statusMessage: 'Filename is required' })
  }

  // 安全检查：防止路径遍历攻击
  const normalizedFilename = filename.replace(/\.\./g, '')
  const uploadDir = resolve(process.cwd(), config.uploadDir as string)
  const filePath = join(uploadDir, normalizedFilename)
  const resolvedPath = resolve(filePath)

  // 确保文件路径在上传目录内
  if (!resolvedPath.startsWith(uploadDir)) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  if (!existsSync(resolvedPath)) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  // 获取文件信息
  const stats = await stat(resolvedPath)
  
  // 设置 Content-Type
  const ext = resolvedPath.toLowerCase().split('.').pop()
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
  }
  
  const mimeType = mimeTypes[ext || ''] || 'application/octet-stream'
  event.node.res.setHeader('Content-Type', mimeType)
  event.node.res.setHeader('Content-Length', stats.size)
  event.node.res.setHeader('Cache-Control', 'public, max-age=31536000')

  return sendStream(event, createReadStream(resolvedPath))
})
