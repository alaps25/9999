'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getMenuItems } from '@/lib/firebase/queries'
import { getUserIdByUsername } from '@/lib/utils/user'

interface UsernamePageProps {
  params: {
    username: string
  }
}

/**
 * Username route - redirects to first page (respecting page order)
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
            router.replace(`/${params.username}/${firstPageSlug}/edit`)
          } else {
            router.replace(`/${params.username}/page/edit`)
          }
        } catch (error) {
          console.error('Error loading menu items:', error)
          router.replace(`/${params.username}/page/edit`)
        }
      } else {
        // Public view - look up user's pages and redirect to first one by order
        try {
          const targetUserId = await getUserIdByUsername(params.username)
          if (targetUserId) {
            const menuItems = await getMenuItems(targetUserId)
            if (menuItems.length > 0) {
              const firstPageSlug = menuItems[0].slug || 'page'
              router.replace(`/${params.username}/${firstPageSlug}`)
            } else {
              router.replace(`/${params.username}/page`)
            }
          } else {
            router.replace(`/${params.username}/page`)
          }
        } catch (error) {
          console.error('Error loading public menu items:', error)
          router.replace(`/${params.username}/page`)
        }
      }
    }

    if (!loading) {
      redirectToFirstPage()
    }
  }, [params.username, user, userData, loading, router])

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div>Loading...</div>
    </div>
  )
}

