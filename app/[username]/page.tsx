'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getMenuItems } from '@/lib/firebase/queries'

interface UsernamePageProps {
  params: {
    username: string
  }
}

/**
 * Username route - redirects to first page or shows first page
 * This handles the /[username] route and redirects to /[username]/[slug]
 */
export default function UsernamePage({ params }: UsernamePageProps) {
  const router = useRouter()
  const { user, userData, loading } = useAuth()

  useEffect(() => {
    async function redirectToFirstPage() {
      // If user is viewing their own profile, redirect to first page in EDIT mode
      if (user && userData && userData.username === params.username) {
        try {
          const menuItems = await getMenuItems(user.uid)
          if (menuItems.length > 0) {
            const firstPageSlug = menuItems[0].slug || 'page'
            // Always redirect to edit mode for new users
            router.replace(`/${params.username}/${firstPageSlug}/edit`)
          } else {
            // No pages yet, redirect to first page creation in edit mode
            router.replace(`/${params.username}/page/edit`)
          }
        } catch (error) {
          console.error('Error loading menu items:', error)
          // Fallback to default page in edit mode
          router.replace(`/${params.username}/page/edit`)
        }
      } else {
        // Public view - try to load first page in view mode
        // TODO: Support public portfolio viewing
        router.replace(`/${params.username}/page`)
      }
    }

    if (!loading) {
      redirectToFirstPage()
    }
  }, [params.username, user, userData, loading, router])

  // Show loading state while redirecting
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div>Loading...</div>
    </div>
  )
}

