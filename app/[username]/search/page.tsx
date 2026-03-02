'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import { Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useIsMobile } from '@/lib/hooks/useIsMobile'
import { Sidebar, MobileMenuButton } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { ProjectCard } from '@/components/content/ProjectCard'
import { Input } from '@/components/ui/Input'
import { getAllProjectsForUser, getMenuItems, getUserSettings } from '@/lib/firebase/queries'
import { getPortfolioUrl, shareUrl } from '@/lib/utils/share'
import { getSecondaryMenuItems, getMenuItemsWithSearch } from '@/lib/utils/navigation'
import { getUserIdByUsername } from '@/lib/utils/user'
import { hasValidSession } from '@/lib/utils/session'
import { applyTheme } from '@/lib/utils/theme'
import styles from '../../page.module.scss'
import searchStyles from './page.module.scss'
import type { Project, MenuItem } from '@/lib/firebase/types'

interface PageProps {
  params: {
    username: string
  }
}

interface SearchResult extends Project {
  pageName?: string
  pageSlug?: string
}

function stripHtml(html: string): string {
  if (typeof window !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  }
  return html.replace(/<[^>]*>/g, '')
}

function SearchPageContent({ username }: { username: string }) {
  const router = useRouter()
  const { user, userData, loading: authLoading } = useAuth()
  const isMobile = useIsMobile()
  const [projects, setProjects] = useState<SearchResult[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (authLoading) return

    async function loadData() {
      try {
        let targetUserId: string | null = null
        
        if (user && userData && userData.username === username) {
          targetUserId = user.uid
        } else {
          targetUserId = await getUserIdByUsername(username)
          
          if (!targetUserId) {
            setLoading(false)
            return
          }
          
          const settings = await getUserSettings(targetUserId)
          if (settings?.visibility === 'PRIVATE') {
            if (!hasValidSession(targetUserId)) {
              router.push(`/${username}/unlock?redirect=${encodeURIComponent(`/${username}/search`)}`)
              setLoading(false)
              return
            }
          }
          
          if (settings) {
            const accentColor = settings.accentColor || '#000000'
            const theme = (settings.theme || 'AUTO') as 'AUTO' | 'LIGHT' | 'DARK'
            applyTheme(theme, accentColor)
            
            if (settings.roundedCorners) {
              const numValue = parseInt(settings.roundedCorners, 10)
              const cappedValue = isNaN(numValue) ? 0 : Math.min(Math.max(numValue, 0), 48)
              document.documentElement.style.setProperty('--border-radius', `${cappedValue}px`)
            } else {
              document.documentElement.style.setProperty('--border-radius', '0px')
            }
          }
        }

        if (!targetUserId) {
          setLoading(false)
          return
        }

        const [allProjects, allMenuItems] = await Promise.all([
          getAllProjectsForUser(targetUserId),
          getMenuItems(targetUserId)
        ])

        const projectsWithPageInfo: SearchResult[] = allProjects.map(project => {
          const page = allMenuItems.find(item => item.id === project.pageId)
          return {
            ...project,
            pageName: page?.label,
            pageSlug: page?.slug
          }
        })

        setProjects(projectsWithPageInfo)
        setMenuItems(allMenuItems)
      } catch (error) {
        console.error('Error loading search data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [username, user, userData, router, authLoading])

  const fuse = useMemo(() => {
    return new Fuse(projects, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'description', weight: 1.5, getFn: (obj) => stripHtml(obj.description || '') },
        { name: 'tags', weight: 1 },
        { name: 'pageName', weight: 0.5 }
      ],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2
    })
  }, [projects])

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return []
    const results = fuse.search(searchQuery)
    return results.map(result => result.item)
  }, [fuse, searchQuery])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value.length >= 2) {
      setHasSearched(true)
    }
  }, [])

  const handleShareClick = async () => {
    const portfolioUrl = getPortfolioUrl(username)
    await shareUrl(portfolioUrl, `Check out ${username}'s portfolio`)
  }

  if (authLoading || loading) {
    return <div>Loading...</div>
  }

  // Add Search at the bottom of user pages, mark it as active
  const menuItemsWithHrefs = userData?.username === username
    ? getMenuItemsWithSearch(menuItems, username, `/${username}/search`)
    : menuItems.map(item => ({
        ...item,
        href: `/${username}/${item.slug || 'page'}`,
        isActive: false
      }))

  const secondaryMenuItems = userData?.username === username 
    ? getSecondaryMenuItems(handleShareClick, `/${username}/search`)
    : [{ id: 'share', label: 'SHARE', onClick: handleShareClick }]

  const showResults = hasSearched && searchQuery.length >= 2
  const hasResults = searchResults.length > 0

  return (
    <div className={styles.page}>
      <Sidebar 
        menuItems={menuItemsWithHrefs} 
        secondaryMenuItems={secondaryMenuItems}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={setMobileMenuOpen}
      />
      <MainContent>
        <div className={styles.pageHeaderRow}>
          <div className={searchStyles.searchInputWrapper}>
            <Input
              type="text"
              placeholder="SEARCH"
              value={searchQuery}
              onChange={handleSearchChange}
              leftIcon={<Search size={14} />}
              fullWidth
              autoFocus
            />
          </div>
          {isMobile && (
            <MobileMenuButton 
              isOpen={mobileMenuOpen} 
              onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
              menuItems={menuItemsWithHrefs}
              secondaryMenuItems={secondaryMenuItems}
            />
          )}
        </div>

        <div className={styles.projectsSection}>
          {showResults && !hasResults && (
            <div className={styles.emptyStateCard}>
              No results found for &ldquo;{searchQuery}&rdquo;
            </div>
          )}

          {showResults && hasResults && searchResults.map((project) => {
            const isMediaCard = !project.content?.showTitle && 
                                !project.content?.showDescription && 
                                project.content?.showSingleImage && 
                                !project.content?.showSlides && 
                                !project.content?.showPhotoCarousel &&
                                !project.content?.showTags
            
            return (
              <div key={project.id} className={searchStyles.resultItem}>
                {project.pageName && (
                  <div className={searchStyles.pageLabel}>
                    {project.pageName}
                  </div>
                )}
                <ProjectCard 
                  project={project}
                  noPadding={isMediaCard}
                />
              </div>
            )
          })}
        </div>
      </MainContent>
    </div>
  )
}

export default function SearchPage({ params }: PageProps) {
  return <SearchPageContent username={params.username} />
}
