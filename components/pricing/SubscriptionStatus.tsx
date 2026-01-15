'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import { useStorageUsage } from '@/hooks/useStorageUsage'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { StorageUsage } from './StorageUsage'
import { PLAN_NAMES, PLAN_PRICING } from '@/lib/utils/features'
import { createPortalSession } from '@/lib/stripe/client'
import { CreditCard, ArrowRight, Check, Crown, HardDrive, Receipt } from 'lucide-react'
import styles from './SubscriptionStatus.module.scss'

interface SubscriptionStatusProps {
  className?: string
}

/**
 * Subscription status component
 * Shows current plan, storage usage, and management options
 * Designed to match inline settings row pattern
 */
export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ className }) => {
  const router = useRouter()
  const { user } = useAuth()
  const { subscription, plan, loading } = useSubscription()
  const storageUsage = useStorageUsage()
  const [portalLoading, setPortalLoading] = useState(false)

  if (loading) {
    return (
      <div className={className}>
        <Typography variant="caption">Loading plan...</Typography>
      </div>
    )
  }

  const planName = PLAN_NAMES[plan]
  const pricing = PLAN_PRICING[plan]
  const isPaidPlan = plan !== 'base'

  const handleViewPlans = () => {
    router.push('/pricing')
  }

  const handleManageBilling = async () => {
    if (!user?.uid) {
      console.error('User not authenticated')
      return
    }

    try {
      setPortalLoading(true)
      await createPortalSession(user.uid)
    } catch (error: any) {
      console.error('Error creating portal session:', error)
      alert(error.message || 'Failed to open billing portal. Please try again.')
      setPortalLoading(false)
    }
  }

  return (
    <div className={className}>
      <div className={styles.settingsGroup}>
        {/* Plan Row */}
        <div className={styles.settingItem}>
          <Button variant="medium" size="md">
            <Crown size={16} />
            YOUR PLAN
          </Button>
          <Button variant="medium" size="md" className={styles.planNameButton}>
            <Check size={16} />
            {planName.toUpperCase()} {plan === 'base' ? '[FREE]' : ''}
          </Button>
          <Button
            variant="high"
            size="md"
            onClick={handleViewPlans}
            className={styles.viewPlansButton}
          >
            VIEW PLANS
            <ArrowRight size={16} />
          </Button>
        </div>

        {/* Storage Row */}
        <div className={styles.settingItem}>
          <Button variant="medium" size="md">
            <HardDrive size={16} />
            STORAGE
          </Button>
          <div className={styles.storageContent}>
            <StorageUsage showLabel={false} showProgressBar />
          </div>
        </div>

        {/* Manage Billing Row (only for paid plans) */}
        {isPaidPlan && (
          <div className={styles.settingItem}>
            <Button variant="medium" size="md">
              <Receipt size={16} />
              BILLING
            </Button>
            <Button
              variant="medium"
              size="md"
              onClick={handleManageBilling}
              disabled={portalLoading}
              className={styles.manageBillingButton}
            >
              {portalLoading ? 'Loading...' : 'MANAGE BILLING'}
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

