'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { ProjectCard } from '@/components/content/ProjectCard'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { getPageIdBySlug, getPortfolioDataByPageId, getMenuItems, getUserSettings } from '@/lib/firebase/queries'
import { deletePage } from '@/lib/firebase/mutations'
import { getPortfolioUrl, shareUrl } from '@/lib/utils/share'
import { getUserIdByUsername } from '@/lib/utils/user'
import { hasValidSession } from '@/lib/utils/session'
import { applyTheme } from '@/lib/utils/theme'
import styles from '../../page.module.scss'
import type { PortfolioData } from '@/lib/firebase/types'
import { Edit, Trash2 } from 'lucide-react'

interface PageProps {
  params: {
    username: string
    slug: string
  }
}

function PageContent({ username, slug }: { username: string; slug: string }) {
  const router = useRouter()
  const { user, userData } = useAuth()
  const [portfolioData, setPortfolioData] = React.useState<PortfolioData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [currentPageId, setCurrentPageId] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadData() {
      try {
        // Get userId - either from current user or from username lookup
        let targetUserId: string | null = null
        
        if (user && userData && userData.username === username) {
          // User is viewing their own page
          targetUserId = user.uid
        } else {
          // User is viewing someone else's page - need to check visibility
          targetUserId = await getUserIdByUsername(username)
          
          if (!targetUserId) {
            console.error('User not found for username:', username)
            setLoading(false)
            return
          }
          
          // Check if page is private and apply owner's settings
          const settings = await getUserSettings(targetUserId)
          if (settings?.visibility === 'PRIVATE') {
            // Check if user has valid session
            if (!hasValidSession(targetUserId)) {
              // Redirect to unlock page
              router.push(`/${username}/unlock?redirect=${encodeURIComponent(`/${username}/${slug}`)}`)
              setLoading(false) // Set loading to false before redirect
              return
            }
          }
          
          // Apply owner's settings (accent color, theme, rounded corners) for public viewers
          if (settings) {
            const accentColor = settings.accentColor || '#000000'
            const theme = (settings.theme || 'AUTO') as 'AUTO' | 'LIGHT' | 'DARK'
            
            // Apply theme (includes accent color and theme mode)
            applyTheme(theme, accentColor)
            
            if (settings.roundedCorners) {
              // Cap rounded corners at 48px max
              const numValue = parseInt(settings.roundedCorners, 10)
              const cappedValue = isNaN(numValue) ? 0 : Math.min(Math.max(numValue, 0), 48)
              document.documentElement.style.setProperty('--border-radius', `${cappedValue}px`)
            } else {
              // Reset to 0 if no rounded corners setting
              document.documentElement.style.setProperty('--border-radius', '0px')
            }
          }
        }
        // Note: If user is viewing their own page, settings are already applied by AuthContext

        if (!targetUserId) {
          setLoading(false)
          return
        }

        // Get pageId from slug
        const pageId = await getPageIdBySlug(slug, targetUserId)
        
        if (!pageId) {
          console.error('Page not found for slug:', slug)
          setLoading(false)
          return
        }

        setCurrentPageId(pageId)

        // Load portfolio data using pageId (optimized query)
        const data = await getPortfolioDataByPageId(pageId, targetUserId)
        setPortfolioData(data)
      } catch (error) {
        console.error('Error loading portfolio data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug, username, user, userData, router])

  const handleEditClick = () => {
    router.push(`/${username}/${slug}/edit`)
  }

  const handleDeletePage = async () => {
    if (!currentPageId || !user) return

    // Double confirmation
    const confirmed = window.confirm(
      'Are you sure you want to delete this page?\n\n' +
      'This will permanently delete:\n' +
      '• This page\n' +
      '• All projects on this page\n' +
      '• All images on this page\n\n' +
      'This action cannot be undone. Type DELETE to confirm.'
    )

    if (!confirmed) return

    const finalConfirmation = window.prompt(
      'This will permanently delete this page and all its content. Type "DELETE" to confirm:'
    )

    if (finalConfirmation !== 'DELETE') {
      return
    }

    try {
      await deletePage(currentPageId, user.uid)
      
      // Redirect to first page or home
      const menuItems = await getMenuItems(user.uid)
      if (menuItems.length > 0) {
        const firstPageSlug = menuItems[0].slug || 'page'
        router.push(`/${username}/${firstPageSlug}`)
      } else {
        router.push(`/${username}/page`)
      }
    } catch (error) {
      console.error('Error deleting page:', error)
      alert('Failed to delete page. Please try again.')
    }
  }

  const handleShareClick = async () => {
    const portfolioUrl = getPortfolioUrl(username)
    await shareUrl(portfolioUrl, `Check out ${username}'s portfolio`)
  }

  if (loading || !portfolioData) {
    return <div>Loading...</div>
  }

  // Check if there's any content
  const hasContent = !!(portfolioData.bio?.text || portfolioData.sections.length > 0)

  // Generate hrefs for menu items using username
  // Ensure only one item is active - use the first matching item by slug
  let foundActive = false
  const menuItemsWithHrefs = portfolioData.menuItems.map(item => {
    const matchesSlug = item.slug === slug
    const shouldBeActive = matchesSlug && !foundActive
    if (shouldBeActive) {
      foundActive = true
    }
    return {
      ...item,
      href: `/${username}/${item.slug || 'page'}`,
      isActive: shouldBeActive,
    }
  })

  // Secondary menu items (SHARE and SETTINGS)
  // Only show SETTINGS if user is viewing their own page
  const secondaryMenuItems = [
    { id: 'share', label: 'SHARE', onClick: handleShareClick },
    ...(userData?.username === username ? [{ id: 'settings', label: 'SETTINGS', href: '/settings' }] : []),
  ]

  return (
    <div className={styles.page}>
      <Sidebar menuItems={menuItemsWithHrefs} secondaryMenuItems={secondaryMenuItems} />
      <MainContent>
        {/* Page Name and Action Buttons Row - Only show if user owns this page */}
        {userData?.username === username && (
          <div className={styles.pageHeaderRow}>
            <div className={styles.pageName}>
              {portfolioData.menuItems.find(item => item.id === currentPageId)?.label || 'untitled'}
            </div>
            <Button
              variant="medium"
              size="md"
              onClick={handleEditClick}
            >
              <Edit size={16} />
              EDIT
            </Button>
            <Button
              variant="medium"
              size="md"
              onClick={handleDeletePage}
            >
              <Trash2 size={16} />
              DELETE
            </Button>
          </div>
        )}

        {/* Projects Section */}
        <div className={styles.projectsSection}>
          {/* Show default add button when there's no content */}
          {!hasContent && (
            <div className={styles.addProjectButton}>
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                No content yet. Click EDIT to add content.
              </div>
            </div>
          )}

          {/* Bio Section as ProjectCard variant */}
          {portfolioData.bio && (
            <ProjectCard variant="bio" bioText={portfolioData.bio.text} />
          )}
          
          {portfolioData.sections.map((section) => {
            if (section.type === 'project' && section.project) {
              // Detect media card: no title, no description, only single image, no tags
              const isMediaCard = !section.project.content?.showTitle && 
                                  !section.project.content?.showDescription && 
                                  section.project.content?.showSingleImage && 
                                  !section.project.content?.showSlides && 
                                  !section.project.content?.showPhotoCarousel &&
                                  !section.project.content?.showTags
              
              return (
                <ProjectCard 
                  key={section.id} 
                  project={section.project}
                  noPadding={isMediaCard}
                />
              )
            }
            return null
          })}
        </div>
      </MainContent>
    </div>
  )
}

export default function Page({ params }: PageProps) {
  // View mode should be public - no ProtectedRoute wrapper
  // The top row with Edit/Delete buttons is already protected by checking userData?.username === username
  return <PageContent username={params.username} slug={params.slug} />
}

