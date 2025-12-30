'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { MediaAsset } from './MediaAsset'
import { CustomSlideContent } from './CustomSlideContent'
import { Button } from '@/components/ui/Button'
import { Trash2 } from 'lucide-react'
import styles from './CarouselSlide.module.scss'

export interface CarouselSlideProps {
  slide: {
    id: string
    image?: string
    title?: string
    description?: string
    useCustomContent?: boolean
  }
  className?: string
  isEditable?: boolean
  onImageChange?: (files: File[]) => void
  onImageDelete?: () => void
}

/**
 * CarouselSlide component - A single slide in a carousel
 * Can display either media (image/video/gif) or custom interactive content
 * Supports placeholder for image upload when no image is present
 */
export const CarouselSlide: React.FC<CarouselSlideProps> = ({ 
  slide, 
  className,
  isEditable = false,
  onImageChange,
  onImageDelete,
}) => {
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isPasteFocused, setIsPasteFocused] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // If useCustomContent is true, render the custom slide content
  if (slide.useCustomContent) {
    return (
      <div className={cn(styles.slide, styles.customSlide, className)}>
        <CustomSlideContent />
      </div>
    )
  }

  const handleBrowseClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isEditable && fileInputRef.current) {
      fileInputRef.current.click()
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
    if (!isEditable || !onImageChange || !isPasteFocused) return
    
    e.preventDefault()
    const items = Array.from(e.clipboardData.items)
    const imageItems = items.filter(item => item.type.startsWith('image/'))
    
    if (imageItems.length > 0) {
      const file = imageItems[0].getAsFile()
      if (file) {
        processFiles([file])
        setIsPasteFocused(false)
      }
    }
  }

  // Handle Escape key to clear focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && isPasteFocused) {
      setIsPasteFocused(false)
      placeholderRef.current?.blur()
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  // Process files (used by both file input and drag-drop)
  const processFiles = (files: File[]) => {
    if (files.length > 0 && onImageChange) {
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
        // CarouselSlide only accepts single file, take first
        onImageChange([validFiles[0]])
      } else {
        alert('Please select valid image or video files')
      }
    }
    
    // Reset input so same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
    
    if (!isEditable || !onImageChange) return
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFiles(files)
    }
  }

  const hasImage = !!slide.image

  // Right side shows media/content with placeholder support
  return (
    <div className={cn(styles.slide, className)}>
      <div 
        className={cn(
          styles.slideImage,
          hasImage && styles.hasImage
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple={false}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {hasImage ? (
          <>
            <MediaAsset
              src={slide.image!}
              alt={slide.title || `Slide ${slide.id}`}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            
            {/* Delete button on hover - only show if editable */}
            {isHovered && isEditable && onImageDelete && (
              <div className={styles.slideImageButtons}>
                <Button
                  variant="medium"
                  size="md"
                  iconOnly
                  onClick={(e) => {
                    e.stopPropagation()
                    onImageDelete()
                  }}
                  aria-label="Delete image"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple={false}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
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
                  {isDragOver ? 'Drop file here' : isPasteFocused ? 'Ready for paste (Cmd+V)' : 'Drop/Paste media'}
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
          </>
        )}
      </div>
    </div>
  )
}

