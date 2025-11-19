'use client'

import React from 'react'
import Image from 'next/image'
import styles from './CustomSlideContent.module.scss'

/**
 * CustomSlideContent component - Custom interactive slide content
 * Displays custom UI elements like the blue connection discovery interface
 * with avatars, buttons, and interactive elements
 */
export const CustomSlideContent: React.FC = () => {
  // Mock avatars - in real app these would come from props/data
  const avatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  ]

  return (
    <div className={styles.slideContent}>
      {/* Top Avatar */}
      <div className={styles.topAvatar}>
        <Image
          src={avatars[0]}
          alt="Profile"
          width={60}
          height={60}
          className={styles.avatarImage}
        />
      </div>

      {/* Discovering Connections Button */}
      <button className={styles.discoverButton}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={styles.buttonIcon}
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span>Discovering connections</span>
      </button>

      {/* Avatar Grid */}
      <div className={styles.avatarGrid}>
        {avatars.slice(1).map((avatar, index) => (
          <div key={index} className={styles.avatarWrapper}>
            <Image
              src={avatar}
              alt={`Avatar ${index + 2}`}
              width={40}
              height={40}
              className={styles.avatarImage}
            />
            {/* Overlay icons for some avatars */}
            {index === 1 && (
              <div className={styles.overlayIcon}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            )}
            {index === 3 && (
              <div className={styles.overlayIcon}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
            )}
            {index === 5 && (
              <div className={styles.overlayBadge}>2</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

