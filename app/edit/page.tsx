'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getMenuItems } from '@/lib/firebase/queries'

export default function EditPage() {
  const router = useRouter()
  const { user, userData, loading } = useAuth()

  useEffect(() => {
    async function redirectToFirstPageEdit() {
      if (!loading && user && userData) {
        try {
          const menuItems = await getMenuItems(user.uid)
          if (menuItems.length > 0) {
            const firstPageSlug = menuItems[0].slug || 'page'
            router.replace(`/${userData.username}/${firstPageSlug}/edit`)
          } else {
            // No pages yet, redirect to username page
            router.replace(`/${userData.username}`)
          }
        } catch (error) {
          console.error('Error loading menu items:', error)
          router.replace(`/${userData.username}`)
        }
      } else if (!loading && !user) {
        // Not authenticated, redirect to home
        router.replace('/')
      }
    }

    redirectToFirstPageEdit()
  }, [user, userData, loading, router])

  // Show loading state while redirecting
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div>Loading...</div>
    </div>
  )
}
