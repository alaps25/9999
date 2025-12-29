/**
 * Session management utilities for private page access
 * Uses localStorage for client-side session storage
 */

const SESSION_KEY_PREFIX = 'wires_session_'
const SESSION_DURATION_MS = 20 * 60 * 1000 // 20 minutes

/**
 * Create a session token for a user
 */
function generateSessionToken(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Store session for a user
 * @param userId User ID
 * @param sessionToken Session token (optional, will be generated if not provided)
 */
export function createSession(userId: string, sessionToken?: string): void {
  if (typeof window === 'undefined') return
  
  const token = sessionToken || generateSessionToken()
  const expiresAt = Date.now() + SESSION_DURATION_MS
  
  const sessionData = {
    token,
    expiresAt,
    userId,
  }
  
  localStorage.setItem(`${SESSION_KEY_PREFIX}${userId}`, JSON.stringify(sessionData))
}

/**
 * Check if a valid session exists for a user
 * @param userId User ID
 * @returns true if valid session exists, false otherwise
 */
export function hasValidSession(userId: string): boolean {
  if (typeof window === 'undefined') return false
  
  const sessionKey = `${SESSION_KEY_PREFIX}${userId}`
  const sessionDataStr = localStorage.getItem(sessionKey)
  
  if (!sessionDataStr) return false
  
  try {
    const sessionData = JSON.parse(sessionDataStr)
    
    // Check if session has expired
    if (Date.now() > sessionData.expiresAt) {
      // Session expired, remove it
      localStorage.removeItem(sessionKey)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error parsing session data:', error)
    localStorage.removeItem(sessionKey)
    return false
  }
}

/**
 * Clear session for a user
 * @param userId User ID
 */
export function clearSession(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`${SESSION_KEY_PREFIX}${userId}`)
}

/**
 * Get session token for a user (for server-side validation if needed)
 * @param userId User ID
 * @returns Session token or null if no valid session
 */
export function getSessionToken(userId: string): string | null {
  if (typeof window === 'undefined') return null
  
  const sessionKey = `${SESSION_KEY_PREFIX}${userId}`
  const sessionDataStr = localStorage.getItem(sessionKey)
  
  if (!sessionDataStr) return null
  
  try {
    const sessionData = JSON.parse(sessionDataStr)
    
    // Check if session has expired
    if (Date.now() > sessionData.expiresAt) {
      localStorage.removeItem(sessionKey)
      return null
    }
    
    return sessionData.token
  } catch (error) {
    console.error('Error parsing session data:', error)
    return null
  }
}

