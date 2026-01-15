'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Check, Plus, ArrowUp, ArrowDown } from 'lucide-react'
import { PLAN_NAMES, PLAN_PRICING, PLAN_LIMITS, getUpgradePath, getDowngradePath } from '@/lib/utils/features'
import { formatGB } from '@/lib/utils/features'
import { createCheckoutSession } from '@/lib/stripe/client'
import type { Plan } from '@/lib/firebase/types'
import styles from './PricingCard.module.scss'

interface PricingCardProps {
  plan: Plan
  className?: string
  billingPeriod?: 'monthly' | 'yearly' // Billing period selector
}

/**
 * Pricing card component
 * Displays a single pricing tier with features and action button
 */
export const PricingCard: React.FC<PricingCardProps> = ({ plan, className, billingPeriod = 'monthly' }) => {
  const router = useRouter()
  const { user, userData } = useAuth()
  const { plan: currentPlan } = useSubscription()
  const [loading, setLoading] = useState(false)
  const isCurrentPlan = plan === currentPlan
  const upgradePath = getUpgradePath(currentPlan)
  const downgradePath = getDowngradePath(currentPlan)

  const planName = PLAN_NAMES[plan]
  const pricing = PLAN_PRICING[plan]
  const limits = PLAN_LIMITS[plan]

  const handleAction = async () => {
    if (isCurrentPlan) {
      return // Already on this plan
    }

    // Base plan is free, no checkout needed
    if (plan === 'base') {
      return
    }

    // For paid plans, create Stripe checkout session
    if (!user?.uid || !userData?.email) {
      console.error('User not authenticated')
      return
    }

    try {
      setLoading(true)
      await createCheckoutSession(plan, billingPeriod, user.uid, userData.email)
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      alert(error.message || 'Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  const getActionLabel = () => {
    if (isCurrentPlan) return 'Current'
    
    // Determine if it's an upgrade or downgrade based on plan order
    const planOrder: Plan[] = ['base', 'mid', 'pro']
    const currentIndex = planOrder.indexOf(currentPlan)
    const targetIndex = planOrder.indexOf(plan)
    
    if (targetIndex > currentIndex) return 'Upgrade'
    if (targetIndex < currentIndex) return 'Downgrade'
    return 'Select Plan'
  }

  const getActionIcon = () => {
    if (isCurrentPlan) return null
    
    // Determine if it's an upgrade or downgrade based on plan order
    const planOrder: Plan[] = ['base', 'mid', 'pro']
    const currentIndex = planOrder.indexOf(currentPlan)
    const targetIndex = planOrder.indexOf(plan)
    
    if (targetIndex > currentIndex) return <ArrowUp size={16} />
    if (targetIndex < currentIndex) return <ArrowDown size={16} />
    return null
  }

  // Progressive feature display: show base features, then what each tier adds
  const getFeatures = () => {
    if (plan === 'base') {
      return [
        { text: 'Unlimited menu items', isAdditional: false },
        { text: 'Unlimited projects', isAdditional: false },
        { text: `${formatGB(limits.maxStorageGB)} storage`, isAdditional: false },
        { text: 'Public pages only', isAdditional: false },
      ]
    } else if (plan === 'mid') {
      return [
        { text: 'Everything from Base plan', isAdditional: false },
        { text: 'Password protection', isAdditional: true },
        { text: `${formatGB(limits.maxStorageGB)} total storage`, isAdditional: true },
      ]
    } else { // pro
      return [
        { text: 'Everything from Mid plan', isAdditional: false },
        { text: `${formatGB(limits.maxStorageGB)} total storage`, isAdditional: true },
        { text: 'Priority support', isAdditional: true },
      ]
    }
  }

  const features = getFeatures()

  return (
    <div className={`${styles.pricingCard} ${className || ''}`}>
      <div className={styles.header}>
        <Typography variant="h2" className={styles.planName}>
          {planName}
        </Typography>
        <div className={styles.priceRow}>
          <Typography variant="h3" className={styles.price}>
            {billingPeriod === 'monthly' ? pricing.monthly : pricing.yearly}
          </Typography>
        </div>
      </div>

      <div className={styles.features}>
        {features.map((feature, index) => {
          const Icon = feature.isAdditional ? Plus : Check
          return (
            <div key={index} className={styles.feature}>
              <Icon size={16} className={styles.checkIcon} />
              <Typography variant="body" className={styles.featureText}>
                {feature.text}
              </Typography>
            </div>
          )
        })}
      </div>

      <Button
        variant={isCurrentPlan ? 'medium' : 'high'}
        size="md"
        onClick={handleAction}
        className={styles.actionButton}
        disabled={isCurrentPlan || loading}
      >
        {loading ? 'Loading...' : getActionLabel()}
        {!loading && getActionIcon()}
      </Button>
    </div>
  )
}

