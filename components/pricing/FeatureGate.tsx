'use client'

import React from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { UpgradePrompt } from './UpgradePrompt'
import { PLAN_LIMITS } from '@/lib/utils/features'
import type { FeatureLimits } from '@/lib/utils/features'

interface FeatureGateProps {
  feature: keyof FeatureLimits
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
}

/**
 * Feature gate component
 * Wraps premium features and shows upgrade prompt if user doesn't have access
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}) => {
  const { canAccessFeature, loading } = useSubscription()

  if (loading) {
    return null
  }

  if (canAccessFeature(feature)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showUpgradePrompt) {
    // Determine which plan has this feature by checking plan limits
    let requiredPlan: 'mid' | 'pro' = 'pro'
    const midHasFeature = PLAN_LIMITS.mid[feature] === true || 
      (typeof PLAN_LIMITS.mid[feature] === 'number' && PLAN_LIMITS.mid[feature] > 0)
    if (midHasFeature) {
      requiredPlan = 'mid'
    }
    
    return (
      <UpgradePrompt
        feature={feature}
        message={`This feature requires a ${requiredPlan === 'mid' ? 'Mid' : 'Pro'} plan.`}
      />
    )
  }

  return null
}

