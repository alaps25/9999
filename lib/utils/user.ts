/**
 * User utility functions
 */

/**
 * Reserved usernames that cannot be used (except by special email addresses)
 */
const RESERVED_USERNAMES = [
  'alap',
  'alapshah.com',
  'archi.addict',
  'raga',
  'sophie',
].map(name => name.toLowerCase())

/**
 * Email addresses that are allowed to use reserved usernames
 */
const ALLOWED_RESERVED_EMAILS = [
  'archi.addict@gmail.com',
].map(email => email.toLowerCase())

/**
 * Check if an email is allowed to use reserved usernames
 */
function canUseReservedUsername(email: string | null | undefined): boolean {
  if (!email) return false
  return ALLOWED_RESERVED_EMAILS.includes(email.toLowerCase())
}

/**
 * Validate username format and rules
 * @param username - The username to validate
 * @param userEmail - Optional user email to check if they can use reserved usernames
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateUsername(username: string, userEmail?: string | null): { isValid: boolean; error?: string } {
  // Trim whitespace
  const trimmed = username.trim()
  
  // Check if empty
  if (!trimmed) {
    return { isValid: false, error: 'Username cannot be empty' }
  }
  
  // Check length (min 3, max 20)
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' }
  }
  
  if (trimmed.length > 20) {
    return { isValid: false, error: 'Username must be at most 20 characters' }
  }
  
  // Check if lowercase only
  if (trimmed !== trimmed.toLowerCase()) {
    return { isValid: false, error: 'Username must be lowercase only' }
  }
  
  // Check allowed characters: alphanumeric, hyphens, underscores
  const validPattern = /^[a-z0-9_-]+$/
  if (!validPattern.test(trimmed)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' }
  }
  
  // Check reserved usernames (unless user is allowed to use them)
  if (RESERVED_USERNAMES.includes(trimmed) && !canUseReservedUsername(userEmail)) {
    return { isValid: false, error: 'This username is reserved' }
  }
  
  return { isValid: true }
}

/**
 * Check if username is available (not taken by another user)
 * @param username - The username to check
 * @param currentUserId - The current user's ID (to exclude from check)
 * @returns Promise resolving to true if available, false if taken
 */
export async function isUsernameAvailable(username: string, currentUserId: string): Promise<boolean> {
  const { db } = await import('@/lib/firebase/config')
  const { collection, query, where, getDocs } = await import('firebase/firestore')
  
  if (!db) return false
  
  try {
    // Normalize username (lowercase, trim)
    const normalized = username.toLowerCase().trim()
    
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', normalized))
    const querySnapshot = await getDocs(q)
    
    // Username is available if:
    // 1. No documents found, OR
    // 2. Only the current user's document is found (they're keeping their username)
    if (querySnapshot.empty) {
      return true
    }
    
    // Check if the found document belongs to the current user
    const foundUserId = querySnapshot.docs[0].id
    return foundUserId === currentUserId
  } catch (error) {
    console.error('Error checking username availability:', error)
    return false
  }
}

/**
 * Get userId from username by querying Firestore
 */
export async function getUserIdByUsername(username: string): Promise<string | null> {
  const { db } = await import('@/lib/firebase/config')
  const { collection, query, where, getDocs } = await import('firebase/firestore')
  
  if (!db) return null
  
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', username))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id
    }
    
    return null
  } catch (error) {
    console.error('Error getting userId from username:', error)
    return null
  }
}

