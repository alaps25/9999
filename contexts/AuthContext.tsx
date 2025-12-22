'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User,
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  deleteUser,
  reauthenticateWithPopup,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { getUserSettings } from '@/lib/firebase/queries'
import { deleteAllUserData } from '@/lib/firebase/mutations'

interface UserData {
  uid: string
  email: string | null
  username: string // Derived from email initially, editable later
  displayName?: string | null
  photoURL?: string | null
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Extract username from email (e.g., xyz@email.com -> xyz)
 */
function extractUsernameFromEmail(email: string): string {
  return email.split('@')[0].toLowerCase()
}

/**
 * AuthProvider - Manages authentication state and user data
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if we're handling an email link sign-in or re-authentication
  useEffect(() => {
    if (!auth) return

    // Check if user is signing in via email link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const email = window.localStorage.getItem('emailForSignIn')
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem('emailForSignIn')
            await fetchOrCreateUserData(result.user)
            // If this was a re-auth link, the user is now re-authenticated
            // The settings page will detect the ?reauth=true parameter
          })
          .catch((error) => {
            console.error('Error signing in with email link:', error)
          })
      }
    }
  }, [])

  // Listen to auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        await fetchOrCreateUserData(firebaseUser)
      } else {
        setUser(null)
        setUserData(null)
        // Reset accent color to default when user signs out
        document.documentElement.style.setProperty('--accent-primary', '#000000')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  /**
   * Fetch user data from Firestore, or create if it doesn't exist
   */
  async function fetchOrCreateUserData(firebaseUser: User) {
    if (!db) return

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        // User data exists, fetch it
        const data = userDoc.data()
        setUserData({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: data.username || extractUsernameFromEmail(firebaseUser.email || ''),
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        })
      } else {
        // User data doesn't exist, create it
        const username = extractUsernameFromEmail(firebaseUser.email || '')
        const newUserData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: username,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }

        await setDoc(userDocRef, {
          username: username,
          email: firebaseUser.email,
          createdAt: new Date().toISOString(),
        })

        setUserData(newUserData)
      }

      // Load and apply user settings (accent color, etc.)
      const settings = await getUserSettings(firebaseUser.uid)
      if (settings?.accentColor) {
        document.documentElement.style.setProperty('--accent-primary', settings.accentColor)
      }
    } catch (error) {
      console.error('Error fetching/creating user data:', error)
      // Fallback: create userData from Firebase user
      setUserData({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: extractUsernameFromEmail(firebaseUser.email || ''),
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      })
    }
  }

  /**
   * Sign in with Google
   */
  async function signInWithGoogle() {
    if (!auth) {
      throw new Error('Firebase Auth is not configured')
    }

    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    await fetchOrCreateUserData(result.user)
  }

  /**
   * Send magic link to email
   */
  async function sendMagicLink(email: string) {
    if (!auth) {
      throw new Error('Firebase Auth is not configured')
    }

    const actionCodeSettings = {
      url: `${window.location.origin}/`,
      handleCodeInApp: true,
    }

    // Store email for later use
    window.localStorage.setItem('emailForSignIn', email)

    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
  }

  /**
   * Sign out
   */
  async function signOut() {
    if (!auth) return
    await firebaseSignOut(auth)
    setUser(null)
    setUserData(null)
  }

  /**
   * Re-authenticate user before sensitive operations
   */
  async function reauthenticateUser(): Promise<void> {
    if (!auth || !user) {
      throw new Error('User not authenticated')
    }

    // Check the provider
    const providerId = user.providerData[0]?.providerId

    if (providerId === 'google.com') {
      // Re-authenticate with Google
      const provider = new GoogleAuthProvider()
      await reauthenticateWithPopup(user, provider)
    } else if (providerId === 'password' || providerId === 'email') {
      // For email/password or email link authentication
      // We need to send a new email link for re-authentication
      if (!user.email) {
        throw new Error('User email not available')
      }
      
      // Send re-authentication email link
      const actionCodeSettings = {
        url: `${window.location.origin}/settings?reauth=true`,
        handleCodeInApp: true,
      }
      
      await sendSignInLinkToEmail(auth, user.email, actionCodeSettings)
      
      // Wait for user to click the link
      throw new Error('REAUTH_REQUIRED_EMAIL')
    } else {
      throw new Error(`Unsupported provider: ${providerId}`)
    }
  }

  /**
   * Delete account - deletes all user data and the Firebase Auth account
   */
  async function deleteAccount() {
    if (!auth || !user) {
      throw new Error('User not authenticated')
    }

    try {
      // 1. Delete all user data from Firestore and Storage first
      // (This doesn't require recent authentication)
      await deleteAllUserData(user.uid)

      // 2. Try to delete the Firebase Auth account
      // This requires recent authentication, so we'll handle that error
      try {
        await deleteUser(user)
      } catch (deleteError: any) {
        // If delete fails due to requires-recent-login, re-authenticate and try again
        if (deleteError.code === 'auth/requires-recent-login') {
          try {
            await reauthenticateUser()
            // After re-authentication, try deleting again
            await deleteUser(user)
          } catch (reauthError: any) {
            // If re-auth fails with email requirement, throw special error for UI
            if (reauthError.message === 'REAUTH_REQUIRED_EMAIL') {
              throw reauthError
            }
            // Otherwise, throw the re-auth error
            throw reauthError
          }
        } else {
          // Some other error occurred
          throw deleteError
        }
      }

      // 3. Clear local state
      setUser(null)
      setUserData(null)
      
      // Reset accent color
      document.documentElement.style.setProperty('--accent-primary', '#000000')
    } catch (error: any) {
      console.error('Error deleting account:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        signInWithGoogle,
        sendMagicLink,
        signOut,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

