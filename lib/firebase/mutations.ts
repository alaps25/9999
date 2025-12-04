import { doc, updateDoc, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from './config'
import type { Project, MenuItem, Slide } from './types'
import { generateSlug, generateUniqueSlug } from '../utils/slug'

/**
 * Check if Firebase is configured
 */
function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    db
  )
}

/**
 * Update bio text in Firestore
 */
export async function updateBio(text: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping bio update')
    return
  }

  try {
    const bioRef = collection(db!, 'bio')
    const bioDocs = await getDocs(bioRef)
    
    if (bioDocs.empty) {
      // Create new bio document
      await addDoc(bioRef, { text })
    } else {
      // Update existing bio document
      const bioDoc = bioDocs.docs[0]
      await updateDoc(doc(db!, 'bio', bioDoc.id), { text })
    }
  } catch (error) {
    console.error('Error updating bio:', error)
    throw error
  }
}

/**
 * Update menu item in Firestore
 */
export async function updateMenuItem(itemId: string, updates: Partial<MenuItem>): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping menu item update')
    return
  }

  try {
    const menuItemRef = doc(db!, 'menu', itemId)
    await updateDoc(menuItemRef, updates)
  } catch (error) {
    console.error('Error updating menu item:', error)
    throw error
  }
}

/**
 * Add new menu item to Firestore
 * Automatically generates slug from label and sets href
 */
export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<string> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping menu item add')
    return `menu-${Date.now()}`
  }

  try {
    // Get existing slugs to ensure uniqueness
    const menuRef = collection(db!, 'menu')
    const q = query(menuRef, orderBy('order', 'asc'))
    const existingItems = await getDocs(q)
    const existingSlugs = existingItems.docs
      .map(doc => doc.data().slug)
      .filter(Boolean) as string[]
    
    // Generate slug from label
    const slug = item.slug || generateUniqueSlug(item.label, existingSlugs)
    
    const docRef = await addDoc(menuRef, {
      ...item,
      slug: slug,
      order: Date.now(), // Use timestamp as order
    })
    
    // Update href to match slug
    const href = `/${slug}`
    await updateDoc(doc(db!, 'menu', docRef.id), {
      href: href,
    })
    
    return docRef.id
  } catch (error) {
    console.error('Error adding menu item:', error)
    throw error
  }
}

/**
 * Update project in Firestore
 */
export async function updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping project update')
    return
  }

  try {
    const projectRef = doc(db!, 'projects', projectId)
    await updateDoc(projectRef, updates)
  } catch (error) {
    console.error('Error updating project:', error)
    throw error
  }
}

/**
 * Add new project to Firestore
 */
export async function addProject(project: Omit<Project, 'id'>): Promise<string> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping project add')
    return `project-${Date.now()}`
  }

  try {
    const projectsRef = collection(db!, 'projects')
    const docRef = await addDoc(projectsRef, {
      ...project,
      order: Date.now(), // Use timestamp as order
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding project:', error)
    throw error
  }
}

/**
 * Update project slides in Firestore
 */
export async function updateProjectSlides(projectId: string, slides: Slide[]): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping slides update')
    return
  }

  try {
    const projectRef = doc(db!, 'projects', projectId)
    await updateDoc(projectRef, { slides })
  } catch (error) {
    console.error('Error updating project slides:', error)
    throw error
  }
}

