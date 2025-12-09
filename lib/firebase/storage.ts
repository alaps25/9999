import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
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

