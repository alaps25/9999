'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import styles from './page.module.scss'

/**
 * Pricing cancel page
 * Shown when user cancels Stripe checkout
 */
export default function PricingCancelPage() {
  const router = useRouter()

  return (
    <div className={styles.container}>
      <div className={styles.cancelCard}>
        <Typography variant="h1" className={styles.title}>
          Checkout Cancelled
        </Typography>
        <Typography variant="body" className={styles.message}>
          Your checkout was cancelled. No charges were made.
        </Typography>
        <div className={styles.actions}>
          <Button
            variant="high"
            size="md"
            onClick={() => router.push('/pricing')}
          >
            Back to Pricing
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
