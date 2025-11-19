'use client'

import React from 'react'
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
  const mediaType = getMediaType(src)

  // Render video
  if (mediaType === 'video') {
    return (
      <video
        src={src}
        className={cn(styles.media, styles.video, className)}
        controls
        loop
        muted
        playsInline
        autoPlay
        style={fill ? { position: 'absolute', inset: 0 } : undefined}
      >
        Your browser does not support the video tag.
      </video>
    )
  }

  // Render GIF or image
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={cn(styles.media, styles.image, className)}
      priority={priority}
      sizes={sizes}
      unoptimized={mediaType === 'gif'} // Don't optimize GIFs to preserve animation
    />
  )
}

