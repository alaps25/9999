/**
 * Utility functions to clean up duplicate menu items
 */

import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

/**
 * Find and remove duplicate menu items for a user
 * Keeps the first item with each unique slug, removes duplicates
 */
export async function removeDuplicateMenuItems(userId: string): Promise<{
  removed: number
  kept: number
}> {
  if (!db) {
    console.error('Firebase not configured')
    return { removed: 0, kept: 0 }
  }

  try {
    const menuRef = collection(db, 'menu')
    const q = query(
      menuRef,
      where('userId', '==', userId),
      orderBy('order', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{ id: string; slug?: string; order?: number; [key: string]: any }>

    // Group items by slug
    const itemsBySlug = new Map<string, typeof items>()
    
    items.forEach((item) => {
      const slug = item.slug || 'page' // Default slug
      if (!itemsBySlug.has(slug)) {
        itemsBySlug.set(slug, [])
      }
      itemsBySlug.get(slug)!.push(item)
    })

    let removed = 0
    let kept = 0

    // For each slug group, keep the first one, remove duplicates
    for (const [slug, groupItems] of itemsBySlug.entries()) {
      if (groupItems.length > 1) {
        // Keep the first item (by order or creation time)
        const sorted = groupItems.sort((a, b) => (a.order || 0) - (b.order || 0))
        const toKeep = sorted[0]
        const toRemove = sorted.slice(1)
        
        kept++
        
        // Remove duplicates
        for (const itemToRemove of toRemove) {
          await deleteDoc(doc(db, 'menu', itemToRemove.id))
          removed++
        }
      } else {
        kept++
      }
    }

    return { removed, kept }
  } catch (error) {
    console.error('Error removing duplicate menu items:', error)
    return { removed: 0, kept: 0 }
  }
}

