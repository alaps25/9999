'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import styles from './StorageLimitDialog.module.scss'

interface StorageLimitDialogProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * StorageLimitDialog - Native dialog shown when user tries to add content but storage limit is reached
 */
export const StorageLimitDialog: React.FC<StorageLimitDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  const handleViewPlans = () => {
    onClose()
    router.push('/pricing')
  }

  const handleCancel = () => {
    onClose()
  }

  // Handle ESC key to close
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === dialogRef.current) {
          onClose()
        }
      }}
    >
      <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
        <Typography variant="h2" className={styles.title}>
          Storage limit reached
        </Typography>
        
        <Typography variant="body" className={styles.message}>
          You&apos;ve reached your storage limit. Upgrade your plan to continue uploading images and adding projects.
        </Typography>

        <div className={styles.actions}>
          <Button
            variant="medium"
            size="md"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            variant="high"
            size="md"
            onClick={handleViewPlans}
          >
            View plans
          </Button>
        </div>
      </div>
    </dialog>
  )
}
