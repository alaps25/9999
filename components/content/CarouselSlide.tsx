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
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Handle placeholder click
  const handlePlaceholderClick = () => {
    if (isEditable && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
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
        onImageChange(validFiles)
      } else {
        alert('Please select valid image or video files')
      }
    }
    
    // Reset input so same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
              className={cn(styles.placeholder, isEditable && styles.placeholderClickable)}
              onClick={handlePlaceholderClick}
            >
              <span className={styles.placeholderText}>Add media</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

