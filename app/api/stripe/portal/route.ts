import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { getAdminAuth } from '@/lib/firebase/admin'

/**
 * POST /api/stripe/portal
 * Creates a Stripe Customer Portal session for billing management
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize Firebase Admin Auth
    const auth = getAdminAuth()

    // Get request body
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      )
    }

    // Get user's Stripe customer ID
    const userRecord = await auth.getUser(userId)
    const customClaims = userRecord.customClaims || {}
    const customerId = customClaims.stripeCustomerId as string | undefined

    if (!customerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this user' },
        { status: 400 }
      )
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${request.headers.get('origin') || ''}/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
