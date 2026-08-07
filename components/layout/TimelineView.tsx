'use client'

import React, { useState, useMemo } from 'react'
import { Project } from '@/lib/firebase/types'
import styles from './TimelineView.module.scss'

interface TimelineViewProps {
  projects: Project[]
  username: string
}

interface TimelineYear {
  year: number
  projects: Project[]
}

export function TimelineView({ projects, username }: TimelineViewProps) {
  const [focusedYear, setFocusedYear] = useState<number | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Extract year from project tags and group by year
  const timelineData: TimelineYear[] = useMemo(() => {
    const grouped = new Map<number, Project[]>()

    projects.forEach(project => {
      // Extract year from tags (look for 4-digit number)
      const yearTag = project.tags?.find(tag => /^\d{4}$/.test(tag))
      const year = yearTag ? parseInt(yearTag) : new Date().getFullYear()

      if (!grouped.has(year)) {
        grouped.set(year, [])
      }
      grouped.get(year)!.push(project)
    })

    // Sort by year descending (newest first)
    return Array.from(grouped.entries())
      .map(([year, projects]) => ({ year, projects }))
      .sort((a, b) => b.year - a.year)
  }, [projects])

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
    <div className={styles.timelineContainer}>
      <div className={styles.timeline}>
        {/* Timeline axis line */}
        <div className={styles.timelineAxis} />

        {/* Timeline entries */}
        {timelineData.map((entry) => (
          <div
            key={entry.year}
            className={`${styles.timelineEntry} ${
              focusedYear === entry.year ? styles.focused : ''
            }`}
          >
            {/* Year marker - click to expand */}
            <button
              className={styles.yearMarker}
              onClick={() => handleYearClick(entry.year)}
              aria-label={`View ${entry.year} (${entry.projects.length} projects)`}
            >
              <div className={styles.yearDot} />
              <div className={styles.yearLabel}>{entry.year}</div>
              <div className={styles.yearCount}>{entry.projects.length}</div>
            </button>

            {/* Projects (collapsed by default, expanded on year click) */}
            <div className={styles.projectsContainer}>
              {entry.projects.map((project) => (
                <div
                  key={project.id}
                  className={`${styles.projectCard} ${
                    selectedProject === project.id ? styles.selected : ''
                  }`}
                  onClick={() => setSelectedProject(
                    selectedProject === project.id ? null : project.id
                  )}
                >
                  <div className={styles.projectContent}>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    {project.description && (
                      <p className={styles.projectDescription}>
                        {project.description.substring(0, 100)}
                        {project.description.length > 100 ? '...' : ''}
                      </p>
                    )}
                    {project.tags && project.tags.length > 0 && (
                      <div className={styles.projectTags}>
                        {project.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
