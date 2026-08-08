'use client'

import React, { useState, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { Project } from '@/lib/firebase/types'
import styles from './TimelineViewV3.module.scss'

interface TimelineViewProps {
  projects: Project[]
  username: string
}

/**
 * Timeline Component V3 - Project-Based Timeline
 *
 * Design:
 * - Vertical dotted timeline on left edge
 * - Each PROJECT is one entry (not grouped by year)
 * - Black text by default
 * - On hover: accent color + year pill appears
 * - Year pill matches sidebar navigation pill style
 * - Click to open project detail card (with fade effect)
 */
export function TimelineViewV3({ projects, username }: TimelineViewProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [accentColor, setAccentColor] = useState<string>('#0066ff') // Default accent
  const entryRefs = useRef<Map<string, HTMLElement>>(new Map())

  // Sort projects by year (newest first)
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const getYear = (p: Project) => {
        const yearTag = p.tags?.find(tag => /^\d{4}$/.test(tag))
        return yearTag ? parseInt(yearTag) : new Date().getFullYear()
      }
      return getYear(b) - getYear(a)
    })
  }, [projects])

  // Get year for project
  const getProjectYear = (project: Project): string => {
    const yearTag = project.tags?.find(tag => /^\d{4}$/.test(tag))
    return yearTag || String(new Date().getFullYear())
  }

  // Hover animation: title -> accent color, year appears
  const animateEntryHover = (projectId: string, isHovering: boolean) => {
    const entry = entryRefs.current.get(projectId)
    if (!entry) return

    const tl = gsap.timeline()
    const titleEl = entry.querySelector(`.${styles.projectTitle}`)
    const yearPill = entry.querySelector(`.${styles.yearPill}`)

    if (isHovering) {
      // Title color change
      tl.to(
        titleEl,
        {
          color: accentColor,
          duration: 0.3,
          ease: 'power2.out'
        },
        0
      )

      // Year pill slides in + fades
      tl.from(
        yearPill,
        {
          opacity: 0,
          x: 10,
          duration: 0.3,
          ease: 'cubic.out'
        },
        0
      )
    } else {
      // Reset
      tl.to(
        titleEl,
        {
          color: 'currentColor',
          duration: 0.3,
          ease: 'power2.out'
        },
        0
      )

      tl.to(
        yearPill,
        {
          opacity: 0,
          x: 10,
          duration: 0.3,
          ease: 'cubic.out'
        },
        0
      )
    }
  }

  const handleProjectClick = (projectId: string) => {
    setSelectedProject(projectId)
    // Fade timeline
    gsap.to(`.${styles.timeline}`, {
      opacity: 0.2,
      pointerEvents: 'none',
      duration: 0.3
    })
  }

  const handleCloseDetail = () => {
    setSelectedProject(null)
    // Fade timeline back in
    gsap.to(`.${styles.timeline}`, {
      opacity: 1,
      pointerEvents: 'auto',
      duration: 0.3
    })
  }

  // Get selected project
  const selected = selectedProject ? sortedProjects.find(p => p.id === selectedProject) : null

  if (projects.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No projects yet. Create your first project to build your timeline!</p>
      </div>
    )
  }

  return (
    <div className={styles.timelineContainer}>
      {/* Timeline */}
      <div className={styles.timeline}>
        {/* Dotted vertical line */}
        <div className={styles.timelineAxis} />

        {/* Project entries */}
        {sortedProjects.map((project) => (
          <div
            key={project.id}
            ref={(el) => {
              if (el) entryRefs.current.set(project.id, el)
            }}
            className={styles.timelineEntry}
            onMouseEnter={() => animateEntryHover(project.id, true)}
            onMouseLeave={() => animateEntryHover(project.id, false)}
            onClick={() => handleProjectClick(project.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleProjectClick(project.id)
              }
            }}
          >
            {/* Dot on timeline */}
            <div className={styles.timelineDot} />

            {/* Year pill (hidden by default, shown on hover) */}
            <div className={styles.yearPill}>{getProjectYear(project)}</div>

            {/* Project title */}
            <h3 className={styles.projectTitle}>{project.title}</h3>
          </div>
        ))}
      </div>

      {/* Project detail card - appears on click */}
      {selected && (
        <div className={styles.detailOverlay} onClick={handleCloseDetail}>
          <div
            className={styles.detailCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Close button */}
            <button
              className={styles.closeButton}
              onClick={handleCloseDetail}
              aria-label="Close project detail"
            >
              ✕
            </button>

            {/* Project content */}
            <div className={styles.detailContent}>
              <div className={styles.detailYear}>{getProjectYear(selected)}</div>
              <h1 className={styles.detailTitle}>{selected.title}</h1>

              {selected.description && (
                <p className={styles.detailDescription}>{selected.description}</p>
              )}

              {selected.tags && selected.tags.length > 0 && (
                <div className={styles.detailTags}>
                  {selected.tags.map((tag) => (
                    <span key={tag} className={styles.detailTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
