import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore'
import { db } from './config'
import type { PortfolioData, Project, MenuItem } from './types'
import { mockPortfolioData, mockMenuItems, mockProjects, mockBio } from '../mockData'

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
 * Falls back to mock data if Firebase is not configured
 */
export async function getMenuItems(): Promise<MenuItem[]> {
  if (!isFirebaseConfigured() || !db) {
    console.log('Firebase not configured, using mock data')
    return mockMenuItems
  }

  try {
    const menuRef = collection(db, 'menu')
    const q = query(menuRef, orderBy('order', 'asc'))
    const querySnapshot = await getDocs(q)
    
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[]
    
    // Fallback to mock data if no items found
    return items.length > 0 ? items : mockMenuItems
  } catch (error) {
    console.error('Error fetching menu items, using mock data:', error)
    return mockMenuItems
  }
}

/**
 * Fetch all projects from Firestore
 * Falls back to mock data if Firebase is not configured
 */
export async function getProjects(): Promise<Project[]> {
  if (!isFirebaseConfigured() || !db) {
    return mockProjects
  }

  try {
    const projectsRef = collection(db, 'projects')
    const q = query(projectsRef, orderBy('order', 'asc'))
    const querySnapshot = await getDocs(q)
    
    const projects = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[]
    
    // Fallback to mock data if no projects found
    return projects.length > 0 ? projects : mockProjects
  } catch (error) {
    console.error('Error fetching projects, using mock data:', error)
    return mockProjects
  }
}

/**
 * Fetch a single project by ID
 */
export async function getProject(id: string): Promise<Project | null> {
  if (!isFirebaseConfigured() || !db) {
    return mockProjects.find(p => p.id === id) || null
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
    return mockBio
  }

  try {
    const bioRef = collection(db, 'bio')
    const querySnapshot = await getDocs(bioRef)
    
    if (!querySnapshot.empty) {
      const bioDoc = querySnapshot.docs[0]
      return bioDoc.data() as { text: string }
    }
    return mockBio
  } catch (error) {
    console.error('Error fetching bio, using mock data:', error)
    return mockBio
  }
}

/**
 * Fetch portfolio data (menu items, sections, and bio)
 * Falls back to mock data if Firebase is not configured
 */
export async function getPortfolioData(): Promise<PortfolioData> {
  if (!isFirebaseConfigured()) {
    console.log('Using mock portfolio data')
    return mockPortfolioData
  }

  try {
    const [menuItems, projects, bio] = await Promise.all([
      getMenuItems(),
      getProjects(),
      getBio(),
    ])

    const sections = projects.map((project) => ({
      id: project.id,
      type: 'project' as const,
      project,
    }))

    return {
      menuItems: menuItems.length > 0 ? menuItems : mockMenuItems,
      sections: sections.length > 0 ? sections : mockPortfolioData.sections,
      bio: bio || mockBio,
    }
  } catch (error) {
    console.error('Error fetching portfolio data, using mock data:', error)
    return mockPortfolioData
  }
}

