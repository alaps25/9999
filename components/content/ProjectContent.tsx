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
    layout?: 'vertical' | 'horizontal' // V Card (vertical) or H Card (horizontal)
  }
  className?: string
  isEditable?: boolean
  variant?: 'project' | 'bio'
  onFieldChange?: (field: keyof Project, value: string) => void
  onBioChange?: (value: string) => void
  onAddSlide?: () => void
  onSlideDescriptionChange?: (slideId: string, description: string) => void
  onMediaChange?: (files: File[]) => void
  onMediaDelete?: (index?: number) => void
  onSlideImageChange?: (slideId: string, files: File[]) => void
  onSlideImageDelete?: (slideId: string) => void
  onSlideDelete?: (slideId: string) => void
  onNavigateToSlide?: (index: number) => void
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
  variant = 'project',
  onFieldChange,
  onBioChange,
  onAddSlide,
  onSlideDescriptionChange,
  onMediaChange,
  onMediaDelete,
  onSlideImageChange,
  onSlideImageDelete,
  onSlideDelete,
  onNavigateToSlide,
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

  // Determine layout: vertical (V Card) or horizontal (H Card)
  const layout = contentConfig.layout || 'vertical'
  const isHorizontal = layout === 'horizontal'
  
  // Detect "Big text" variant: no title, no metadata, only description, no media
  const isBigText = !contentConfig.showTitle && 
                    contentConfig.showDescription && 
                    !contentConfig.showSingleImage && 
                    !contentConfig.showSlides && 
                    !contentConfig.showPhotoCarousel &&
                    !contentConfig.showMetadata &&
                    variant !== 'bio'

  // Check if there's any media content to show (including placeholders)
  // Media cards always show placeholder, so they always have "content"
  const hasMediaContent = 
    contentConfig.showSingleImage || // Always true for Media cards, even if empty
    (contentConfig.showSlides && project?.slides && project.slides.length > 0) ||
    (contentConfig.showPhotoCarousel && displayImages.length > 0)

  // Check if there's any text content to show
  const hasTextContent = 
    (contentConfig.showTitle && displayTitle) ||
    (contentConfig.showDescription && displayDescription) ||
    (contentConfig.showMetadata && displayMetadata && (displayMetadata.company || displayMetadata.year || displayMetadata.type))

  return (
    <div className={cn(
      styles.contentHolder,
      isHorizontal && styles.horizontal,
      !hasMediaContent && styles.noMediaGap,
      className
    )}>
      {/* Element 1: Text Content (Title, Description, Metadata) - Only render if there's content */}
      {hasTextContent && (
        <div className={styles.textContent}>
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

        {/* Description */}
        {contentConfig.showDescription && displayDescription && (
          variant === 'bio' || isBigText ? (
            isEditable ? (
              <EditableText
                value={displayDescription}
                onChange={(value) => onBioChange?.(value)}
                variant="body"
                className={cn(styles.description, styles.bioDescription)}
                as="div"
              />
            ) : (
              <Typography variant="body" className={cn(styles.description, styles.bioDescription)}>
                {displayDescription}
              </Typography>
            )
          ) : (
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
          )
        )}

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
        </div>
      )}

      {/* Element 2: Media Content - Only render if there's media to show */}
      {hasMediaContent && (
        <div className={styles.mediaContent}>
          {contentConfig.showSingleImage && (
            <MediaCarousel 
              singleImage={project?.singleImage || ''} 
              variant="single" 
              isEditable={isEditable}
              onMediaChange={onMediaChange}
              onMediaDelete={onMediaDelete}
            />
          )}
          
          {contentConfig.showSlides && project?.slides && project.slides.length > 0 && (
            <MediaCarousel
              slides={project.slides}
              variant="slides"
              isEditable={isEditable}
              onAddSlide={onAddSlide}
              onSlideDescriptionChange={onSlideDescriptionChange}
              onSlideImageChange={onSlideImageChange}
              onSlideImageDelete={onSlideImageDelete}
              onSlideDelete={onSlideDelete}
            />
          )}
          
          {contentConfig.showPhotoCarousel && displayImages.length > 0 && (
            <MediaCarousel images={displayImages} variant="carousel" />
          )}
        </div>
      )}
    </div>
  )
}

