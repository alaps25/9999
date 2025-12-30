'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, Trash2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaAsset } from './MediaAsset'
import { CarouselSlide } from './CarouselSlide'
import { EditableText } from '@/components/ui/EditableText'
import { Button } from '@/components/ui/Button'
import { AddButton } from '@/components/ui/AddButton'
import type { Slide as SlideType } from '@/lib/firebase/types'
import styles from './MediaCarousel.module.scss'

export interface MediaCarouselProps {
  images?: string[]
  slides?: SlideType[]
  singleImage?: string | string[] // Can be single image URL or array of URLs for carousel
  variant?: 'single' | 'carousel' | 'slides'
  className?: string
  isEditable?: boolean
  onAddSlide?: () => void | Promise<void> // Can return a promise that resolves with the new slide index
  onNavigateToSlide?: (index: number) => void // Callback to navigate to a specific slide index
  onSlideDescriptionChange?: (slideId: string, description: string) => void
  onMediaChange?: (files: File[]) => void // Now accepts array of files
  onMediaDelete?: (index?: number) => void // Optional index to delete specific image (for carousel). If not provided, deletes all.
  onSlideImageChange?: (slideId: string, files: File[]) => void // Added for slide image upload
  onSlideImageDelete?: (slideId: string) => void // Added for slide image deletion
  onSlideDelete?: (slideId: string) => void // Added for deleting entire slide
  singleFileOnly?: boolean // If true, only allow single file selection (for slides)
  uploadingStates?: Record<number | string, boolean> // Loading states for images/slides: { [index]: boolean } or { [`slide-${slideId}`]: boolean }
}

/**
 * MediaCarousel component - Displays media (images, videos, GIFs) in different layouts
 * Supports three variants:
 * 1. Single media (image/video/gif, no carousel)
 * 2. Media carousel (multiple images/videos/gifs)
 * 3. Slides carousel (blocks with text and images/videos/gifs)
 */
export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  images,
  slides,
  singleImage,
  variant = 'carousel',
  className,
  isEditable = false,
  onAddSlide,
  onSlideDescriptionChange,
  onMediaChange,
  onMediaDelete,
  onSlideImageChange,
  onSlideImageDelete,
  onSlideDelete,
  singleFileOnly = false,
  onNavigateToSlide,
  uploadingStates = {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Hooks for single variant - must be at top level
  const [isHovered, setIsHovered] = useState(false)
  const [mediaIndex, setMediaIndex] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isPasteFocused, setIsPasteFocused] = useState(false)
  const singleFileInputRef = useRef<HTMLInputElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)
  
  // Track previous slides length to detect new slide additions (for slides variant)
  const prevSlidesLengthRef = useRef(slides?.length || 0)
  
  // Track previous singleImage array length to detect additions/deletions (for single variant)
  const prevSingleImageLengthRef = useRef(0)
  const currentMediaIndexRef = useRef(0)

  // Reset index when slides/images change
  useEffect(() => {
    setCurrentIndex(0)
  }, [slides, images, singleImage])
  
  // Sync mediaIndex with ref
  useEffect(() => {
    currentMediaIndexRef.current = mediaIndex
  }, [mediaIndex])
  
  // Adjust mediaIndex when singleImage array changes (for single variant)
  useEffect(() => {
    if (variant === 'single') {
      const mediaArray = Array.isArray(singleImage) ? singleImage : (singleImage ? [singleImage] : [])
      const currentLength = mediaArray.length
      const prevLength = prevSingleImageLengthRef.current
      const currentIndex = currentMediaIndexRef.current
      
      // If array length increased (new images added), navigate to the last image
      if (currentLength > prevLength && currentLength > 0) {
        setMediaIndex(currentLength - 1)
      }
      // If array length decreased (image was deleted), adjust index
      else if (currentLength < prevLength && currentLength > 0) {
        // If current index is out of bounds, go to last available image
        if (currentIndex >= currentLength) {
          setMediaIndex(currentLength - 1)
        }
      } else if (currentLength === 0) {
        // If all images deleted, reset to 0
        setMediaIndex(0)
      }
      
      prevSingleImageLengthRef.current = currentLength
    }
  }, [variant, singleImage])

  // Navigate to last slide when a new slide is added (for slides variant)
  useEffect(() => {
    if (variant === 'slides' && slides && slides.length > 0) {
      if (slides.length > prevSlidesLengthRef.current) {
        // New slide was added, navigate to it
        setCurrentIndex(slides.length - 1)
      }
      prevSlidesLengthRef.current = slides.length
    }
  }, [variant, slides])

  // Handle placeholder click for single image variant
  const handlePlaceholderClick = () => {
    if (isEditable && variant === 'single' && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle file selection (supports multiple files)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0 && onMediaChange) {
      // Validate file types (images, videos, GIFs)
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime',
      ]
      
      const validFiles = files.filter(file => validTypes.includes(file.type))
      
      if (validFiles.length > 0) {
        onMediaChange(validFiles)
      } else {
        alert('Please select valid image or video files')
      }
    }
    
    // Reset input so same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Variant 1: Single image/video/gif (or carousel if multiple)
  if (variant === 'single') {
    
    // Handle both single string and array of strings
    // Filter out empty strings and invalid URLs
    const mediaArray = Array.isArray(singleImage) 
      ? singleImage.filter(url => url && url.trim() !== '') 
      : (singleImage && singleImage.trim() !== '' ? [singleImage] : [])
    const hasMedia = mediaArray.length > 0 && mediaArray.some(url => url && url.trim() !== '')
    const isMultiple = mediaArray.length > 1
    const currentMedia = mediaArray[mediaIndex] || ''

    const goToPrevious = () => {
      if (mediaIndex > 0) {
        setMediaIndex((prev) => prev - 1)
      }
    }

    const goToNext = () => {
      if (mediaIndex < mediaArray.length - 1) {
        setMediaIndex((prev) => prev + 1)
      }
    }
    
    const isAtStart = mediaIndex === 0
    const isAtEnd = mediaIndex === mediaArray.length - 1

    const handleBrowseClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isEditable && singleFileInputRef.current) {
        singleFileInputRef.current.click()
      }
    }

    const handlePlaceholderClick = (e: React.MouseEvent) => {
      // Only focus if clicking the placeholder area itself, not the button
      if (isEditable && e.target === e.currentTarget) {
        setIsPasteFocused(true)
        placeholderRef.current?.focus()
      }
    }

    const handlePlaceholderBlur = () => {
      setIsPasteFocused(false)
    }

    // Handle paste event
    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (!isEditable || !onMediaChange || !isPasteFocused) return
      
      e.preventDefault()
      const items = Array.from(e.clipboardData.items)
      const imageItems = items.filter(item => item.type.startsWith('image/'))
      
      if (imageItems.length > 0) {
        const files: File[] = []
        let processedCount = 0
        
        imageItems.forEach((item) => {
          const file = item.getAsFile()
          if (file) {
            files.push(file)
            processedCount++
            
            // Process all files when done
            if (processedCount === imageItems.length) {
              processFiles(files)
              setIsPasteFocused(false)
            }
          }
        })
      }
    }

    // Handle Escape key to clear focus
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape' && isPasteFocused) {
        setIsPasteFocused(false)
        placeholderRef.current?.blur()
      }
    }

    const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      processFiles(files)
    }

    // Process files (used by both file input and drag-drop)
    const processFiles = (files: File[]) => {
      if (files.length > 0 && onMediaChange) {
        // Validate file types (images, videos, GIFs)
        const validTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/webm',
          'video/quicktime',
        ]
        
        const validFiles = files.filter(file => validTypes.includes(file.type))
        
        if (validFiles.length > 0) {
          // If singleFileOnly is true, only take the first file
          const filesToUse = singleFileOnly ? [validFiles[0]] : validFiles
          onMediaChange(filesToUse)
        } else {
          alert('Please select valid image or video files')
        }
      }
      
      // Reset input so same files can be selected again
      if (singleFileInputRef.current) {
        singleFileInputRef.current.value = ''
      }
    }

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (isEditable) {
        setIsDragOver(true)
      }
    }

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (isEditable) {
        setIsDragOver(true)
      }
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      // Only set drag over to false if we're leaving the drop zone
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragOver(false)
      }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      
      if (!isEditable || !onMediaChange) return
      
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        processFiles(files)
      }
    }

    return (
      <div className={cn(styles.carousel, styles.singleImage, className)}>
        <div 
          className={cn(
            styles.singleImageContainer,
            hasMedia && styles.hasMedia
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* File input for this variant */}
          <input
            ref={singleFileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple={!singleFileOnly}
            onChange={handleSingleFileChange}
            style={{ display: 'none' }}
          />
          
          {hasMedia ? (
            <>
              <div className={styles.mediaWrapper}>
                <MediaAsset
                  src={currentMedia}
                  alt={`Project media ${mediaIndex + 1}`}
                  priority={mediaIndex === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
                {uploadingStates[mediaIndex] && (
                  <div className={styles.uploadingOverlay}>
                    <div className={styles.uploadingSpinner}></div>
                    <div className={styles.uploadingText}>Uploading...</div>
                  </div>
                )}
              </div>
              
              {/* Bottom right button row: arrows (if multiple) + add + delete - show on hover */}
              {isHovered && (
                <div className={styles.bottomRightButtons}>
                  {/* Navigation arrows - only show if multiple */}
                  {isMultiple && (
                    <>
                      <Button
                        variant="medium"
                        size="md"
                        iconOnly
                        onClick={(e) => {
                          e.stopPropagation()
                          goToPrevious()
                        }}
                        aria-label="Previous media"
                        disabled={isAtStart}
                      >
                        <ArrowLeft size={16} />
                      </Button>
                      <Button
                        variant="medium"
                        size="md"
                        iconOnly
                        onClick={(e) => {
                          e.stopPropagation()
                          goToNext()
                        }}
                        aria-label="Next media"
                        disabled={isAtEnd}
                      >
                        <ArrowRight size={16} />
                      </Button>
                    </>
                  )}
                  {/* Action buttons - only show if editable */}
                  {isEditable && (
                    <>
                      {/* Add more media button - only show if not singleFileOnly */}
                      {onMediaChange && !singleFileOnly && (
                        <Button
                          variant="medium"
                          size="md"
                          iconOnly
                          onClick={(e) => {
                            e.stopPropagation()
                            if (singleFileInputRef.current) {
                              singleFileInputRef.current.click()
                            }
                          }}
                          aria-label="Add more media"
                        >
                          <Plus size={16} />
                        </Button>
                      )}
                      {onMediaDelete && (
                        <Button
                          variant="medium"
                          size="md"
                          iconOnly
                          onClick={(e) => {
                            e.stopPropagation()
                            // Pass current mediaIndex to delete only the current image
                            onMediaDelete(mediaIndex)
                          }}
                          aria-label="Delete media"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div 
              ref={placeholderRef}
              tabIndex={isEditable ? 0 : -1}
              className={cn(
                styles.placeholder, 
                isEditable && styles.placeholderClickable,
                isDragOver && styles.dragOver,
                isPasteFocused && styles.pasteFocused
              )}
              onClick={handlePlaceholderClick}
              onBlur={handlePlaceholderBlur}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={styles.placeholderContent}>
                <span className={styles.placeholderText}>
                  {isDragOver ? 'Drop files here' : isPasteFocused ? 'Ready for paste (Cmd+V)' : 'Drop/Paste media'}
                </span>
                {isEditable && (
                  <Button
                    variant="medium"
                    size="md"
                    onClick={handleBrowseClick}
                    className={styles.browseButton}
                  >
                    BROWSE
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Variant 3: Slides carousel
  if (variant === 'slides' && slides && slides.length > 0) {
    // Ensure currentIndex is within bounds
    const safeIndex = Math.max(0, Math.min(currentIndex, slides.length - 1))
    const currentSlide = slides[safeIndex]

    if (!currentSlide) {
      return null
    }

    const goToPrevious = () => {
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1)
      }
    }

    const goToNext = () => {
      if (currentIndex < slides.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      }
    }

    const goToSlide = (index: number) => {
      if (index >= 0 && index < slides.length) {
        setCurrentIndex(index)
      }
    }

    return (
      <div className={cn(styles.carousel, styles.slidesCarousel, className)}>
        <div className={styles.carouselContainer}>
          {/* Left Side: Slide Description + Navigation */}
          <div className={styles.leftContent}>
            <div className={styles.descriptionWrapper}>
              {currentSlide.description !== undefined && (
                isEditable ? (
                  <EditableText
                    value={currentSlide.description || ''}
                    onChange={(value) => onSlideDescriptionChange?.(currentSlide.id, value)}
                    variant="body"
                    className={styles.descriptionText}
                    as="div"
                  />
                ) : (
                  currentSlide.description && (
                <div className={styles.descriptionText}>{currentSlide.description}</div>
                  )
                )
              )}
            </div>
            
            {/* Navigation buttons at bottom left - always visible */}
            <div className={styles.navButtonsContainer}>
              <div className={styles.navButtons}>
                {/* Navigation arrows - only show if multiple slides */}
                {slides.length > 1 && (
                  <>
                    <Button
                      variant="medium"
                      size="md"
                      iconOnly
                      onClick={goToPrevious}
                      aria-label="Previous slide"
                      disabled={currentIndex === 0}
                    >
                      <ArrowLeft size={16} />
                    </Button>
                    <Button
                      variant="medium"
                      size="md"
                      iconOnly
                      onClick={goToNext}
                      aria-label="Next slide"
                      disabled={currentIndex === slides.length - 1}
                    >
                      <ArrowRight size={16} />
                    </Button>
                  </>
                )}
                {/* Add slide button - only show if editable */}
                {isEditable && onAddSlide && (
                  <Button
                    variant="medium"
                    size="md"
                    iconOnly
                    onClick={onAddSlide}
                    aria-label="Add slide"
                  >
                    <Plus size={16} />
                  </Button>
                )}
                {/* Delete slide button - only show if editable and more than one slide */}
                {isEditable && onSlideDelete && slides.length > 1 && (
                  <Button
                    variant="medium"
                    size="md"
                    iconOnly
                    onClick={() => onSlideDelete(currentSlide.id)}
                    aria-label="Delete slide"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Slide Media/Content Only - Use MediaCarousel single variant */}
          <div className={styles.rightContent}>
            <MediaCarousel
              singleImage={currentSlide.image || ''}
              variant="single"
              isEditable={isEditable}
              singleFileOnly={true}
              onMediaChange={(files) => onSlideImageChange?.(currentSlide.id, files)}
              onMediaDelete={() => onSlideImageDelete?.(currentSlide.id)}
              uploadingStates={{
                0: uploadingStates[`slide-${currentSlide.id}`] || false,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Variant 2: Image carousel (default)
  if (!images || images.length === 0) {
    return null
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className={cn(styles.carousel, className)}>
      <div className={styles.carouselContainer}>
        {/* Left Side: Navigation Only (no description for image carousel) */}
        <div className={styles.leftContent}>
          {/* Navigation Buttons */}
          {images.length > 1 && (
            <div className={styles.navButtons}>
              <Button
                variant="low"
                size="md"
                iconOnly
                onClick={goToPrevious}
                aria-label="Previous image"
                disabled={currentIndex === 0}
              >
                <ArrowLeft size={16} />
              </Button>
              <Button
                variant="low"
                size="md"
                iconOnly
                onClick={goToNext}
                aria-label="Next image"
                disabled={currentIndex === images.length - 1}
              >
                <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* Right Side: Media Only (image/video/gif) */}
        <div className={styles.rightContent}>
          <div className={styles.imageContainer}>
            <MediaAsset
              src={images[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              priority={currentIndex === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

