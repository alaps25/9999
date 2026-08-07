'use client'

import React, { useMemo } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { TimelineView } from '@/components/layout/TimelineView'
import { usePortfolioData } from '@/contexts/PortfolioContext'
import { getSecondaryMenuItems } from '@/lib/utils/navigation'
import styles from './page.module.scss'

interface TimelinePageProps {
  params: {
    username: string
  }
}

export default function TimelinePage({ params }: TimelinePageProps) {
  const { menuItems, currentPageSections } = usePortfolioData()
  const { username } = params

  // Extract all projects from current page sections
  const projects = useMemo(() => {
    if (!currentPageSections) return []
    return currentPageSections
      .filter(section => section.type === 'project' && section.project)
      .map(section => section.project)
      .filter(Boolean)
  }, [currentPageSections])

  // Build sidebar items
  const sidebarItems = useMemo(() => {
    if (!menuItems) return []
    return menuItems.map(item => ({
      ...item,
      href: `/${username}/${item.slug || 'page'}`,
      isActive: false,
    }))
  }, [menuItems, username])

  const secondaryMenuItems = getSecondaryMenuItems(() => {
    // Share functionality
  })

  return (
    <div className={styles.timelinePage}>
      <Sidebar menuItems={sidebarItems} secondaryMenuItems={secondaryMenuItems} />
      <MainContent>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Timeline</h1>
          <p className={styles.subtitle}>
            Work journey across {projects.length} projects
          </p>
        </div>

        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No projects yet. Start creating to build your timeline!</p>
          </div>
        ) : (
          <TimelineView projects={projects} username={username} />
        )}
      </MainContent>
    </div>
  )
}
