/**
 * Firebase Connection Test Script
 * Run with: npx tsx scripts/test-firebase.ts
 * Or: npm run test:firebase (if added to package.json)
 */

// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

// Load environment variables
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection...\n')

  // Check if config is provided
  const hasConfig = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId
  )

  if (!hasConfig) {
    console.log('❌ Firebase not configured!')
    console.log('\nMissing environment variables:')
    if (!firebaseConfig.apiKey) console.log('  - NEXT_PUBLIC_FIREBASE_API_KEY')
    if (!firebaseConfig.projectId) console.log('  - NEXT_PUBLIC_FIREBASE_PROJECT_ID')
    console.log('\n💡 Create a .env.local file with your Firebase config')
    console.log('   Or set environment variables before running this script')
    process.exit(1)
  }

  console.log('✅ Firebase config found!')
  console.log(`   Project ID: ${firebaseConfig.projectId}`)
  console.log(`   Auth Domain: ${firebaseConfig.authDomain}\n`)

  try {
    // Initialize Firebase
    console.log('📡 Initializing Firebase...')
    const app = initializeApp(firebaseConfig)
    console.log('✅ Firebase initialized!\n')

    // Test Firestore connection
    console.log('🗄️  Testing Firestore connection...')
    const db = getFirestore(app)

    // Try to read from menu collection
    console.log('   Reading from "menu" collection...')
    const menuRef = collection(db, 'menu')
    const menuSnapshot = await getDocs(menuRef)
    console.log(`   ✅ Found ${menuSnapshot.size} menu items`)

    // Try to read from projects collection
    console.log('   Reading from "projects" collection...')
    const projectsRef = collection(db, 'projects')
    const projectsSnapshot = await getDocs(projectsRef)
    console.log(`   ✅ Found ${projectsSnapshot.size} projects`)

    // Try to read from bio collection
    console.log('   Reading from "bio" collection...')
    const bioRef = collection(db, 'bio')
    const bioSnapshot = await getDocs(bioRef)
    console.log(`   ✅ Found ${bioSnapshot.size} bio document(s)`)

    console.log('\n🎉 Firebase connection successful!')
    console.log('\n📊 Summary:')
    console.log(`   - Menu items: ${menuSnapshot.size}`)
    console.log(`   - Projects: ${projectsSnapshot.size}`)
    console.log(`   - Bio documents: ${bioSnapshot.size}`)

    if (menuSnapshot.size === 0) {
      console.log('\n⚠️  Warning: No menu items found. Create a "menu" collection in Firestore.')
    }
    if (projectsSnapshot.size === 0) {
      console.log('⚠️  Warning: No projects found. Create a "projects" collection in Firestore.')
    }

    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Firebase connection failed!')
    console.error('\nError details:')
    console.error(`   Message: ${error.message}`)
    
    if (error.code === 'permission-denied') {
      console.error('\n💡 This might be a security rules issue.')
      console.error('   Make sure Firestore is in "test mode" or security rules allow reads.')
    } else if (error.code === 'not-found') {
      console.error('\n💡 Collections might not exist yet.')
      console.error('   Create "menu", "projects", and "bio" collections in Firestore.')
    } else {
      console.error(`   Code: ${error.code}`)
    }
    
    process.exit(1)
  }
}

// Run the test
testFirebaseConnection()

