import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore'
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
 * Fetch all menu items from Firestore
 * Ensures at least one default menu item exists
 */
export async function getMenuItems(): Promise<MenuItem[]> {
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
    const q = query(menuRef, orderBy('order', 'asc'))
    const querySnapshot = await getDocs(q)
    
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[]
    
    // Ensure at least one menu item exists
    if (items.length === 0) {
      // Create default menu item with slug-based URL
      const { addDoc, updateDoc, doc: docFn } = await import('firebase/firestore')
      const defaultSlug = 'page' // Default slug for first page
      const defaultItem = {
        label: 'PAGE',
        slug: defaultSlug,
        order: 0,
      }
      const docRef = await addDoc(menuRef, defaultItem)
      return [{
        id: docRef.id,
        ...defaultItem,
        href: `/${defaultSlug}`, // Keep href for backward compatibility
      }]
    }
    
    // Ensure all items have slugs - generate from label if missing
    if (!db) {
      return items
    }
    
    const { updateDoc, doc: docFn } = await import('firebase/firestore')
    const existingSlugs = items.map(item => item.slug).filter(Boolean) as string[]
    const dbInstance = db // Store in local variable for TypeScript
    const updatedItems = await Promise.all(
      items.map(async (item, index) => {
        if (!item.slug) {
          // Generate slug from label
          const slug = index === 0 && item.label.toUpperCase() === 'PAGE' 
            ? 'page' // First item with "PAGE" label gets "page" slug
            : generateUniqueSlug(item.label, existingSlugs)
          
          existingSlugs.push(slug)
          
          // Update in database
          await updateDoc(docFn(dbInstance, 'menu', item.id), {
            slug: slug,
            href: `/${slug}`, // Update href to match slug
          })
          return { ...item, slug, href: `/${slug}` }
        }
        // Update href to match slug if it doesn't match
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
 * Fetch all projects from Firestore
 * Falls back to mock data if Firebase is not configured
 */
export async function getProjects(): Promise<Project[]> {
  if (!isFirebaseConfigured() || !db) {
    return []
  }

  try {
    const projectsRef = collection(db, 'projects')
    const q = query(projectsRef, orderBy('order', 'asc'))
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
 * Fetch bio data from Firestore
 * Falls back to mock data if Firebase is not configured
 */
export async function getBio(): Promise<{ text: string } | null> {
  if (!isFirebaseConfigured() || !db) {
    return null
  }

  try {
    const bioRef = collection(db, 'bio')
    const querySnapshot = await getDocs(bioRef)
    
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
 * Fetch portfolio data (menu items, sections, and bio)
 * Optionally filter by page slug
 */
export async function getPortfolioData(pageSlug?: string): Promise<PortfolioData> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, returning empty portfolio data')
    return {
      menuItems: [],
      sections: [],
      bio: undefined,
    }
  }

  try {
    const [menuItems, allProjects, bio] = await Promise.all([
      getMenuItems(),
      getProjects(),
      getBio(),
    ])

    // Filter projects by page - pageSlug is the menu item slug (e.g., "page")
    // Find the menu item by slug to get its ID
    let pageId: string | undefined
    
    if (pageSlug) {
      // Find menu item by slug
      const pageMenuItem = menuItems.find(item => item.slug === pageSlug)
      pageId = pageMenuItem?.id
    } else if (menuItems.length > 0) {
      // Fallback: use first menu item if no slug provided
      pageId = menuItems[0].id
    }

    // Filter projects by pageId - always require pageId
    const projects = pageId 
      ? allProjects.filter(p => p.pageId === pageId)
      : [] // If no pageId found, return empty array

    const sections = projects.map((project) => ({
      id: project.id,
      type: 'project' as const,
      project,
    }))

    return {
      menuItems,
      sections,
      bio: bio || undefined, // Convert null to undefined
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

