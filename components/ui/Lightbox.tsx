'use client'

import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { getMediaType } from '@/lib/utils/media'
import styles from './Lightbox.module.scss'

export interface LightboxProps {
  isOpen: boolean
  onClose: () => void
  media: string[]
  initialIndex?: number
  currentIndex: number
  onIndexChange: (index: number) => void
}

/**
 * Lightbox component - Fullscreen media viewer
 * Opens media in a fullscreen overlay with navigation
 */
export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
  currentIndex,
  onIndexChange,
}) => {
  const hasMultiple = media.length > 1
  const isAtStart = currentIndex === 0
  const isAtEnd = currentIndex === media.length - 1
  const currentMedia = media[currentIndex] || ''
  const mediaType = getMediaType(currentMedia)

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1)
    }
  }, [currentIndex, onIndexChange])

  const goToNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      onIndexChange(currentIndex + 1)
    }
  }, [currentIndex, media.length, onIndexChange])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, goToPrevious, goToNext])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Don't render on server
  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.lightbox}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className={styles.backdrop} onClick={onClose} />

          {/* Close button */}
          <div className={styles.closeButton}>
            <Button
              variant="medium"
              size="md"
              iconOnly
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Navigation - Previous */}
          {hasMultiple && (
            <div className={cn(styles.navButton, styles.navPrevious)}>
              <Button
                variant="medium"
                size="md"
                iconOnly
                onClick={goToPrevious}
                disabled={isAtStart}
                aria-label="Previous"
              >
                <ArrowLeft size={20} />
              </Button>
            </div>
          )}

          {/* Media container */}
          <motion.div
            className={styles.mediaContainer}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {mediaType === 'video' ? (
              <video
                key={currentMedia}
                src={currentMedia}
                className={styles.media}
                controls
                autoPlay
                loop
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={currentMedia}
                src={currentMedia}
                alt={`Media ${currentIndex + 1}`}
                className={styles.media}
              />
            )}
          </motion.div>

          {/* Navigation - Next */}
          {hasMultiple && (
            <div className={cn(styles.navButton, styles.navNext)}>
              <Button
                variant="medium"
                size="md"
                iconOnly
                onClick={goToNext}
                disabled={isAtEnd}
                aria-label="Next"
              >
                <ArrowRight size={20} />
              </Button>
            </div>
          )}

          {/* Counter */}
          {hasMultiple && (
            <div className={styles.counter}>
              {currentIndex + 1} / {media.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
