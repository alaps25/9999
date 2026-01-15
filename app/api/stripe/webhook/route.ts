import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config'
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin'
import type { Subscription, Plan } from '@/lib/firebase/types'
import Stripe from 'stripe'

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 */
export async function POST(request: NextRequest) {
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Initialize Firebase Admin Auth
  const auth = getAdminAuth()

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session, auth)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription, auth)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription, auth)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice, auth)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle checkout.session.completed event
 * Activate subscription when payment succeeds
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  auth: ReturnType<typeof getAdminAuth>
) {
  const userId = session.metadata?.firebaseUserId
  const plan = session.metadata?.plan as Plan

  if (!userId || !plan) {
    console.error('Missing metadata in checkout session:', session.id)
    return
  }

  const subscriptionId = session.subscription as string
  const customerId = session.customer as string

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Update user subscription in Firebase
  const subscriptionData: Subscription = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    plan: plan,
    status: mapStripeStatusToSubscriptionStatus(subscription.status),
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
  }

  await updateUserSubscription(userId, subscriptionData)

  // Update Firebase custom claims
  const userRecord = await auth.getUser(userId)
  const customClaims = userRecord.customClaims || {}
  await auth.setCustomUserClaims(userId, {
    ...customClaims,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    plan: plan,
  })

  console.log(`Subscription activated for user ${userId}: ${plan}`)
}

/**
 * Handle customer.subscription.updated event
 * Update subscription when plan changes or billing period renews
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  auth: ReturnType<typeof getAdminAuth>
) {
  const userId = subscription.metadata?.firebaseUserId

  if (!userId) {
    console.error('Missing firebaseUserId in subscription metadata:', subscription.id)
    return
  }

  // Determine plan from price ID
  const priceId = subscription.items.data[0]?.price.id
  const plan = getPlanFromPriceId(priceId)

  if (!plan) {
    console.error('Could not determine plan from price ID:', priceId)
    return
  }

  const subscriptionData: Subscription = {
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    plan: plan,
    status: mapStripeStatusToSubscriptionStatus(subscription.status),
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
  }

  await updateUserSubscription(userId, subscriptionData)

  // Update Firebase custom claims
  const userRecord = await auth.getUser(userId)
  const customClaims = userRecord.customClaims || {}
  await auth.setCustomUserClaims(userId, {
    ...customClaims,
    plan: plan,
    stripeSubscriptionId: subscription.id,
  })

  console.log(`Subscription updated for user ${userId}: ${plan}`)
}

/**
 * Handle customer.subscription.deleted event
 * Downgrade to base plan when subscription is cancelled
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  auth: ReturnType<typeof getAdminAuth>
) {
  const userId = subscription.metadata?.firebaseUserId

  if (!userId) {
    console.error('Missing firebaseUserId in subscription metadata:', subscription.id)
    return
  }

  // Downgrade to base plan
  const subscriptionData: Subscription = {
    plan: 'base',
    status: 'canceled',
  }

  await updateUserSubscription(userId, subscriptionData)

  // Update Firebase custom claims
  const userRecord = await auth.getUser(userId)
  const customClaims = userRecord.customClaims || {}
  await auth.setCustomUserClaims(userId, {
    ...customClaims,
    plan: 'base',
    stripeSubscriptionId: null,
  })

  console.log(`Subscription cancelled for user ${userId}, downgraded to base plan`)
}

/**
 * Handle invoice.payment_failed event
 * Update subscription status when payment fails
 */
async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  auth: ReturnType<typeof getAdminAuth>
) {
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) {
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.firebaseUserId

  if (!userId) {
    console.error('Missing firebaseUserId in subscription metadata:', subscriptionId)
    return
  }

  // Update subscription status to past_due
  const db = getAdminFirestore()
  const userRef = db.collection('users').doc(userId)
  const userDoc = await userRef.get()
  
  if (userDoc.exists) {
    const data = userDoc.data()
    if (data?.subscription) {
      const subscriptionData: Subscription = {
        ...data.subscription,
        status: 'past_due',
      }
      await userRef.update({ subscription: subscriptionData })
    }
  }

  console.log(`Payment failed for user ${userId}, subscription ${subscriptionId}`)
}

/**
 * Map Stripe subscription status to our SubscriptionStatus type
 */
function mapStripeStatusToSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): Subscription['status'] {
  const statusMap: Record<Stripe.Subscription.Status, Subscription['status']> = {
    active: 'active',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    past_due: 'past_due',
    trialing: 'trialing',
    unpaid: 'canceled', // Map unpaid to canceled
    paused: 'canceled', // Map paused to canceled
  }

  return statusMap[stripeStatus] || 'canceled'
}

/**
 * Update user subscription in Firestore (server-side)
 * Stores subscription under settings.subscription to match frontend structure
 */
async function updateUserSubscription(userId: string, subscription: Subscription): Promise<void> {
  const db = getAdminFirestore()
  const userRef = db.collection('users').doc(userId)
  // Update subscription under settings.subscription to match getUserSettings structure
  await userRef.set({ 
    settings: { 
      subscription 
    } 
  }, { merge: true })
}

/**
 * Get plan from Stripe Price ID
 * This needs to match your STRIPE_PRICE_IDS configuration
 */
function getPlanFromPriceId(priceId: string): Plan | null {
  const { STRIPE_PRICE_IDS } = require('@/lib/stripe/config')
  
  for (const [plan, prices] of Object.entries(STRIPE_PRICE_IDS)) {
    if (prices.monthly === priceId || prices.yearly === priceId) {
      return plan as Plan
    }
  }
  
  return null
}
