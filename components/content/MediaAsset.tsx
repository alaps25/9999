'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getMediaType } from '@/lib/utils/media'
import styles from './MediaAsset.module.scss'

export interface MediaAssetProps {
  src: string
  alt?: string
  className?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
}

/**
 * MediaAsset component - Renders individual media items (images, videos, or GIFs)
 * Automatically detects media type from URL and renders the appropriate element
 */
export const MediaAsset: React.FC<MediaAssetProps> = ({
  src,
  alt = 'Media',
  className,
  fill = true,
  priority = false,
  sizes,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const mediaType = getMediaType(src)
  
  // Reset loading state when src changes
  useEffect(() => {
    setIsLoading(true)
  }, [src])

  // Render video
  if (mediaType === 'video') {
    return (
      <div className={styles.mediaWrapper}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
          </div>
        )}
        <video
          src={src}
          className={cn(styles.media, styles.video, className)}
          controls
          loop
          muted
          playsInline
          autoPlay
          style={fill ? { position: 'absolute', inset: 0 } : undefined}
          onLoadedData={() => setIsLoading(false)}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  // Render GIF or image
  return (
    <div className={styles.mediaWrapper}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={cn(styles.media, styles.image, isLoading && styles.imageLoading, className)}
        priority={priority}
        sizes={sizes}
        unoptimized={mediaType === 'gif'}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}

