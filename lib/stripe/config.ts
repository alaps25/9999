/**
 * Stripe configuration
 * Make sure to set these environment variables:
 * - STRIPE_SECRET_KEY (server-side)
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (client-side)
 * - STRIPE_WEBHOOK_SECRET (for webhooks)
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables')
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

/**
 * Stripe Price IDs for each plan
 * These should match the Price IDs from your Stripe Dashboard
 * Format: { plan: { monthly: 'price_xxx', yearly: 'price_xxx' } }
 */
export const STRIPE_PRICE_IDS: Record<string, { monthly: string; yearly: string }> = {
  mid: {
    monthly: process.env.STRIPE_MID_MONTHLY_PRICE_ID || '',
    yearly: process.env.STRIPE_MID_YEARLY_PRICE_ID || '',
  },
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
  },
}

/**
 * Get Stripe Price ID for a plan and billing period
 */
export function getPriceId(plan: 'mid' | 'pro', billingPeriod: 'monthly' | 'yearly'): string | null {
  const priceId = STRIPE_PRICE_IDS[plan]?.[billingPeriod]
  return priceId && priceId.trim() !== '' ? priceId : null
}
