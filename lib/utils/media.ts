/**
 * Utility functions for media type detection
 */

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v']
const GIF_EXTENSIONS = ['.gif']
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.bmp', '.ico']

export type MediaType = 'image' | 'video' | 'gif'

/**
 * Detects the media type based on URL extension
 */
export function getMediaType(url: string): MediaType {
  const lowerUrl = url.toLowerCase()
  
  // Check for video extensions
  if (VIDEO_EXTENSIONS.some(ext => lowerUrl.includes(ext))) {
    return 'video'
  }
  
  // Check for GIF extensions
  if (GIF_EXTENSIONS.some(ext => lowerUrl.includes(ext))) {
    return 'gif'
  }
  
  // Default to image
  return 'image'
}

/**
 * Checks if URL is a video
 */
export function isVideo(url: string): boolean {
  return getMediaType(url) === 'video'
}

/**
 * Checks if URL is a GIF
 */
export function isGif(url: string): boolean {
  return getMediaType(url) === 'gif'
}

/**
 * Checks if URL is an image
 */
export function isImage(url: string): boolean {
  return getMediaType(url) === 'image'
}

