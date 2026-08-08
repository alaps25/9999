'use client'

import React, { useState, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ProjectCard } from '@/components/content/ProjectCard'
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
 * - Each PROJECT is one entry
 * - Uses existing ProjectCard component from DS
 * - Uses Inter font (project default) at highest weight
 * - On hover: title turns accent color, year pill appears
 * - Click to show same project card as portfolio view
 */
export function TimelineViewV3({ projects, username }: TimelineViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const entryRefs = useRef<Map<string, HTMLElement>>(new Map())
  const yearPillRefs = useRef<Map<string, HTMLElement>>(new Map())

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
    const yearPill = yearPillRefs.current.get(projectId)
    if (!entry || !yearPill) return

    const tl = gsap.timeline()
    const titleEl = entry.querySelector(`.${styles.projectTitle}`)

    if (isHovering) {
      // Title color change
      if (titleEl) {
        tl.to(
          titleEl,
          {
            color: 'var(--accent-primary, #0066ff)',
            duration: 0.3,
            ease: 'power2.out'
          },
          0
        )
      }

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

      // Timeline dot scales
      const dot = entry.querySelector(`.${styles.timelineDot}`)
      if (dot) {
        tl.to(
          dot,
          {
            scale: 1.4,
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out'
          },
          0
        )
      }
    } else {
      // Reset
      if (titleEl) {
        tl.to(
          titleEl,
          {
            color: 'currentColor',
            duration: 0.3,
            ease: 'power2.out'
          },
          0
        )
      }

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

      // Timeline dot resets
      const dot = entry.querySelector(`.${styles.timelineDot}`)
      if (dot) {
        tl.to(
          dot,
          {
            scale: 1,
            opacity: 0.3,
            duration: 0.3,
            ease: 'power2.out'
          },
          0
        )
      }
    }
  }

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId)
  }

  const handleCloseDetail = () => {
    setSelectedProjectId(null)
  }

  // Get selected project
  const selectedProject = selectedProjectId ? sortedProjects.find(p => p.id === selectedProjectId) : null

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
            <div
              ref={(el) => {
                if (el) yearPillRefs.current.set(project.id, el)
              }}
              className={styles.yearPill}
            >
              {getProjectYear(project)}
            </div>

            {/* Project title */}
            <h3 className={styles.projectTitle}>{project.title}</h3>
          </div>
        ))}
      </div>

      {/* Project detail - uses existing ProjectCard component */}
      {selectedProject && (
        <div className={styles.detailOverlay} onClick={handleCloseDetail}>
          <div
            className={styles.detailWrapper}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Close button */}
            <button
              className={styles.closeButton}
              onClick={handleCloseDetail}
              aria-label="Close project"
            >
              ✕
            </button>

            {/* Existing ProjectCard component */}
            <ProjectCard project={selectedProject} variant="project" />
          </div>
        </div>
      )}
    </div>
  )
}
