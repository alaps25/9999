'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
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
 * - Click to open project in modal (same as Lightbox pattern)
 */
export function TimelineViewV3({ projects, username }: TimelineViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const entryRefs = useRef<Map<string, HTMLElement>>(new Map())
  const yearPillRefs = useRef<Map<string, HTMLElement>>(new Map())

  // Hydration fix
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Filter projects: only vcard, hcard, or slide with year tag
  // Sort by year (newest first)
  const sortedProjects = useMemo(() => {
    const filtered = projects.filter((p) => {
      // Must have a year tag
      const hasYearTag = p.tags?.some(tag => /^\d{4}$/.test(tag))
      if (!hasYearTag) return false

      // Must be vcard (vertical layout), hcard (horizontal layout), or slide (has slides)
      const isVcard = p.content?.layout === 'vertical'
      const isHcard = p.content?.layout === 'horizontal'
      const isSlide = p.slides && p.slides.length > 0

      return isVcard || isHcard || isSlide
    })

    return filtered.sort((a, b) => {
      const getYear = (p: Project) => {
        const yearTag = p.tags?.find(tag => /^\d{4}$/.test(tag))
        return yearTag ? parseInt(yearTag) : 0
      }
      return getYear(b) - getYear(a)
    })
  }, [projects])

  // Get year for project (guaranteed to have year tag since filtered)
  const getProjectYear = (project: Project): string => {
    const yearTag = project.tags?.find(tag => /^\d{4}$/.test(tag))
    return yearTag || ''
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
            color: 'var(--accent-primary, #000000)',
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
    } else {
      // Reset
      if (titleEl) {
        tl.to(
          titleEl,
          {
            color: 'var(--text-secondary, #666666)',
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
    }
  }

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
  }

  const handleCloseDetail = () => {
    setSelectedProjectId(null)
    document.body.style.overflow = ''
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

      {/* Project detail modal - same pattern as Lightbox */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {selectedProject && (
              <motion.div
                className={styles.modalOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Backdrop */}
                <div className={styles.modalBackdrop} onClick={handleCloseDetail} />

                {/* Modal content */}
                <motion.div
                  className={styles.modalContent}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    className={styles.modalCloseButton}
                    onClick={handleCloseDetail}
                    aria-label="Close project"
                  >
                    <X size={24} />
                  </button>

                  {/* Project card (same as portfolio view) */}
                  <div className={styles.modalCard}>
                    <ProjectCard project={selectedProject} variant="project" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}
