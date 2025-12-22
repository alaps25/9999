'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Typography } from '@/components/ui/Typography'
import styles from './page.module.scss'

export default function Home() {
  const { user, userData, loading, signInWithGoogle, sendMagicLink } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSendingLink, setIsSendingLink] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect to user page if authenticated
  useEffect(() => {
    if (!loading && user && userData) {
      router.push(`/${userData.username}`)
    }
  }, [user, userData, loading, router])

  // Show loading state
  if (loading) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  // If authenticated, don't show login page (will redirect)
  if (user && userData) {
    return null
  }

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      await signInWithGoogle()
      // Redirect will happen via useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google')
    }
  }

  // Handle email magic link
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    try {
      setIsSendingLink(true)
      setError(null)
      await sendMagicLink(email.trim())
      setLinkSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send login link')
    } finally {
      setIsSendingLink(false)
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCardsContainer}>
        {/* First Box: Big Text */}
        <div className={styles.loginCard}>
          <div className={styles.loginTitle}>Create pages real fast, nothing else!</div>
        </div>

        {/* Second Box: Login Content */}
        <div className={styles.loginCard}>
          {/* First Group: "Start by logging in" + Google Button */}
          <div className={styles.loginGroup}>
            <Typography variant="h3">
              Single with single click
            </Typography>

            <Button
              variant="medium"
              size="md"
              onClick={handleGoogleSignIn}
            >
              LOG IN WITH GOOGLE
            </Button>
          </div>

          {/* Second Group: "Or" + Email Form */}
          <div className={styles.loginGroup}>
            <Typography variant="h3" >
              Login with email
            </Typography>

            {/* Email Form */}
            <form onSubmit={handleSendMagicLink} className={styles.loginForm}>
              <Input
                type="email"
                placeholder="YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                inputSize="md"
                disabled={isSendingLink || linkSent}
              />

              <Button
                type="submit"
                variant="medium"
                size="md"
                disabled={isSendingLink || linkSent}
              >
                {isSendingLink ? 'SENDING...' : 'SEND LINK'}
              </Button>

              {/* Success Message */}
              {linkSent && (
                <div className={styles.loginSuccess}>
                  ✨ Check your email! We sent you a login link.
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className={styles.loginError}>
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
