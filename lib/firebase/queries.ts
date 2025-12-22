import { collection, getDocs, doc, getDoc, query, orderBy, setDoc, where } from 'firebase/firestore'
import { db } from './config'
import type { PortfolioData, Project, MenuItem } from './types'
import { generateSlug, generateUniqueSlug } from '../utils/slug'

/**
 * Check if Firebase is configured
 */
function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )
}

/**
 * Fetch all menu items from Firestore for a specific user
 * Ensures at least one default menu item exists
 */
export async function getMenuItems(userId?: string): Promise<MenuItem[]> {
  if (!isFirebaseConfigured() || !db) {
    console.log('Firebase not configured, returning default menu item')
    return [{
      id: 'default',
      label: 'PAGE',
      href: '/',
      isActive: true,
    }]
  }

  try {
    const menuRef = collection(db, 'menu')
    let q = query(menuRef, orderBy('order', 'asc'))
    
    // Filter by userId if provided
    if (userId) {
      q = query(menuRef, where('userId', '==', userId), orderBy('order', 'asc'))
    }
    
    const querySnapshot = await getDocs(q)
    
    let items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[]
    
    // Deduplicate: If multiple items have the same slug, keep only the first one (by order)
    // This prevents showing duplicate menu items and removes them from the database
    if (items.length > 1 && userId) {
      const seenSlugs = new Map<string, MenuItem>()
      const duplicatesToRemove: string[] = []
      
      // Sort by order to keep the first one
      const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0))
      
      for (const item of sortedItems) {
        const slug = item.slug || 'page'
        if (seenSlugs.has(slug)) {
          // Duplicate found, mark for removal
          duplicatesToRemove.push(item.id)
        } else {
          seenSlugs.set(slug, item)
        }
      }
      
      // Remove duplicates from database
      if (duplicatesToRemove.length > 0) {
        console.warn(`Found ${duplicatesToRemove.length} duplicate menu items with same slugs. Removing them from database.`)
        const { deleteDoc, doc: docFn } = await import('firebase/firestore')
        const dbInstance = db!
        await Promise.all(
          duplicatesToRemove.map(itemId => deleteDoc(docFn(dbInstance, 'menu', itemId)))
        )
        // Filter them out from the returned array
        items = items.filter(item => !duplicatesToRemove.includes(item.id))
      }
    }
    
    // Ensure at least one menu item exists for the user
    // Check again after getting items to prevent race conditions
    if (items.length === 0 && userId) {
      // Double-check: query again to make sure no item was created by another call
      const doubleCheckQuery = query(menuRef, where('userId', '==', userId))
      const doubleCheckSnapshot = await getDocs(doubleCheckQuery)
      
      if (doubleCheckSnapshot.empty) {
        // Create default menu item with slug-based URL
        const { addDoc } = await import('firebase/firestore')
        const defaultSlug = 'page' // Default slug for first page
        const defaultItem = {
          label: 'PAGE',
          slug: defaultSlug,
          order: 0,
          userId: userId, // Associate with the current user
        }
        const docRef = await addDoc(menuRef, defaultItem)
        return [{
          id: docRef.id,
          ...defaultItem,
          href: `/${defaultSlug}`, // Keep href for backward compatibility
        }]
      } else {
        // Another call created the item, return it
        const createdItems = doubleCheckSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MenuItem[]
        return createdItems.sort((a, b) => (a.order || 0) - (b.order || 0))
      }
    }
    
    // Ensure all items have slugs - generate from label if missing
    if (!db) {
      return items
    }
    
    const { updateDoc, doc: docFn } = await import('firebase/firestore')
    // Build existing slugs list BEFORE processing to avoid duplicates
    const existingSlugs = items.map(item => item.slug).filter(Boolean) as string[]
    const dbInstance = db // Store in local variable for TypeScript
    const slugsToAdd: string[] = [] // Track slugs we're adding in this batch
    
    const updatedItems = await Promise.all(
      items.map(async (item, index) => {
        if (!item.slug) {
          // Generate slug from label, ensuring uniqueness
          const slug = index === 0 && item.label.toUpperCase() === 'PAGE' 
            ? 'page' // First item with "PAGE" label gets "page" slug
            : generateUniqueSlug(item.label, [...existingSlugs, ...slugsToAdd])
          
          slugsToAdd.push(slug)
          
          // Update in database
          await updateDoc(docFn(dbInstance, 'menu', item.id), {
            slug: slug,
            href: `/${slug}`, // Update href to match slug
          })
          return { ...item, slug, href: `/${slug}` }
        }
        // Update href to match slug if it doesn't match (deprecated, but keep for backward compat)
        if (!item.href || item.href !== `/${item.slug}`) {
          await updateDoc(docFn(dbInstance, 'menu', item.id), {
            href: `/${item.slug}`,
          })
          return { ...item, href: `/${item.slug}` }
        }
        return item
      })
    )
    
    return updatedItems
  } catch (error) {
    console.error('Error fetching menu items:', error)
    // Return default item on error
    return [{
      id: 'default',
      label: 'PAGE',
      href: '/',
      isActive: true,
    }]
  }
}

/**
 * Fetch all projects from Firestore for a specific user
 */
export async function getProjects(userId?: string): Promise<Project[]> {
  if (!isFirebaseConfigured() || !db) {
    return []
  }

  try {
    const projectsRef = collection(db, 'projects')
    let q = query(projectsRef, orderBy('order', 'asc'))
    
    // Filter by userId if provided
    if (userId) {
      q = query(projectsRef, where('userId', '==', userId), orderBy('order', 'asc'))
    }
    
    const querySnapshot = await getDocs(q)
    
    const projects = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[]
    
    return projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

/**
 * Fetch a single project by ID
 */
export async function getProject(id: string): Promise<Project | null> {
  if (!isFirebaseConfigured() || !db) {
    return null
  }

  try {
    const projectRef = doc(db, 'projects', id)
    const projectSnap = await getDoc(projectRef)
    
    if (projectSnap.exists()) {
      return {
        id: projectSnap.id,
        ...projectSnap.data(),
      } as Project
    }
    return null
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

/**
 * Fetch bio data from Firestore for a specific user
 */
export async function getBio(userId?: string): Promise<{ text: string } | null> {
  if (!isFirebaseConfigured() || !db) {
    return null
  }

  try {
    const bioRef = collection(db, 'bio')
    let q = query(bioRef)
    
    // Filter by userId if provided
    if (userId) {
      q = query(bioRef, where('userId', '==', userId))
    }
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const bioDoc = querySnapshot.docs[0]
      return bioDoc.data() as { text: string }
    }
    return null
  } catch (error) {
    console.error('Error fetching bio:', error)
    return null
  }
}

/**
 * Get page ID (menu item ID) by slug for a specific user
 * Returns the pageId if found, null otherwise
 */
export async function getPageIdBySlug(slug: string, userId: string): Promise<string | null> {
  if (!isFirebaseConfigured() || !db) {
    return null
  }

  try {
    const menuItems = await getMenuItems(userId)
    const pageMenuItem = menuItems.find(item => item.slug === slug)
    return pageMenuItem?.id || null
  } catch (error) {
    console.error('Error fetching page ID by slug:', error)
    return null
  }
}

/**
 * Fetch projects for a specific page (filtered by pageId)
 * More efficient than loading all projects and filtering
 */
export async function getProjectsByPageId(pageId: string, userId: string): Promise<Project[]> {
  if (!isFirebaseConfigured() || !db) {
    return []
  }

  try {
    const projectsRef = collection(db, 'projects')
    const q = query(
      projectsRef,
      where('userId', '==', userId),
      where('pageId', '==', pageId),
      orderBy('order', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    
    const projects = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[]
    
    return projects
  } catch (error) {
    console.error('Error fetching projects by pageId:', error)
    return []
  }
}

/**
 * Fetch portfolio data (menu items, sections, and bio) for a specific page
 * Uses pageId as the source of truth for better performance and reliability
 */
export async function getPortfolioDataByPageId(pageId: string, userId: string): Promise<PortfolioData> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, returning empty portfolio data')
    return {
      menuItems: [],
      sections: [],
      bio: undefined,
    }
  }

  try {
    // Load menu items, projects for this page, and bio in parallel
    const [menuItems, projects, bio] = await Promise.all([
      getMenuItems(userId),
      getProjectsByPageId(pageId, userId),
      getBio(userId),
    ])

    const sections = projects.map((project) => ({
      id: project.id,
      type: 'project' as const,
      project,
    }))

    return {
      menuItems,
      sections,
      bio: bio || undefined,
    }
  } catch (error) {
    console.error('Error fetching portfolio data by pageId:', error)
    return {
      menuItems: [],
      sections: [],
      bio: undefined,
    }
  }
}

/**
 * Fetch portfolio data (menu items, sections, and bio) for a specific user
 * Optionally filter by page slug (legacy function for backward compatibility)
 * @deprecated Use getPortfolioDataByPageId instead for better performance
 */
export async function getPortfolioData(pageSlug?: string, userId?: string): Promise<PortfolioData> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, returning empty portfolio data')
    return {
      menuItems: [],
      sections: [],
      bio: undefined,
    }
  }

  if (!userId) {
    return {
      menuItems: [],
      sections: [],
      bio: undefined,
    }
  }

  try {
    // If slug provided, get pageId first, then load data
    if (pageSlug) {
      const pageId = await getPageIdBySlug(pageSlug, userId)
      if (pageId) {
        return getPortfolioDataByPageId(pageId, userId)
      }
      // If page not found, return empty data
      const menuItems = await getMenuItems(userId)
      return {
        menuItems,
        sections: [],
        bio: undefined,
      }
    }

    // If no slug provided, use first page
    const menuItems = await getMenuItems(userId)
    if (menuItems.length > 0) {
      const firstPageId = menuItems[0].id
      return getPortfolioDataByPageId(firstPageId, userId)
    }

    return {
      menuItems: [],
      sections: [],
      bio: undefined,
    }
  } catch (error) {
    console.error('Error fetching portfolio data:', error)
    return {
      menuItems: [],
      sections: [],
      bio: undefined,
    }
  }
}

/**
 * Get user tags from Firestore
 * Returns array of tag strings for the user
 */
export async function getUserTags(userId: string): Promise<string[]> {
  if (!isFirebaseConfigured() || !db) {
    console.log('Firebase not configured, returning empty tags')
    return []
  }

  try {
    const userTagsRef = doc(db, 'userTags', userId)
    const userTagsSnap = await getDoc(userTagsRef)
    
    if (userTagsSnap.exists()) {
      const data = userTagsSnap.data()
      return data.tags || []
    }
    return []
  } catch (error) {
    console.error('Error fetching user tags:', error)
    return []
  }
}

/**
 * Get user settings from Firestore
 * Returns user settings (accent color, rounded corners, theme, visibility)
 */
export async function getUserSettings(userId: string): Promise<{
  accentColor?: string
  roundedCorners?: string
  theme?: string
  visibility?: string
} | null> {
  if (!isFirebaseConfigured() || !db) {
    console.log('Firebase not configured, returning null settings')
    return null
  }

  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const data = userSnap.data()
      return data.settings || null
    }
    return null
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return null
  }
}

