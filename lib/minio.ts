import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// MinIO configuration
const minioConfig = {
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  region: process.env.MINIO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true, // Required for MinIO
}

const s3Client = new S3Client(minioConfig)

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'product-images'

/**
 * Upload a file to MinIO
 * @param file - File buffer
 * @param filename - Desired filename
 * @param contentType - MIME type of the file
 * @returns Promise<string> - The file URL
 */
export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: file,
      ContentType: contentType,
      // Make the object publicly readable
      ACL: 'public-read',
    })

    await s3Client.send(command)
    
    // Return the public URL
    return `${minioConfig.endpoint}/${BUCKET_NAME}/${filename}`
  } catch (error) {
    console.error('MinIO upload error:', error)
    throw new Error('File upload failed')
  }
}

/**
 * Delete a file from MinIO
 * @param filename - The filename to delete
 * @returns Promise<void>
 */
export async function deleteFile(filename: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
    })

    await s3Client.send(command)
  } catch (error) {
    console.error('MinIO delete error:', error)
    throw new Error('File deletion failed')
  }
}

/**
 * Get a presigned URL for file download (useful for private files)
 * @param filename - The filename
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Promise<string> - The presigned URL
 */
export async function getPresignedUrl(
  filename: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
    })

    return await getSignedUrl(s3Client, command, { expiresIn })
  } catch (error) {
    console.error('MinIO presigned URL error:', error)
    throw new Error('Failed to generate presigned URL')
  }
}

/**
 * Generate a unique filename for uploaded files
 * @param originalName - Original filename
 * @param productId - Product ID for organization
 * @returns string - Unique filename
 */
export function generateUniqueFilename(originalName: string, productId?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  
  const prefix = productId ? `products/${productId}` : 'products'
  return `${prefix}/${timestamp}-${random}.${extension}`
}

/**
 * Extract filename from a MinIO URL
 * @param url - The full MinIO URL
 * @returns string | null - The filename or null if invalid
 */
export function extractFilenameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    
    // Remove empty strings and bucket name
    const cleanParts = pathParts.filter(part => part !== '' && part !== BUCKET_NAME)
    
    return cleanParts.join('/')
  } catch {
    return null
  }
}

/**
 * Validate file type for product images
 * @param contentType - MIME type of the file
 * @returns boolean - Whether the file type is allowed
 */
export function isValidImageType(contentType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
  
  return allowedTypes.includes(contentType.toLowerCase())
}

/**
 * Validate file size
 * @param size - File size in bytes
 * @param maxSizeMB - Maximum size in MB (default: 5MB)
 * @returns boolean - Whether the file size is acceptable
 */
export function isValidFileSize(size: number, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return size <= maxSizeBytes
}

export { s3Client, BUCKET_NAME }