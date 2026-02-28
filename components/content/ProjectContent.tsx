import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/ui/Typography'
import { EditableText } from '@/components/ui/EditableText'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { RichTextDisplay } from '@/components/ui/RichTextDisplay'
import { TagInput } from '@/components/ui/TagInput'
import { Tags } from './Tags'
import { MediaCarousel } from './MediaCarousel'
import type { Project } from '@/lib/firebase/types'
import styles from './ProjectContent.module.scss'

/**
 * Check if description has actual content (not just empty HTML)
 * Handles plain text and HTML content from RichTextEditor
 */
function hasDescriptionContent(desc: string | undefined): boolean {
  if (!desc) return false
  const trimmed = desc.trim()
  if (!trimmed || trimmed === '<p></p>' || trimmed === '<p><br></p>') return false
  // Strip HTML tags and check if any text remains
  const textOnly = trimmed.replace(/<[^>]*>/g, '').trim()
  return textOnly.length > 0
}

/**
 * Check if singleImage field has actual media content
 * Handles both string URLs and arrays of URLs
 */
function hasSingleImageContent(singleImage: string | string[] | undefined): boolean {
  if (!singleImage) return false
  if (typeof singleImage === 'string') return singleImage.length > 0
  if (Array.isArray(singleImage)) return singleImage.length > 0
  return false
}

/**
 * DescriptionField - Extracted component to simplify rendering logic
 * Handles edit/view mode and bio/project variants
 */
interface DescriptionFieldProps {
  value: string
  isEditable: boolean
  isBioVariant: boolean
  hasProject: boolean
  onFieldChange?: (field: keyof Project, value: string | string[]) => void
  onBioChange?: (value: string) => void
}

const DescriptionField: React.FC<DescriptionFieldProps> = ({
  value,
  isEditable,
  isBioVariant,
  hasProject,
  onFieldChange,
  onBioChange,
}) => {
  const descriptionClass = isBioVariant 
    ? cn(styles.description, styles.bioDescription)
    : styles.description

  // Edit mode - show RichTextEditor
  if (isEditable && (isBioVariant || hasProject)) {
    const handleChange = isBioVariant
      ? (newValue: string) => onBioChange?.(newValue)
      : (newValue: string) => onFieldChange?.('description', newValue)

    return (
      <RichTextEditor
        value={value}
        onChange={handleChange}
        placeholder="Description"
        className={descriptionClass}
      />
    )
  }

  // View mode - show RichTextDisplay (only if has content)
  if (hasDescriptionContent(value)) {
    return (
      <RichTextDisplay
        content={value}
        className={descriptionClass}
      />
    )
  }

  return null
}

export interface ProjectContentProps {
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
    showTags?: boolean // Replaces showMetadata
    layout?: 'vertical' | 'horizontal' // V Card (vertical) or H Card (horizontal)
  }
  className?: string
  isEditable?: boolean
  variant?: 'project' | 'bio'
  onFieldChange?: (field: keyof Project, value: string | string[]) => void // Updated to support tags array
  onBioChange?: (value: string) => void
  onAddSlide?: () => void
  onSlideDescriptionChange?: (slideId: string, description: string) => void
  onMediaChange?: (files: File[]) => void
  onMediaDelete?: (index?: number) => void
  onAddEmptySlot?: () => void
  onSlideImageChange?: (slideId: string, files: File[]) => void
  onSlideImageDelete?: (slideId: string) => void
  onSlideDelete?: (slideId: string) => void
  onNavigateToSlide?: (index: number) => void
  uploadingStates?: Record<number | string, boolean> // Loading states for images/slides
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
  content = {
    showTitle: true,
    showDescription: true,
    showPhotoCarousel: true,
    showTags: true,
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
  onAddEmptySlot,
  onSlideImageChange,
  onSlideImageDelete,
  onSlideDelete,
  onNavigateToSlide,
  uploadingStates = {},
}) => {
  // Use project data if provided, otherwise use direct props
  const displayTitle = project?.title || title
  const displayDescription = project?.description || description
  const displayImages = project?.images || images || []
  const displayTags = project?.tags || []

  // Merge project content config with props
  const contentConfig = project?.content
    ? { ...content, ...project.content }
    : content

  // Determine layout: vertical (V Card) or horizontal (H Card)
  const layout = contentConfig.layout || 'vertical'
  const isHorizontal = layout === 'horizontal'
  
  // Detect "Big text" variant: title only, no description, no tags, no media
  const isBigText = contentConfig.showTitle && 
                    !contentConfig.showDescription && 
                    !contentConfig.showSingleImage && 
                    !contentConfig.showSlides && 
                    !contentConfig.showPhotoCarousel &&
                    !contentConfig.showTags &&
                    variant !== 'bio'

  // Memoize media content check for performance
  const hasSingleImageMedia = useMemo(
    () => hasSingleImageContent(project?.singleImage),
    [project?.singleImage]
  )

  // Check if there's any media content to show
  // In edit mode: show placeholder even if empty (so user can add media)
  // In view mode: only show if there's actual media
  const hasMediaContent = 
    (contentConfig.showSingleImage && (isEditable || hasSingleImageMedia)) ||
    (contentConfig.showSlides && project?.slides && project.slides.length > 0) ||
    (contentConfig.showPhotoCarousel && displayImages.length > 0)

  // Check if there's any text content to show
  const hasTextContent = 
    (contentConfig.showTitle && displayTitle) ||
    (contentConfig.showDescription && hasDescriptionContent(displayDescription)) ||
    (contentConfig.showTags && displayTags.length > 0)
  
  // In edit mode, always show text content section so user can add content
  const shouldShowTextContent = hasTextContent || (isEditable && (contentConfig.showTitle || contentConfig.showDescription || contentConfig.showTags))

  return (
    <div className={cn(
      styles.contentHolder,
      isHorizontal && styles.horizontal,
      !hasMediaContent && styles.noMediaGap,
      className
    )}>
      {/* Element 1: Text Content (Title, Description, Metadata) - Only render if there's content or in edit mode */}
      {shouldShowTextContent && (
        <div className={styles.textContent}>
        {/* Title */}
        {contentConfig.showTitle && (isEditable || displayTitle) && (
          isEditable && project ? (
            <EditableText
              value={displayTitle || ''}
              onChange={(value) => onFieldChange?.('title', value)}
              variant="h3"
              className={cn("font-bold", isBigText && styles.bigTextTitle)}
              as="div"
              placeholder="Title"
            />
          ) : displayTitle ? (
          <Typography variant="h3" className={cn("font-bold", isBigText && styles.bigTextTitle)}>
            {displayTitle}
          </Typography>
          ) : null
        )}

        {/* Description - Using RichTextEditor for formatting support */}
        {contentConfig.showDescription && (isEditable || hasDescriptionContent(displayDescription)) && (
          <DescriptionField
            value={displayDescription || ''}
            isEditable={isEditable}
            isBioVariant={variant === 'bio'}
            hasProject={!!project}
            onFieldChange={onFieldChange}
            onBioChange={onBioChange}
          />
        )}

        {/* Tags - Only render wrapper when there's content */}
        {contentConfig.showTags && (
          isEditable && project ? (
            <div className={styles.tags}>
              <TagInput
                tags={displayTags}
                onChange={(tags) => onFieldChange?.('tags', tags)}
              />
            </div>
          ) : displayTags.length > 0 ? (
            <div className={styles.tags}>
              <Tags tags={displayTags} />
            </div>
          ) : null
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
              onAddEmptySlot={onAddEmptySlot}
              uploadingStates={uploadingStates}
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
              uploadingStates={uploadingStates}
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

