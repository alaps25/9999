import { doc, updateDoc, collection, addDoc, getDocs, query, orderBy, setDoc, where, deleteDoc } from 'firebase/firestore'
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
 * Update bio text in Firestore for a specific user
 */
export async function updateBio(text: string, userId: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping bio update')
    return
  }

  try {
    const bioRef = collection(db!, 'bio')
    const q = query(bioRef, where('userId', '==', userId))
    const bioDocs = await getDocs(q)
    
    if (bioDocs.empty) {
      // Create new bio document
      await addDoc(bioRef, { text, userId })
    } else {
      // Update existing bio document
      const bioDoc = bioDocs.docs[0]
      await updateDoc(doc(db!, 'bio', bioDoc.id), { text, userId })
    }
  } catch (error) {
    console.error('Error updating bio:', error)
    throw error
  }
}

/**
 * Update menu item in Firestore for a specific user
 */
export async function updateMenuItem(itemId: string, updates: Partial<MenuItem>, userId: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping menu item update')
    return
  }

  try {
    const menuItemRef = doc(db!, 'menu', itemId)
    await updateDoc(menuItemRef, { ...updates, userId })
  } catch (error) {
    console.error('Error updating menu item:', error)
    throw error
  }
}

/**
 * Add new menu item to Firestore for a specific user
 * Automatically generates slug from label and sets href
 */
export async function addMenuItem(item: Omit<MenuItem, 'id'>, userId: string): Promise<string> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping menu item add')
    return `menu-${Date.now()}`
  }

  try {
    // Get existing slugs to ensure uniqueness (for this user)
    const menuRef = collection(db!, 'menu')
    const q = query(menuRef, where('userId', '==', userId), orderBy('order', 'asc'))
    const existingItems = await getDocs(q)
    const existingSlugs = existingItems.docs
      .map(doc => doc.data().slug)
      .filter(Boolean) as string[]
    
    // Generate slug from label
    const slug = item.slug || generateUniqueSlug(item.label, existingSlugs)
    
    const docRef = await addDoc(menuRef, {
      ...item,
      slug: slug,
      userId: userId, // Associate with user
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
 * Update project in Firestore for a specific user
 */
export async function updateProject(projectId: string, updates: Partial<Project>, userId: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping project update')
    return
  }

  try {
    const projectRef = doc(db!, 'projects', projectId)
    await updateDoc(projectRef, { ...updates, userId })
  } catch (error) {
    console.error('Error updating project:', error)
    throw error
  }
}

/**
 * Add new project to Firestore for a specific user
 */
export async function addProject(project: Omit<Project, 'id'>, userId: string): Promise<string> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping project add')
    return `project-${Date.now()}`
  }

  try {
    const projectsRef = collection(db!, 'projects')
    const docRef = await addDoc(projectsRef, {
      ...project,
      userId: userId, // Associate with user
      order: Date.now(), // Use timestamp as order
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding project:', error)
    throw error
  }
}

/**
 * Update project slides in Firestore for a specific user
 */
export async function updateProjectSlides(projectId: string, slides: Slide[], userId: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping slides update')
    return
  }

  try {
    const projectRef = doc(db!, 'projects', projectId)
    await updateDoc(projectRef, { slides, userId })
  } catch (error) {
    console.error('Error updating project slides:', error)
    throw error
  }
}

/**
 * Delete project from Firestore
 */
export async function deleteProject(projectId: string, userId: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping project delete')
    return
  }

  try {
    const projectRef = doc(db!, 'projects', projectId)
    await deleteDoc(projectRef)
  } catch (error) {
    console.error('Error deleting project:', error)
    throw error
  }
}

/**
 * Save user tags to Firestore
 * Creates or updates the userTags document for the user
 */
export async function saveUserTags(userId: string, tags: string[]): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping tag save')
    return
  }

  try {
    const userTagsRef = doc(db!, 'userTags', userId)
    await setDoc(userTagsRef, { tags }, { merge: true })
  } catch (error) {
    console.error('Error saving user tags:', error)
    throw error
  }
}

/**
 * Save user settings (accent color, rounded corners, theme, visibility) to Firestore
 * Stores settings in the user's document
 */
export async function saveUserSettings(
  userId: string,
  settings: {
    accentColor?: string
    roundedCorners?: string
    theme?: string
    visibility?: string
  }
): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping settings save')
    return
  }

  try {
    const userRef = doc(db!, 'users', userId)
    await setDoc(userRef, { settings }, { merge: true })
  } catch (error) {
    console.error('Error saving user settings:', error)
    throw error
  }
}

