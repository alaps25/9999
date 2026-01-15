'use client'

import React from 'react'
import { useStorageUsage } from '@/hooks/useStorageUsage'
import { Typography } from '@/components/ui/Typography'
import styles from './StorageUsage.module.scss'

interface StorageUsageProps {
  showLabel?: boolean
  showProgressBar?: boolean
  className?: string
}

/**
 * Storage usage indicator component
 * Shows current storage usage with progress bar
 */
export const StorageUsage: React.FC<StorageUsageProps> = ({
  showLabel = true,
  showProgressBar = true,
  className,
}) => {
  const { usedFormatted, limitFormatted, percentage, loading } = useStorageUsage()

  if (loading) {
    return (
      <div className={className}>
        <Typography variant="caption">Loading...</Typography>
      </div>
    )
  }

  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100

  return (
    <div className={`${className} ${!showLabel ? styles.inlineLayout : ''}`}>
      {showLabel && (
        <div className={styles.labelRow}>
          <Typography variant="caption" className={styles.label}>
            Storage
          </Typography>
          <div className={styles.usageText}>
            <span className={`${styles.usedText} ${isAtLimit ? styles.atLimit : ''} ${isNearLimit ? styles.nearLimit : ''}`}>
              {usedFormatted}
            </span>
            <span className={styles.separator}> / </span>
            <span className={styles.limitText}>
              {limitFormatted}
            </span>
          </div>
        </div>
      )}
      {showProgressBar && (
        <div className={styles.progressBarContainer}>
          <div 
            className={`${styles.progressBar} ${isAtLimit ? styles.atLimit : ''} ${isNearLimit ? styles.nearLimit : ''}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
          <div 
            className={styles.remainingBar}
            style={{ width: `${Math.max(100 - percentage, 0)}%` }}
          />
        </div>
      )}
      {!showLabel && (
        <div className={styles.usageText}>
          <span className={`${styles.usedText} ${isAtLimit ? styles.atLimit : ''} ${isNearLimit ? styles.nearLimit : ''}`}>
            {usedFormatted}
          </span>
          <span className={styles.separator}> / </span>
          <span className={styles.limitText}>
            {limitFormatted}
          </span>
        </div>
      )}
    </div>
  )
}

