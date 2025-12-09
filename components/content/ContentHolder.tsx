import React from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/ui/Typography'
import { PhotoCarousel } from './PhotoCarousel'
import type { Project } from '@/lib/firebase/types'
import styles from './ContentHolder.module.scss'

export interface ContentHolderProps {
  project?: Project
  title?: string
  description?: string
  images?: string[]
  content?: {
    showTitle?: boolean
    showDescription?: boolean
    showPhotoCarousel?: boolean
    showSlides?: boolean
    showSingleImage?: boolean
    showTextOnly?: boolean
    showTags?: boolean
  }
  className?: string
}

/**
 * ContentHolder component - A flexible container for portfolio content
 * Supports toggleable features: title, description, photo carousel, metadata
 */
export const ContentHolder: React.FC<ContentHolderProps> = ({
  project,
  title,
  description,
  images,
  content = {
    showTitle: true,
    showDescription: true,
    showPhotoCarousel: true,
    showTags: true,
  },
  className,
}) => {
  // Use project data if provided, otherwise use direct props
  const displayTitle = project?.title || title
  const displayDescription = project?.description || description
  const displayImages = project?.images || images || []
  // Tags are now used instead of metadata
  const displayTags = project?.tags || []

  // Merge project content config with props
  const contentConfig = project?.content
    ? { ...content, ...project.content }
    : content

  return (
    <div className={cn(styles.contentHolder, className)}>
      {/* Tags */}
      {contentConfig.showTags && displayTags.length > 0 && (
        <div className={styles.metadata}>
          {displayTags.map((tag, index) => (
            <React.Fragment key={index}>
              <span className="uppercase">{tag}</span>
              {index < displayTags.length - 1 && <span className={styles.separator}></span>}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Title */}
      {contentConfig.showTitle && displayTitle && (
        <Typography variant="h3" className="font-bold">
          {displayTitle}
        </Typography>
      )}

      {/* Description - Always show above carousel */}
      {contentConfig.showDescription && displayDescription && (
        <Typography variant="body" className={cn(styles.description, "text-accent-gray-600")}>
          {displayDescription}
        </Typography>
      )}

      {/* Photo Carousel / Slides / Single Image */}
      {contentConfig.showSingleImage && project?.singleImage && (
        <div className="w-full">
          <PhotoCarousel 
            singleImage={Array.isArray(project.singleImage) ? project.singleImage[0] : project.singleImage} 
            variant="single" 
          />
        </div>
      )}
      
      {contentConfig.showSlides && project?.slides && project.slides.length > 0 && (
        <div className="w-full">
          <PhotoCarousel slides={project.slides} variant="slides" />
        </div>
      )}
      
      {contentConfig.showPhotoCarousel && displayImages.length > 0 && (
        <div className="w-full">
          <PhotoCarousel images={displayImages} variant="carousel" />
        </div>
      )}
    </div>
  )
}

