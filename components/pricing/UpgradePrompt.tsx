'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { ArrowUp, X } from 'lucide-react'
import { getUpgradePath, PLAN_NAMES } from '@/lib/utils/features'
import type { FeatureLimits } from '@/lib/utils/features'
import styles from './UpgradePrompt.module.scss'

interface UpgradePromptProps {
  feature: keyof FeatureLimits
  message?: string
  onDismiss?: () => void
  showDismiss?: boolean
}

/**
 * Upgrade prompt component
 * Shows when user tries to access a premium feature
 */
export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  message,
  onDismiss,
  showDismiss = false,
}) => {
  const router = useRouter()
  const { plan } = useSubscription()
  const upgradePath = getUpgradePath(plan)

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const defaultMessage = message || `Upgrade to ${upgradePath ? PLAN_NAMES[upgradePath] : 'Pro'} plan to access this feature.`

  return (
    <div className={styles.upgradePrompt}>
      {showDismiss && onDismiss && (
        <button className={styles.dismissButton} onClick={onDismiss}>
          <X size={16} />
        </button>
      )}
      <div className={styles.content}>
        <Typography variant="body" className={styles.message}>
          {defaultMessage}
        </Typography>
        {upgradePath && (
          <Button
            variant="high"
            size="md"
            onClick={handleUpgrade}
            className={styles.upgradeButton}
          >
            UPGRADE
            <ArrowUp size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}

