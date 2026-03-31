import { writeFile } from 'fs/promises'
import { join } from 'path'
import { media } from '../../database/schema'
import { useDb } from '../../database'
import { getUserIdFromEvent } from '../../utils/auth'
import { validateFile, getUploadPath, generateFileName } from '../../utils/upload'

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const fileField = formData.find(f => f.name === 'file')
  const entityTypeField = formData.find(f => f.name === 'entityType')
  const entityIdField = formData.find(f => f.name === 'entityId')

  if (!fileField || !fileField.data || !fileField.filename) {
    throw createError({ statusCode: 400, statusMessage: 'File is required' })
  }

  const mimeType = fileField.type || 'application/octet-stream'
  const fileSize = fileField.data.length

  const validation = validateFile(mimeType, fileSize)
  if (!validation.valid) {
    throw createError({ statusCode: 400, statusMessage: validation.error })
  }

  const { dir, subDir } = getUploadPath(mimeType)
  const fileName = generateFileName(fileField.filename)
  const filePath = join(dir, fileName)

  await writeFile(filePath, fileField.data)

  const db = useDb()
  const relativePath = `${subDir}/${fileName}`

  const result = db.insert(media).values({
    userId,
    filePath: relativePath,
    fileName: fileField.filename,
    mimeType,
    fileSize,
    entityType: entityTypeField?.data?.toString() || null,
    entityId: entityIdField?.data ? parseInt(entityIdField.data.toString()) : null,
    createdAt: new Date().toISOString(),
  }).returning().get()

  return {
    id: result.id,
    url: `/api/uploads/${relativePath}`,
    fileName: result.fileName,
    mimeType: result.mimeType,
    fileSize: result.fileSize,
  }
})
