import React from 'react'
import { ProjectContent } from './ProjectContent'
import type { Project } from '@/lib/firebase/types'
import styles from './ProjectCard.module.scss'

export interface ProjectCardProps {
  project: Project
  className?: string
  isEditable?: boolean
  onFieldChange?: (field: keyof Project, value: string) => void
  onAddSlide?: () => void
  onSlideDescriptionChange?: (slideId: string, description: string) => void
}

/**
 * ProjectCard component - Card container wrapper for project content
 * Provides card styling (border, padding, background) around ProjectContent
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  className,
  isEditable = false,
  onFieldChange,
  onAddSlide,
  onSlideDescriptionChange,
}) => {
  return (
    <div className={styles.projectCard}>
      <ProjectContent
        project={project}
        isEditable={isEditable}
        onFieldChange={onFieldChange}
        onAddSlide={onAddSlide}
        onSlideDescriptionChange={onSlideDescriptionChange}
      />
    </div>
  )
}

