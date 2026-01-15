'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { PricingCard } from '@/components/pricing/PricingCard'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { getMenuItems } from '@/lib/firebase/queries'
import { getSecondaryMenuItems } from '@/lib/utils/navigation'
import type { MenuItem } from '@/lib/firebase/types'
import { getPortfolioUrl, shareUrl } from '@/lib/utils/share'
import styles from './page.module.scss'

function PricingContent() {
  const { user, userData } = useAuth()
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [billingPeriod, setBillingPeriod] = React.useState<'monthly' | 'yearly'>('monthly')

  React.useEffect(() => {
    async function loadMenuItems() {
      if (!user?.uid) {
        setLoading(false)
        return
      }
      try {
        const items = await getMenuItems(user.uid)
        setMenuItems(items)
      } catch (error) {
        console.error('Error loading menu items:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMenuItems()
  }, [user?.uid])

  const handleShareClick = async () => {
    if (!userData?.username) return
    const portfolioUrl = getPortfolioUrl(userData.username)
    await shareUrl(portfolioUrl, `Check out ${userData.username}'s portfolio`)
  }

  // Generate hrefs for menu items using username
  const menuItemsWithHrefs = menuItems.map(item => ({
    ...item,
    href: userData?.username ? `/${userData.username}/${item.slug || 'page'}` : '#',
  }))

  // Secondary menu items
  const secondaryMenuItems = getSecondaryMenuItems(handleShareClick, '/pricing')

  if (loading) {
    return (
      <div className={styles.page}>
        <Sidebar menuItems={[]} secondaryMenuItems={secondaryMenuItems} />
        <MainContent>
          <div className={styles.settingsContainer}>
            <div>Loading...</div>
          </div>
        </MainContent>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Sidebar menuItems={menuItemsWithHrefs} secondaryMenuItems={secondaryMenuItems} />
      <MainContent>
        <div className={styles.settingsContainer}>
          <div className={styles.section}>
            <Typography variant="h1" className={styles.settingsTitle}>
              Pricing
            </Typography>

            {/* Billing Period Selector */}
            <div className={styles.billingSelector}>
              <Button
                variant={billingPeriod === 'monthly' ? 'high' : 'medium'}
                size="md"
                onClick={() => setBillingPeriod('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={billingPeriod === 'yearly' ? 'high' : 'medium'}
                size="md"
                onClick={() => setBillingPeriod('yearly')}
              >
                Yearly
              </Button>
            </div>

            <div className={styles.cards}>
              <PricingCard plan="base" billingPeriod={billingPeriod} />
              <PricingCard plan="mid" billingPeriod={billingPeriod} />
              <PricingCard plan="pro" billingPeriod={billingPeriod} />
            </div>
          </div>
        </div>
      </MainContent>
    </div>
  )
}

export default function PricingPage() {
  return (
    <ProtectedRoute>
      <PricingContent />
    </ProtectedRoute>
  )
}

