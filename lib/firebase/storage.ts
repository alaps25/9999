import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage'
import { storage } from './config'

/**
 * Upload a file to Firebase Storage
 * @param file The file to upload
 * @param path The storage path (e.g., 'projects/{projectId}/images/{filename}')
 * @param userId The user ID for organizing files
 * @returns Promise resolving to the download URL
 */
export async function uploadFile(
  file: File,
  path: string,
  userId: string
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not configured')
  }

  // Create a unique filename with timestamp to avoid conflicts
  const timestamp = Date.now()
  const fileName = `${timestamp}-${file.name}`
  const fullPath = `users/${userId}/${path}/${fileName}`

  const storageRef = ref(storage, fullPath)
  
  // Upload the file
  await uploadBytes(storageRef, file)
  
  // Get the download URL
  const downloadURL = await getDownloadURL(storageRef)
  
  return downloadURL
}

/**
 * Upload multiple files to Firebase Storage
 * @param files Array of files to upload
 * @param path The storage path
 * @param userId The user ID
 * @returns Promise resolving to an array of download URLs
 */
export async function uploadFiles(
  files: File[],
  path: string,
  userId: string
): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFile(file, path, userId))
  return Promise.all(uploadPromises)
}

/**
 * Delete a file from Firebase Storage
 * @param url The download URL of the file to delete
 * @returns Promise that resolves when the file is deleted
 */
export async function deleteFile(url: string): Promise<void> {
  if (!storage) {
    throw new Error('Firebase Storage is not configured')
  }

  try {
    // Extract the path from the URL
    // Firebase Storage URLs are in format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/)
    
    if (pathMatch) {
      const filePath = decodeURIComponent(pathMatch[1])
      const storageRef = ref(storage, filePath)
      await deleteObject(storageRef)
    } else {
      console.warn('Could not extract path from URL:', url)
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    // Don't throw - file might already be deleted or URL might be invalid
  }
}

/**
 * Check if a URL is a Firebase Storage URL
 */
export function isFirebaseStorageUrl(url: string): boolean {
  return url.includes('firebasestorage.googleapis.com')
}

/**
 * Check if a URL is a blob URL (temporary)
 */
export function isBlobUrl(url: string): boolean {
  return url.startsWith('blob:')
}

/**
 * Get file size from Firebase Storage URL
 * Extracts the file path and fetches metadata to get actual file size
 * @param url The Firebase Storage download URL
 * @returns Promise resolving to file size in bytes, or null if unable to fetch
 */
export async function getFileSize(url: string): Promise<number | null> {
  if (!storage) {
    return null
  }

  try {
    // Extract the path from the URL
    // Firebase Storage URLs are in format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const urlObj = new URL(url)
    // Use non-greedy match and handle URLs with or without query params
    const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/)
    
    if (!pathMatch) {
      return null
    }

    // Decode the path (handles URL encoding)
    let filePath = decodeURIComponent(pathMatch[1])
    
    // Handle double encoding if needed
    try {
      filePath = decodeURIComponent(filePath)
    } catch {
      // Already decoded
    }
    
    const storageRef = ref(storage, filePath)
    
    // Get metadata which includes size
    const metadata = await getMetadata(storageRef)
    
    if (!metadata || metadata.size === undefined) {
      return null
    }
    
    return metadata.size
  } catch (error: any) {
    // Silently fail - storage calculation will continue with other files
    return null
  }
}

/**
 * Get total file size for multiple Firebase Storage URLs
 * Fetches metadata for all files and sums their sizes
 * @param urls Array of Firebase Storage download URLs
 * @returns Promise resolving to total size in bytes
 */
export async function getTotalFileSize(urls: string[]): Promise<number> {
  if (urls.length === 0) {
    return 0
  }

  // Filter out blob URLs and invalid URLs
  const validUrls = urls.filter(url => url && !isBlobUrl(url) && isFirebaseStorageUrl(url))
  
  if (validUrls.length === 0) {
    return 0
  }

  // Fetch all file sizes in parallel
  const sizePromises = validUrls.map(url => getFileSize(url))
  const sizes = await Promise.all(sizePromises)
  
  // Sum all sizes, ignoring null values (failed fetches)
  const total = sizes.reduce((acc: number, size) => acc + (size || 0), 0)
  
  return total
}
