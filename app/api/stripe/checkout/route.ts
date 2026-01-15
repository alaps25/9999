import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPriceId } from '@/lib/stripe/config'
import { getAdminAuth } from '@/lib/firebase/admin'
import type { Plan } from '@/lib/firebase/types'

/**
 * POST /api/stripe/checkout
 * Creates a Stripe checkout session for plan subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize Firebase Admin Auth
    const auth = getAdminAuth()

    // Get request body
    const body = await request.json()
    const { plan, billingPeriod, userId, userEmail } = body

    // Validate inputs
    if (!plan || !billingPeriod || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: plan, billingPeriod, userId, userEmail' },
        { status: 400 }
      )
    }

    if (plan === 'base') {
      return NextResponse.json(
        { error: 'Base plan is free and does not require checkout' },
        { status: 400 }
      )
    }

    if (billingPeriod !== 'monthly' && billingPeriod !== 'yearly') {
      return NextResponse.json(
        { error: 'billingPeriod must be "monthly" or "yearly"' },
        { status: 400 }
      )
    }

    // Get price ID for the plan and billing period
    const priceId = getPriceId(plan, billingPeriod)
    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not found for plan: ${plan}, billingPeriod: ${billingPeriod}` },
        { status: 400 }
      )
    }

    // Create or get Stripe customer
    let customerId: string | undefined

    // Check if user already has a Stripe customer ID in Firebase
    const userRecord = await auth.getUser(userId)
    const customClaims = userRecord.customClaims || {}
    const existingCustomerId = customClaims.stripeCustomerId as string | undefined

    if (existingCustomerId) {
      // Verify customer exists in Stripe (handles test/live mode mismatch)
      try {
        await stripe.customers.retrieve(existingCustomerId)
        customerId = existingCustomerId
      } catch (error: any) {
        // Customer doesn't exist (e.g., from test mode, now in live mode)
        console.warn(`Customer ${existingCustomerId} not found in Stripe, creating new customer`)
        // Create new customer
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            firebaseUserId: userId,
          },
        })
        customerId = customer.id

        // Update Firebase with new customer ID
        await auth.setCustomUserClaims(userId, {
          ...customClaims,
          stripeCustomerId: customerId,
        })
      }
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUserId: userId,
        },
      })
      customerId = customer.id

      // Save customer ID to Firebase user custom claims
      await auth.setCustomUserClaims(userId, {
        ...customClaims,
        stripeCustomerId: customerId,
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin') || ''}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin') || ''}/pricing/cancel`,
      metadata: {
        firebaseUserId: userId,
        plan: plan,
        billingPeriod: billingPeriod,
      },
      subscription_data: {
        metadata: {
          firebaseUserId: userId,
          plan: plan,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

