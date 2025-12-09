import React from 'react'
import { cn } from '@/lib/utils'
import { ProjectContent } from './ProjectContent'
import type { Project } from '@/lib/firebase/types'
import styles from './ProjectCard.module.scss'

export interface ProjectCardProps {
  project?: Project
  variant?: 'project' | 'bio'
  bioText?: string
  className?: string
  isEditable?: boolean
  noPadding?: boolean // For Media cards - removes padding
  onFieldChange?: (field: keyof Project, value: string | string[]) => void
  onBioChange?: (value: string) => void
  onAddSlide?: () => void
  onSlideDescriptionChange?: (slideId: string, description: string) => void
  onMediaChange?: (files: File[]) => void
  onMediaDelete?: (index?: number) => void
  onSlideImageChange?: (slideId: string, files: File[]) => void
  onSlideImageDelete?: (slideId: string) => void
  onSlideDelete?: (slideId: string) => void
  uploadingStates?: Record<number | string, boolean> // Loading states for images/slides
}

/**
 * ProjectCard component - Card container wrapper for project content
 * Provides card styling (border, padding, background) around ProjectContent
 * Supports both project and bio variants
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  variant = 'project',
  bioText,
  className,
  isEditable = false,
  noPadding = false,
  onFieldChange,
  onBioChange,
  onAddSlide,
  onSlideDescriptionChange,
  onMediaChange,
  onMediaDelete,
  onSlideImageChange,
  onSlideImageDelete,
  onSlideDelete,
  uploadingStates,
}) => {
  return (
    <div className={cn(styles.projectCard, noPadding && styles.noPadding, className)}>
      {variant === 'bio' ? (
        <ProjectContent
          variant="bio"
          description={bioText}
          content={{
            showTags: false,
            showTitle: false,
            showDescription: true,
            showPhotoCarousel: false,
            showSlides: false,
            showSingleImage: false,
            showTextOnly: false,
          }}
          isEditable={isEditable}
          onBioChange={onBioChange}
        />
      ) : (
        <ProjectContent
          variant="project"
          project={project}
          isEditable={isEditable}
          onFieldChange={onFieldChange}
          onAddSlide={onAddSlide}
          onSlideDescriptionChange={onSlideDescriptionChange}
          onMediaChange={onMediaChange}
          onMediaDelete={onMediaDelete}
          onSlideImageChange={onSlideImageChange}
          onSlideImageDelete={onSlideImageDelete}
          onSlideDelete={onSlideDelete}
          uploadingStates={uploadingStates}
        />
      )}
    </div>
  )
}

