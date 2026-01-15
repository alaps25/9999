/**
 * Client-side Stripe utilities
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

/**
 * Get Stripe instance (client-side)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

/**
 * Create checkout session and redirect to Stripe
 */
export async function createCheckoutSession(
  plan: 'mid' | 'pro',
  billingPeriod: 'monthly' | 'yearly',
  userId: string,
  userEmail: string
): Promise<void> {
  try {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan,
        billingPeriod,
        userId,
        userEmail,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      const errorMessage = error.error || 'Failed to create checkout session'
      console.error('Checkout API error:', errorMessage, error)
      throw new Error(errorMessage)
    }

    const { url } = await response.json()

    if (url) {
      window.location.href = url
    } else {
      throw new Error('No checkout URL returned')
    }
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

/**
 * Create customer portal session and redirect
 */
export async function createPortalSession(userId: string): Promise<void> {
  try {
    const response = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create portal session')
    }

    const { url } = await response.json()

    if (url) {
      window.location.href = url
    } else {
      throw new Error('No portal URL returned')
    }
  } catch (error: any) {
    console.error('Error creating portal session:', error)
    throw error
  }
}
