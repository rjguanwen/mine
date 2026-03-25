import { existsSync, mkdirSync } from 'fs'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

export function validateFile(mimeType: string, size: number): { valid: boolean; error?: string } {
  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType)
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType)

  if (!isImage && !isVideo) {
    return { valid: false, error: `Unsupported file type: ${mimeType}` }
  }

  if (isImage && size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Image file exceeds 10MB limit' }
  }

  if (isVideo && size > MAX_VIDEO_SIZE) {
    return { valid: false, error: 'Video file exceeds 100MB limit' }
  }

  return { valid: true }
}

export function getUploadPath(mimeType: string): { dir: string; subDir: string } {
  const config = useRuntimeConfig()
  const baseDir = config.uploadDir as string
  const subDir = ALLOWED_IMAGE_TYPES.includes(mimeType) ? 'images' : 'videos'
  const dir = join(baseDir, subDir)

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  return { dir, subDir }
}

export function generateFileName(originalName: string): string {
  const ext = extname(originalName) || '.bin'
  return `${randomUUID()}${ext}`
}
