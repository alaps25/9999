/**
 * User utility functions
 */

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

