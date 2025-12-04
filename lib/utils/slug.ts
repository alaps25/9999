/**
 * Utility functions for generating and working with slugs
 */

/**
 * Generate a URL-friendly slug from a label
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 */
export function generateSlug(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
}

/**
 * Generate a unique slug from a label, ensuring it doesn't conflict with existing slugs
 */
export function generateUniqueSlug(label: string, existingSlugs: string[]): string {
  const baseSlug = generateSlug(label)
  let slug = baseSlug
  let counter = 1
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  return slug
}

