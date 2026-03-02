'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useIsMobile } from '@/lib/hooks/useIsMobile'
import { Sidebar, MobileMenuButton } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { ProjectCard } from '@/components/content/ProjectCard'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { getPageIdBySlug, getPortfolioDataByPageId, getMenuItems, getUserSettings } from '@/lib/firebase/queries'
import { getPortfolioUrl, shareUrl } from '@/lib/utils/share'
import { getSecondaryMenuItems, getMenuItemsWithSearch } from '@/lib/utils/navigation'
import { getUserIdByUsername } from '@/lib/utils/user'
import { hasValidSession } from '@/lib/utils/session'
import { applyTheme } from '@/lib/utils/theme'
import styles from '../../page.module.scss'
import type { PortfolioData } from '@/lib/firebase/types'
import { Edit } from 'lucide-react'

interface PageProps {
  params: {
    username: string
    slug: string
  }
}

function PageContent({ username, slug }: { username: string; slug: string }) {
  const router = useRouter()
  const { user, userData, loading: authLoading } = useAuth()
  const isMobile = useIsMobile()
  const [portfolioData, setPortfolioData] = React.useState<PortfolioData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [currentPageId, setCurrentPageId] = React.useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    // Wait for auth to finish loading before running page logic
    // This prevents race condition where we check user state before auth is ready
    if (authLoading) {
      return
    }

    async function loadData() {
      try {
        // Get userId - either from current user or from username lookup
        let targetUserId: string | null = null
        
        // Check if user is viewing their own page (only after auth has loaded)
        if (user && userData && userData.username === username) {
          // User is viewing their own page - no need to check session
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
            // Only check session if user is NOT viewing their own page
            // If user is logged in and viewing their own page, they don't need a session
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
  }, [slug, username, user, userData, router, authLoading])

  const handleEditClick = () => {
    router.push(`/${username}/${slug}/edit`)
  }

  const handleShareClick = async () => {
    const portfolioUrl = getPortfolioUrl(username)
    await shareUrl(portfolioUrl, `Check out ${username}'s portfolio`)
  }

  // Wait for auth to finish loading before rendering content
  // This ensures theme is applied before navigation items are rendered
  // This fixes the issue where navigation items show darker text on first load
  if (authLoading || loading || !portfolioData) {
    return <div>Loading...</div>
  }

  // Check if there's any content
  const hasContent = !!(portfolioData.bio?.text || portfolioData.sections.length > 0)

  // Generate hrefs for menu items using username, with Search at the bottom
  // Ensure only one item is active - use the first matching item by slug
  let foundActive = false
  const baseMenuItems = userData?.username === username
    ? getMenuItemsWithSearch(portfolioData.menuItems, username)
    : portfolioData.menuItems.map(item => ({
        ...item,
        href: `/${username}/${item.slug || 'page'}`,
        isActive: false
      }))
  
  const menuItemsWithHrefs = baseMenuItems.map(item => {
    const matchesSlug = item.slug === slug
    const shouldBeActive = matchesSlug && !foundActive
    if (shouldBeActive) {
      foundActive = true
    }
    return {
      ...item,
      isActive: shouldBeActive,
    }
  })

  // Secondary menu items - show all for logged-in users viewing their own page
  const secondaryMenuItems = userData?.username === username 
    ? getSecondaryMenuItems(handleShareClick)
    : [
    { id: 'share', label: 'SHARE', onClick: handleShareClick },
  ]

  return (
    <div className={styles.page}>
      <Sidebar 
        menuItems={menuItemsWithHrefs} 
        secondaryMenuItems={secondaryMenuItems}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={setMobileMenuOpen}
      />
      <MainContent>
        {/* Page Header Row */}
        {userData?.username === username && (
          <div className={styles.pageHeaderRow}>
            <div className={styles.pageName}>
              {portfolioData.menuItems.find(item => item.id === currentPageId)?.label || 'untitled'}
            </div>
            {isMobile ? (
              <MobileMenuButton 
                isOpen={mobileMenuOpen} 
                onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                menuItems={menuItemsWithHrefs}
                secondaryMenuItems={secondaryMenuItems}
              />
            ) : (
              <Button
                variant="medium"
                size="md"
                onClick={handleEditClick}
              >
                <Edit size={16} />
                EDIT
              </Button>
            )}
          </div>
        )}

        {/* Projects Section */}
        <div className={styles.projectsSection}>
          {/* Show default add button when there's no content */}
          {!hasContent && (
            <div className={styles.emptyStateCard}>
                No content yet. Click EDIT to add content.
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

