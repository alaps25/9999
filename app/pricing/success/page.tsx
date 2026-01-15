'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Check } from 'lucide-react'
import styles from './page.module.scss'

/**
 * Pricing success page
 * Shown after successful Stripe checkout
 */
export default function PricingSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (sessionId) {
      // Subscription will be activated via webhook
      // Just show success message
      setLoading(false)
    } else {
      // No session ID, redirect to pricing
      router.push('/pricing')
    }
  }, [searchParams, router])

  if (loading) {
    return (
      <div className={styles.container}>
        <Typography variant="body">Loading...</Typography>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.icon}>
          <Check size={48} />
        </div>
        <Typography variant="h1" className={styles.title}>
          Payment Successful!
        </Typography>
        <Typography variant="body" className={styles.message}>
          Your subscription has been activated. You can now access all features of your plan.
        </Typography>
        <div className={styles.actions}>
          <Button
            variant="high"
            size="md"
            onClick={() => router.push('/settings')}
          >
            Go to Settings
          </Button>
          <Button
            variant="medium"
            size="md"
            onClick={() => router.push('/')}
          >
            Back to Portfolio
          </Button>
        </div>
      </div>
    </div>
  )
}
