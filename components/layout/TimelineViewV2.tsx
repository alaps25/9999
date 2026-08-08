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
 * Enhanced Timeline Component V2
 * Features:
 * - Magnetic pull hover effect (year lifts on hover)
 * - Spotlight focus (others fade)
 * - GSAP animations for smooth interaction
 * - Click to expand year projects
 * - Architectural minimal design
 */
export function TimelineViewV2({ projects, username }: TimelineViewProps) {
  const [focusedYear, setFocusedYear] = useState<number | null>(null)
  const [hoveredYear, setHoveredYear] = useState<number | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const yearRefs = useRef<Map<number, HTMLElement>>(new Map())

  // Group and sort projects by year
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

  // Magnetic Pull Hover Effect
  const createMagneticPullAnimation = (element: HTMLElement, isHovering: boolean) => {
    const tl = gsap.timeline()

    if (isHovering) {
      // Lift up with elastic ease
      tl.to(element, {
        y: -12,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)'
      }, 0)

      // Add blue glow/shadow
      tl.to(element, {
        boxShadow: '0 12px 32px rgba(0, 102, 255, 0.4), 0 0 20px rgba(0, 102, 255, 0.2)',
        borderColor: '#0066ff',
        duration: 0.3
      }, 0)

      // Scale slightly
      tl.to(element, {
        scale: 1.05,
        duration: 0.3,
        ease: 'cubic.out'
      }, 0)

      // Fade all other year markers
      yearRefs.current.forEach((el, year) => {
        if (year !== hoveredYear) {
          tl.to(el, {
            opacity: 0.15,
            filter: 'blur(0.5px)',
            duration: 0.3
          }, 0)
        }
      })

      // Brighten the year number
      tl.to(element.querySelector('.yearNumber'), {
        color: '#0066ff',
        textShadow: '0 0 12px rgba(0, 102, 255, 0.4)',
        duration: 0.3
      }, 0)
    } else {
      // Reverse animation
      tl.to(element, {
        y: 0,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)'
      }, 0)

      tl.to(element, {
        boxShadow: '0 0 0 transparent',
        borderColor: 'currentColor',
        duration: 0.25
      }, 0)

      tl.to(element, {
        scale: 1,
        duration: 0.3,
        ease: 'cubic.out'
      }, 0)

      // Fade all back to normal
      yearRefs.current.forEach((el) => {
        tl.to(el, {
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.3
        }, 0)
      })

      // Reset text color
      tl.to(element.querySelector('.yearNumber'), {
        color: 'currentColor',
        textShadow: 'none',
        duration: 0.25
      }, 0)
    }

    return tl
  }

  const handleYearHover = (year: number, isHovering: boolean) => {
    setHoveredYear(isHovering ? year : null)
    const element = yearRefs.current.get(year)
    if (element) {
      createMagneticPullAnimation(element, isHovering)
    }
  }

  const handleYearClick = (year: number) => {
    setFocusedYear(focusedYear === year ? null : year)
  }

  if (projects.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No projects yet. Create your first project to build your timeline!</p>
      </div>
    )
  }

  return (
    <div className={styles.timelineContainer} ref={timelineRef}>
      <div className={styles.timeline}>
        {/* Timeline axis line - dotted */}
        <div className={styles.timelineAxis} />

        {/* Timeline entries */}
        {timelineData.map((entry) => (
          <div
            key={entry.year}
            className={`${styles.timelineEntry} ${
              focusedYear === entry.year ? styles.focused : ''
            }`}
          >
            {/* Year marker - interactive with magnetic pull effect */}
            <button
              ref={(el) => {
                if (el) yearRefs.current.set(entry.year, el)
              }}
              className={styles.yearMarker}
              onMouseEnter={() => handleYearHover(entry.year, true)}
              onMouseLeave={() => handleYearHover(entry.year, false)}
              onClick={() => handleYearClick(entry.year)}
              aria-label={`View ${entry.year} (${entry.projects.length} projects)`}
              aria-expanded={focusedYear === entry.year}
            >
              <div className={styles.yearNumber}>{entry.year}</div>
              <div className={styles.yearCount}>{entry.projects.length} projects</div>
            </button>

            {/* Projects grid - collapse/expand */}
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
