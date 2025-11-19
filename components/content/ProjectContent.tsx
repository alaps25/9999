import React from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/ui/Typography'
import { EditableText } from '@/components/ui/EditableText'
import { MediaCarousel } from './MediaCarousel'
import type { Project } from '@/lib/firebase/types'
import styles from './ProjectContent.module.scss'

export interface ProjectContentProps {
  project?: Project
  title?: string
  description?: string
  images?: string[]
  metadata?: {
    company?: string
    year?: string
    type?: string
  }
  content?: {
    showTitle?: boolean
    showDescription?: boolean
    showPhotoCarousel?: boolean
    showSlides?: boolean
    showSingleImage?: boolean
    showTextOnly?: boolean
    showMetadata?: boolean
  }
  className?: string
  isEditable?: boolean
  onFieldChange?: (field: keyof Project, value: string) => void
  onAddSlide?: () => void
  onSlideDescriptionChange?: (slideId: string, description: string) => void
}

/**
 * ProjectContent component - Container for project content with flexible layout options
 * Supports toggleable features: metadata, title, description, media carousel, slides
 */
export const ProjectContent: React.FC<ProjectContentProps> = ({
  project,
  title,
  description,
  images,
  metadata,
  content = {
    showTitle: true,
    showDescription: true,
    showPhotoCarousel: true,
    showMetadata: true,
  },
  className,
  isEditable = false,
  onFieldChange,
  onAddSlide,
  onSlideDescriptionChange,
}) => {
  // Use project data if provided, otherwise use direct props
  const displayTitle = project?.title || title
  const displayDescription = project?.description || description
  const displayImages = project?.images || images || []
  const displayMetadata = metadata || {
    company: project?.company,
    year: project?.year,
    type: project?.type,
  }

  // Merge project content config with props
  const contentConfig = project?.content
    ? { ...content, ...project.content }
    : content

  return (
    <div className={cn(styles.contentHolder, className)}>
      {/* Metadata */}
      {contentConfig.showMetadata && displayMetadata && (
        <div className={styles.metadata}>
          {displayMetadata.company && (
            isEditable && project ? (
              <EditableText
                value={displayMetadata.company}
                onChange={(value) => onFieldChange?.('company', value)}
                variant="body"
                className="uppercase"
              />
            ) : (
            <span className="uppercase">{displayMetadata.company}</span>
            )
          )}
          {displayMetadata.year && (
            <>
              <span className={styles.separator}></span>
              {isEditable && project ? (
                <EditableText
                  value={displayMetadata.year}
                  onChange={(value) => onFieldChange?.('year', value)}
                  variant="body"
                />
              ) : (
              <span>{displayMetadata.year}</span>
              )}
            </>
          )}
          {displayMetadata.type && (
            <>
              <span className={styles.separator}></span>
              {isEditable && project ? (
                <EditableText
                  value={displayMetadata.type}
                  onChange={(value) => onFieldChange?.('type', value)}
                  variant="body"
                  className="uppercase"
                />
              ) : (
              <span className="uppercase">{displayMetadata.type}</span>
              )}
            </>
          )}
        </div>
      )}

      {/* Title */}
      {contentConfig.showTitle && displayTitle && (
        isEditable && project ? (
          <EditableText
            value={displayTitle}
            onChange={(value) => onFieldChange?.('title', value)}
            variant="h3"
            className="font-bold"
            as="div"
          />
        ) : (
        <Typography variant="h3" className="font-bold">
          {displayTitle}
        </Typography>
        )
      )}

      {/* Description - Always show above carousel */}
      {contentConfig.showDescription && displayDescription && (
        isEditable && project ? (
          <EditableText
            value={displayDescription}
            onChange={(value) => onFieldChange?.('description', value)}
            variant="body"
            className={cn(styles.description, "text-accent-gray-600")}
            as="div"
          />
        ) : (
        <Typography variant="body" className={cn(styles.description, "text-accent-gray-600")}>
          {displayDescription}
        </Typography>
        )
      )}

      {/* Media Carousel / Slides / Single Media */}
      {contentConfig.showSingleImage && project?.singleImage && (
        <div className="w-full">
          <MediaCarousel singleImage={project.singleImage} variant="single" />
        </div>
      )}
      
      {contentConfig.showSlides && project?.slides && project.slides.length > 0 && (
        <div className="w-full">
          <MediaCarousel
            slides={project.slides}
            variant="slides"
            isEditable={isEditable}
            onAddSlide={onAddSlide}
            onSlideDescriptionChange={onSlideDescriptionChange}
          />
        </div>
      )}
      
      {contentConfig.showPhotoCarousel && displayImages.length > 0 && (
        <div className="w-full">
          <MediaCarousel images={displayImages} variant="carousel" />
        </div>
      )}
    </div>
  )
}

