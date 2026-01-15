'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserSettings } from '@/lib/firebase/queries'
import type { Plan, Subscription } from '@/lib/firebase/types'
import { getUserPlanLimits, canUserAccessFeature, getStorageLimitBytes } from '@/lib/utils/features'
import type { FeatureLimits } from '@/lib/utils/features'

interface UseSubscriptionReturn {
  subscription: Subscription | null
  plan: Plan
  limits: FeatureLimits
  loading: boolean
  canAccessFeature: (feature: keyof FeatureLimits) => boolean
  storageLimitBytes: number
}

/**
 * Hook to get user subscription and plan information
 * Defaults to 'base' plan if no subscription exists
 */
export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plan, setPlan] = useState<Plan>('base')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSubscription() {
      if (!user?.uid) {
        setPlan('base')
        setSubscription(null)
        setLoading(false)
        return
      }

      try {
        const settings = await getUserSettings(user.uid)
        if (settings?.subscription) {
          setSubscription(settings.subscription)
          setPlan(settings.subscription.plan)
        } else {
          // Default to base plan
          setPlan('base')
          setSubscription({
            status: 'active',
            plan: 'base',
          })
        }
      } catch (error) {
        console.error('Error loading subscription:', error)
        // Default to base plan on error
        setPlan('base')
        setSubscription({
          status: 'active',
          plan: 'base',
        })
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [user?.uid])

  const limits = getUserPlanLimits(plan)
  const storageLimitBytes = getStorageLimitBytes(plan)

  return {
    subscription,
    plan,
    limits,
    loading,
    canAccessFeature: (feature: keyof FeatureLimits) => canUserAccessFeature(plan, feature),
    storageLimitBytes,
  }
}

