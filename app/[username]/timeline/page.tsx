'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { TimelineView } from '@/components/layout/TimelineView'
import { useAuth } from '@/contexts/AuthContext'
import { usePortfolioData } from '@/contexts/PortfolioContext'
import { getAllProjectsForUser } from '@/lib/firebase/queries'
import { getSecondaryMenuItems } from '@/lib/utils/navigation'
import type { Project } from '@/lib/firebase/types'
import styles from './page.module.scss'

interface TimelinePageProps {
  params: {
    username: string
  }
}

export default function TimelinePage({ params }: TimelinePageProps) {
  const { user } = useAuth()
  const { menuItems } = usePortfolioData()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { username } = params

  // Fetch all projects for this user
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.uid) {
        setLoading(false)
        return
      }

      try {
        const allProjects = await getAllProjectsForUser(user.uid)
        setProjects(allProjects || [])
      } catch (error) {
        console.error('Error fetching projects:', error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user?.uid])

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

  if (loading) {
    return (
      <div className={styles.timelinePage}>
        <Sidebar menuItems={sidebarItems} secondaryMenuItems={secondaryMenuItems} />
        <MainContent>
          <div className={styles.loadingContainer}>
            <p>Loading timeline...</p>
          </div>
        </MainContent>
      </div>
    )
  }

  return (
    <div className={styles.timelinePage}>
      <Sidebar menuItems={sidebarItems} secondaryMenuItems={secondaryMenuItems} />
      <MainContent>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Timeline</h1>
          <p className={styles.subtitle}>
            Work journey across {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No projects yet. Create your first project to build your timeline!</p>
          </div>
        ) : (
          <TimelineView projects={projects} username={username} />
        )}
      </MainContent>
    </div>
  )
}
