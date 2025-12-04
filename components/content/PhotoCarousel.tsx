'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { MediaDisplay } from './MediaDisplay'
import { Slide } from './Slide'
import type { Slide as SlideType } from '@/lib/firebase/types'
import styles from './PhotoCarousel.module.scss'

export interface PhotoCarouselProps {
  images?: string[]
  slides?: SlideType[]
  singleImage?: string
  variant?: 'single' | 'carousel' | 'slides'
  className?: string
}

/**
 * PhotoCarousel component - Supports three variants:
 * 1. Single media (image/video/gif, no carousel)
 * 2. Media carousel (multiple images/videos/gifs)
 * 3. Slides carousel (blocks with text and images/videos/gifs)
 */
export const PhotoCarousel: React.FC<PhotoCarouselProps> = ({
  images,
  slides,
  singleImage,
  variant = 'carousel',
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Reset index when slides/images change
  useEffect(() => {
    setCurrentIndex(0)
  }, [slides, images, singleImage])

  // Variant 1: Single image/video/gif (no carousel)
  if (variant === 'single' && singleImage) {
    return (
      <div className={cn(styles.carousel, styles.singleImage, className)}>
        <div className={styles.singleImageContainer}>
          <MediaDisplay
            src={singleImage}
            alt="Project media"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
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
              {currentSlide.description && (
                <div className={styles.descriptionText}>{currentSlide.description}</div>
              )}
            </div>
            
            {/* Navigation Buttons - Always at bottom */}
            {slides.length > 1 && (
              <div className={styles.navButtons}>
                <Button
                  variant="low"
                  size="md"
                  iconOnly
                  onClick={goToPrevious}
                  aria-label="Previous slide"
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft size={16} />
                </Button>
                <Button
                  variant="low"
                  size="md"
                  iconOnly
                  onClick={goToNext}
                  aria-label="Next slide"
                  disabled={currentIndex === slides.length - 1}
                >
                  <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </div>

          {/* Right Side: Slide Image/Content Only */}
          <div className={styles.rightContent}>
            <Slide slide={currentSlide} />
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
            <MediaDisplay
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

