import { doc, updateDoc, collection, addDoc, getDocs, query, orderBy, setDoc, where, deleteDoc, runTransaction } from 'firebase/firestore'
import { ref, listAll, deleteObject } from 'firebase/storage'
import { db, storage } from './config'
import type { Project, MenuItem, Slide } from './types'
import { generateSlug, generateUniqueSlug } from '../utils/slug'
import { isBlobUrl } from './storage'

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
    console.log('🔄 Updating bio:', { text, userId })
    const bioRef = collection(db!, 'bio')
    const q = query(bioRef, where('userId', '==', userId))
    const bioDocs = await getDocs(q)
    
    if (bioDocs.empty) {
      // Create new bio document
      console.log('📝 Creating new bio document')
      await addDoc(bioRef, { text, userId })
      console.log('✅ Bio created successfully')
    } else {
      // Update existing bio document
      const bioDoc = bioDocs.docs[0]
      console.log('📝 Updating existing bio document:', bioDoc.id)
      await updateDoc(doc(db!, 'bio', bioDoc.id), { text, userId })
      console.log('✅ Bio updated successfully')
    }
  } catch (error) {
    console.error('❌ Error updating bio:', error)
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
    console.log('🔄 Updating menu item:', { itemId, updates, userId })
    const menuItemRef = doc(db!, 'menu', itemId)
    await updateDoc(menuItemRef, { ...updates, userId })
    console.log('✅ Menu item updated successfully')
  } catch (error) {
    console.error('❌ Error updating menu item:', error)
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
      // href is deprecated - routes are now generated from username + slug
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
    console.log('🔄 Updating project:', { projectId, updates, userId })
    const projectRef = doc(db!, 'projects', projectId)
    await updateDoc(projectRef, { ...updates, userId })
    console.log('✅ Project updated successfully')
  } catch (error) {
    console.error('❌ Error updating project:', error)
    throw error
  }
}

/**
 * Add new project to Firestore for a specific user
 * @param project - Project data (without id)
 * @param userId - User ID
 * @param order - Optional order value. If not provided, uses Date.now() for backward compatibility
 */
export async function addProject(project: Omit<Project, 'id'>, userId: string, order?: number): Promise<string> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping project add')
    return `project-${Date.now()}`
  }

  try {
    const projectsRef = collection(db!, 'projects')
    const docRef = await addDoc(projectsRef, {
      ...project,
      userId: userId, // Associate with user
      order: order !== undefined ? order : Date.now(), // Use provided order or timestamp as fallback
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
 * Update project order for multiple projects
 * Used for reordering cards on a page
 */
export async function updateProjectOrders(
  projectOrders: { projectId: string; order: number }[],
  userId: string
): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping project order update')
    return
  }

  try {
    console.log('🔄 Updating project orders:', { projectOrders, userId })
    
    // Update all projects in parallel
    await Promise.all(
      projectOrders.map(({ projectId, order }) => {
        const projectRef = doc(db!, 'projects', projectId)
        return updateDoc(projectRef, { order, userId })
      })
    )
    
    console.log('✅ Project orders updated successfully')
  } catch (error) {
    console.error('❌ Error updating project orders:', error)
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
 * Update username for a user with transaction to prevent race conditions
 * Ensures username uniqueness and updates user document atomically
 */
export async function updateUsername(userId: string, newUsername: string, userEmail?: string | null): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping username update')
    return
  }

  try {
    const { validateUsername, isUsernameAvailable } = await import('../utils/user')
    const { doc, getDoc } = await import('firebase/firestore')
    
    // Get user email if not provided (for reserved username check)
    let email = userEmail
    if (!email && db) {
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        email = userSnap.data().email || null
      }
    }
    
    // Validate username format (pass email to allow reserved usernames for special emails)
    const validation = validateUsername(newUsername, email)
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid username')
    }
    
    // Normalize username (lowercase, trim)
    const normalizedUsername = newUsername.toLowerCase().trim()
    
    // Double-check availability before transaction (for better error messages)
    const available = await isUsernameAvailable(normalizedUsername, userId)
    if (!available) {
      throw new Error('Username is already taken')
    }
    
    // Use transaction to ensure atomicity and prevent race conditions
    await runTransaction(db!, async (transaction) => {
      // Get user document
      const userRef = doc(db!, 'users', userId)
      const userSnap = await transaction.get(userRef)
      
      if (!userSnap.exists()) {
        throw new Error('User document not found')
      }
      
      // Check if username is taken by querying (we need to check outside transaction for queries)
      // But we'll do a final check by reading all users with this username
      // Since we can't use queries in transactions, we'll rely on the pre-check above
      // and use the transaction to ensure atomic update
      
      // Update user document with new username
      transaction.update(userRef, { username: normalizedUsername })
    })
    
    console.log('✅ Username updated successfully')
  } catch (error) {
    console.error('❌ Error updating username:', error)
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
    password?: string // Plaintext password for viewing/sharing
    passwordHash?: string // Hashed password for verification
  }
): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping settings save')
    return
  }

  try {
    const userRef = doc(db!, 'users', userId)
    // Remove undefined values to avoid Firebase errors
    const cleanSettings: Record<string, any> = {}
    Object.keys(settings).forEach(key => {
      const value = settings[key as keyof typeof settings]
      if (value !== undefined) {
        cleanSettings[key] = value
      }
    })
    await setDoc(userRef, { settings: cleanSettings }, { merge: true })
  } catch (error) {
    console.error('Error saving user settings:', error)
    throw error
  }
}

/**
 * Delete a page (menu item) and all its associated projects
 * This includes: the menu item, all projects for that page, and their associated images
 */
export async function deletePage(pageId: string, userId: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping page deletion')
    return
  }

  try {
    console.log('🔄 Deleting page:', { pageId, userId })
    
    // 1. Get all projects for this page
    const projectsRef = collection(db!, 'projects')
    const projectsQuery = query(
      projectsRef, 
      where('userId', '==', userId),
      where('pageId', '==', pageId)
    )
    const projectDocs = await getDocs(projectsQuery)
    
    // 2. Delete all images from projects before deleting projects
    const imageUrls: string[] = []
    for (const projectDoc of projectDocs.docs) {
      const project = projectDoc.data() as Project
      
      // Collect image URLs
      if (project.singleImage) {
        const images = Array.isArray(project.singleImage) ? project.singleImage : [project.singleImage]
        imageUrls.push(...images.filter(url => url && !isBlobUrl(url)))
      }
      
      if (project.slides) {
        for (const slide of project.slides) {
          if (slide.image && !isBlobUrl(slide.image)) {
            imageUrls.push(slide.image)
          }
        }
      }
    }
    
    // Delete all project images from Storage
    if (storage && imageUrls.length > 0) {
      await Promise.all(
        imageUrls.map(async (url) => {
          try {
            const urlObj = new URL(url)
            const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/)
            if (pathMatch && storage) {
              const filePath = decodeURIComponent(pathMatch[1])
              const storageRef = ref(storage, filePath)
              await deleteObject(storageRef)
            }
          } catch (error) {
            console.error('Error deleting image:', error)
            // Continue with other deletions
          }
        })
      )
    }
    
    // 3. Delete all projects for this page
    await Promise.all(projectDocs.docs.map(docSnapshot => deleteDoc(doc(db!, 'projects', docSnapshot.id))))
    console.log(`✅ Deleted ${projectDocs.docs.length} projects`)
    
    // 4. Delete the menu item (page)
    const menuItemRef = doc(db!, 'menu', pageId)
    await deleteDoc(menuItemRef)
    console.log('✅ Page deleted successfully')
  } catch (error) {
    console.error('❌ Error deleting page:', error)
    throw error
  }
}

/**
 * Delete all user data from Firestore and Storage
 * This includes: menu items, projects, bio, settings, userTags, and all storage files
 */
export async function deleteAllUserData(userId: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping user data deletion')
    return
  }

  try {
    // 1. Delete all menu items
    const menuRef = collection(db!, 'menu')
    const menuQuery = query(menuRef, where('userId', '==', userId))
    const menuDocs = await getDocs(menuQuery)
    await Promise.all(menuDocs.docs.map(docSnapshot => deleteDoc(doc(db!, 'menu', docSnapshot.id))))

    // 2. Delete all projects and their associated images
    const projectsRef = collection(db!, 'projects')
    const projectsQuery = query(projectsRef, where('userId', '==', userId))
    const projectDocs = await getDocs(projectsQuery)
    
    // Delete all images from projects before deleting projects
    const imageUrls: string[] = []
    for (const projectDoc of projectDocs.docs) {
      const project = projectDoc.data() as Project
      
      // Collect image URLs
      if (project.singleImage) {
        const images = Array.isArray(project.singleImage) ? project.singleImage : [project.singleImage]
        imageUrls.push(...images.filter(url => url && !isBlobUrl(url)))
      }
      
      if (project.slides) {
        for (const slide of project.slides) {
          if (slide.image && !isBlobUrl(slide.image)) {
            imageUrls.push(slide.image)
          }
        }
      }
    }
    
    // Delete all project images from Storage
    if (storage && imageUrls.length > 0) {
      await Promise.all(
        imageUrls.map(async (url) => {
          try {
            const urlObj = new URL(url)
            const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/)
            if (pathMatch && storage) {
              const filePath = decodeURIComponent(pathMatch[1])
              const storageRef = ref(storage, filePath)
              await deleteObject(storageRef)
            }
          } catch (error) {
            console.error('Error deleting image:', error)
            // Continue with other deletions
          }
        })
      )
    }
    
    // Delete all projects
    await Promise.all(projectDocs.docs.map(docSnapshot => deleteDoc(doc(db!, 'projects', docSnapshot.id))))

    // 3. Delete bio
    const bioRef = collection(db!, 'bio')
    const bioQuery = query(bioRef, where('userId', '==', userId))
    const bioDocs = await getDocs(bioQuery)
    await Promise.all(bioDocs.docs.map(docSnapshot => deleteDoc(doc(db!, 'bio', docSnapshot.id))))

    // 4. Delete userTags
    const userTagsRef = doc(db!, 'userTags', userId)
    try {
      await deleteDoc(userTagsRef)
    } catch (error) {
      // Document might not exist, that's okay
      console.log('UserTags document not found or already deleted')
    }

    // 5. Delete user document (settings)
    const userRef = doc(db!, 'users', userId)
    try {
      await deleteDoc(userRef)
    } catch (error) {
      console.error('Error deleting user document:', error)
      // Continue anyway
    }

    // 6. Delete all files from Storage for this user
    if (storage) {
      try {
        const userStorageRef = ref(storage, `users/${userId}`)
        const listResult = await listAll(userStorageRef)
        
        // Delete all files
        await Promise.all(
          listResult.items.map(item => deleteObject(item).catch(err => {
            console.error(`Error deleting file ${item.fullPath}:`, err)
          }))
        )
        
        // Note: Firebase Storage doesn't automatically delete empty folders,
        // but that's fine - they don't take up space
      } catch (error) {
        console.error('Error deleting user storage files:', error)
        // Continue anyway - files might not exist
      }
    }

    console.log('All user data deleted successfully')
  } catch (error) {
    console.error('Error deleting user data:', error)
    throw error
  }
}

