/**
 * Firebase Admin SDK initialization
 * Used for server-side operations like updating user custom claims
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let adminApp: App | null = null

/**
 * Initialize Firebase Admin SDK
 */
export function initializeAdmin(): App {
  if (adminApp) {
    return adminApp
  }

  // Check if already initialized
  const existingApps = getApps()
  if (existingApps.length > 0) {
    adminApp = existingApps[0]
    return adminApp
  }

  // Check for service account key or use default credentials
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (serviceAccountKey) {
    // Parse JSON service account key
    try {
      // Handle both single-line JSON and multi-line JSON
      // Remove any leading/trailing whitespace and newlines
      const cleanedKey = serviceAccountKey.trim().replace(/\\n/g, '\n')
      const serviceAccount = JSON.parse(cleanedKey)
      
      // Validate required fields
      if (!serviceAccount.type || !serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error('Service account key missing required fields: type, project_id, private_key, or client_email')
      }
      
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      })
    } catch (error: any) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error.message)
      console.error('Make sure FIREBASE_SERVICE_ACCOUNT_KEY is valid JSON. If using a file path, use GOOGLE_APPLICATION_CREDENTIALS instead.')
      throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_KEY format: ${error.message}`)
    }
  } else {
    // Try to use Application Default Credentials (for Vercel/Cloud environments)
    // This requires GOOGLE_APPLICATION_CREDENTIALS or default credentials
    try {
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      })
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error)
      throw new Error(
        'Firebase Admin initialization failed. Set FIREBASE_SERVICE_ACCOUNT_KEY or configure Application Default Credentials.'
      )
    }
  }

  return adminApp
}

/**
 * Get Firestore instance (Admin SDK)
 */
export function getAdminFirestore() {
  const app = initializeAdmin()
  return getFirestore(app)
}

/**
 * Get Auth instance (Admin SDK)
 */
export function getAdminAuth() {
  const app = initializeAdmin()
  return getAuth(app)
}
