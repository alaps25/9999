'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { MediaAsset } from './MediaAsset'
import { CustomSlideContent } from './CustomSlideContent'
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
}

/**
 * CarouselSlide component - A single slide in a carousel
 * Can display either media (image/video/gif) or custom interactive content
 */
export const CarouselSlide: React.FC<CarouselSlideProps> = ({ slide, className }) => {
  const [mounted, setMounted] = useState(false)

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

  // Otherwise render media-based slide
  if (!slide.image) {
    return null
  }

  // Right side only shows media/content, no text
  return (
    <div className={cn(styles.slide, className)}>
      <div className={styles.slideImage}>
        <MediaAsset
          src={slide.image}
          alt={slide.title || `Slide ${slide.id}`}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  )
}

