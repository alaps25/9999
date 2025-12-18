'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { ProjectCard } from '@/components/content/ProjectCard'
import { Dropdown } from '@/components/ui/Dropdown'
import { getPortfolioData } from '@/lib/firebase/queries'
import styles from '../page.module.scss'
import type { PortfolioData } from '@/lib/firebase/types'

interface PageProps {
  params: {
    slug: string // This is now the menu item ID (pageId) or username
  }
}

function PageContent({ slug }: { slug: string }) {
  const { user } = useAuth()
  const [portfolioData, setPortfolioData] = React.useState<PortfolioData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        // First, try to load data with the slug as-is (in case it's a page slug)
        let data = await getPortfolioData(slug, user.uid)
        
        // If no content found and slug might be a username, try loading first page
        if ((!data.sections.length && !data.bio) && data.menuItems.length > 0) {
          // Slug doesn't match any page, use first page instead
          const firstPageSlug = data.menuItems[0].slug || 'page'
          data = await getPortfolioData(firstPageSlug, user.uid)
        }
        
        setPortfolioData(data)
      } catch (error) {
        console.error('Error loading portfolio data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug, user])

  if (loading || !portfolioData) {
    return <div>Loading...</div>
  }

  // Check if there's any content
  const hasContent = !!(portfolioData.bio?.text || portfolioData.sections.length > 0)

  // Insert options for the default add button
  const insertOptions = [
    { 
      label: 'V Card', 
      value: 'v-card'
    },
    { 
      label: 'H Card', 
      value: 'h-card'
    },
    { 
      label: 'Media', 
      value: 'media'
    },
    { 
      label: 'Slides', 
      value: 'slides'
    },
    { 
      label: 'Big text', 
      value: 'big-text'
    },
  ]

  // Secondary menu items (SHARE and SETTINGS)
  const secondaryMenuItems = [
    { id: 'share', label: 'SHARE', href: '/share' },
    { id: 'settings', label: 'SETTINGS', href: '/settings' },
  ]

  return (
    <div className={styles.page}>
      <Sidebar menuItems={portfolioData.menuItems} secondaryMenuItems={secondaryMenuItems} />
      <MainContent>
        {/* Projects Section */}
        <div className={styles.projectsSection}>
          {/* Show default add button when there's no content */}
          {!hasContent && (
            <div className={styles.addProjectButton}>
              <Dropdown
                options={insertOptions}
                placeholder="Add"
                variant="low"
                size="md"
                alwaysShowPlaceholder={true}
                disabled={true} // Disabled in view mode
              />
            </div>
          )}

          {/* Bio Section as ProjectCard variant */}
          {portfolioData.bio && (
            <ProjectCard variant="bio" bioText={portfolioData.bio.text} />
          )}
          
          {portfolioData.sections.map((section) => {
            if (section.type === 'project' && section.project) {
              return (
                <ProjectCard key={section.id} project={section.project} />
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
  return (
    <ProtectedRoute>
      <PageContent slug={params.slug} />
    </ProtectedRoute>
  )
}
