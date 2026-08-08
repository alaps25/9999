'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { Project } from '@/lib/firebase/types'
import styles from './TimelineViewV2.module.scss'

interface TimelineViewProps {
  projects: Project[]
  username: string
}

interface TimelineYear {
  year: number
  projects: Project[]
}

/**
 * Timeline Component V2 - Minimal Architectural Design
 *
 * Design: Only one year is highlighted/focused at a time.
 * Others fade to background. Hover to change focus.
 *
 * Features:
 * - One year always highlighted (blue glow, prominent)
 * - Other years faded to 15% opacity in background
 * - Magnetic pull hover effect
 * - Click year to expand/show its projects
 * - GSAP animations for smooth interaction
 */
export function TimelineViewV2({ projects, username }: TimelineViewProps) {
  const [focusedYear, setFocusedYear] = useState<number | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const yearRefs = useRef<Map<number, HTMLElement>>(new Map())

  // Group and sort projects by year (newest first)
  const timelineData: TimelineYear[] = useMemo(() => {
    const grouped = new Map<number, Project[]>()

    projects.forEach(project => {
      const yearTag = project.tags?.find(tag => /^\d{4}$/.test(tag))
      const year = yearTag ? parseInt(yearTag) : new Date().getFullYear()

      if (!grouped.has(year)) {
        grouped.set(year, [])
      }
      grouped.get(year)!.push(project)
    })

    return Array.from(grouped.entries())
      .map(([year, projects]) => ({ year, projects }))
      .sort((a, b) => b.year - a.year)
  }, [projects])

  // Initialize with first year focused
  useEffect(() => {
    if (focusedYear === null && timelineData.length > 0) {
      setFocusedYear(timelineData[0].year)
    }
  }, [timelineData, focusedYear])

  // Spotlight + Magnetic Pull Animation
  const animateYearFocus = (year: number, isFocusing: boolean) => {
    const tl = gsap.timeline()

    yearRefs.current.forEach((el, y) => {
      if (y === year) {
        // Focused year: lift + glow
        if (isFocusing) {
          tl.to(
            el,
            {
              y: -12,
              boxShadow: '0 12px 32px rgba(0, 102, 255, 0.5), 0 0 20px rgba(0, 102, 255, 0.3)',
              borderColor: '#0066ff',
              scale: 1.05,
              duration: 0.4,
              ease: 'elastic.out(1, 0.5)'
            },
            0
          )

          tl.to(
            el.querySelector('.yearNumber'),
            {
              color: '#0066ff',
              textShadow: '0 0 12px rgba(0, 102, 255, 0.5)',
              duration: 0.3
            },
            0
          )
        } else {
          // Reset
          tl.to(
            el,
            {
              y: 0,
              boxShadow: '0 2px 8px rgba(0, 102, 255, 0.2)',
              borderColor: '#0066ff',
              scale: 1,
              duration: 0.4,
              ease: 'elastic.out(1, 0.5)'
            },
            0
          )

          tl.to(
            el.querySelector('.yearNumber'),
            {
              color: '#0066ff',
              textShadow: 'none',
              duration: 0.25
            },
            0
          )
        }
      } else {
        // Non-focused years: fade out
        tl.to(
          el,
          {
            opacity: isFocusing ? 0.15 : 0.4,
            filter: isFocusing ? 'blur(0.5px)' : 'blur(0px)',
            duration: 0.3
          },
          0
        )
      }
    })

    return tl
  }

  const handleYearHover = (year: number) => {
    if (focusedYear !== year) {
      animateYearFocus(year, true)
    }
  }

  const handleYearLeave = () => {
    if (focusedYear !== null) {
      animateYearFocus(focusedYear, false)
    }
  }

  const handleYearClick = (year: number) => {
    setFocusedYear(year)
    animateYearFocus(year, false)
  }

  if (projects.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No projects yet. Create your first project to build your timeline!</p>
      </div>
    )
  }

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timeline}>
        {/* Vertical timeline line */}
        <div className={styles.timelineAxis} />

        {/* Year markers */}
        {timelineData.map((entry) => (
          <div
            key={entry.year}
            className={`${styles.timelineEntry} ${
              focusedYear === entry.year ? styles.isFocused : ''
            }`}
          >
            {/* Year button */}
            <button
              ref={(el) => {
                if (el) yearRefs.current.set(entry.year, el)
              }}
              className={styles.yearMarker}
              onMouseEnter={() => handleYearHover(entry.year)}
              onMouseLeave={handleYearLeave}
              onClick={() => handleYearClick(entry.year)}
              aria-label={`${entry.year}: ${entry.projects.length} projects`}
              aria-expanded={focusedYear === entry.year}
            >
              <div className={styles.yearNumber}>{entry.year}</div>
              <div className={styles.yearCount}>{entry.projects.length}</div>
            </button>

            {/* Projects grid - only shows when focused */}
            <div className={styles.projectsContainer}>
              {entry.projects.map((project) => (
                <div
                  key={project.id}
                  className={`${styles.projectCard} ${
                    selectedProject === project.id ? styles.selected : ''
                  }`}
                  onClick={() =>
                    setSelectedProject(selectedProject === project.id ? null : project.id)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedProject(selectedProject === project.id ? null : project.id)
                    }
                  }}
                >
                  <h4 className={styles.projectTitle}>{project.title}</h4>
                  {project.description && (
                    <p className={styles.projectDescription}>
                      {project.description.substring(0, 120)}
                      {project.description.length > 120 ? '...' : ''}
                    </p>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <div className={styles.projectTags}>
                      {project.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className={styles.tag}>+{project.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
