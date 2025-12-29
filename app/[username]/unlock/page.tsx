'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Typography } from '@/components/ui/Typography'
import { Eye, EyeOff } from 'lucide-react'
import { getUserSettings } from '@/lib/firebase/queries'
import { verifyPassword } from '@/lib/utils/password'
import { createSession } from '@/lib/utils/session'
import { getUserIdByUsername } from '@/lib/utils/user'
import styles from './page.module.scss'

export default function UnlockPage() {
  const router = useRouter()
  const params = useParams()
  const username = params?.username as string
  
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [userId, setUserId] = React.useState<string | null>(null)

  // Get user ID from username
  React.useEffect(() => {
    async function loadUserData() {
      if (!username) return
      
      const uid = await getUserIdByUsername(username)
      if (uid) {
        setUserId(uid)
      }
    }
    
    loadUserData()
  }, [username])

  const handleUnlock = async () => {
    if (!userId || !password.trim()) {
      setError('Please enter a password')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get user settings to verify password
      const settings = await getUserSettings(userId)
      
      // Check if page is private and has password protection
      if (!settings || settings.visibility !== 'PRIVATE') {
        setError('This page is not password protected')
        setLoading(false)
        return
      }
      
      // Check if password exists (either plaintext or hash)
      const hasPassword = (settings.password && settings.password.trim() !== '') || 
                         (settings.passwordHash && settings.passwordHash.trim() !== '')
      
      if (!hasPassword) {
        setError('This page is not password protected')
        setLoading(false)
        return
      }

      // Verify password - prefer plaintext comparison, fallback to hash verification
      let isValid = false
      if (settings.password && settings.password.trim() !== '') {
        // Compare plaintext passwords
        isValid = password.trim() === settings.password.trim()
      } else if (settings.passwordHash && settings.passwordHash.trim() !== '') {
        // Fallback to hash verification for old passwords
        isValid = await verifyPassword(password.trim(), settings.passwordHash)
      }
      
      if (isValid) {
        // Create session
        createSession(userId)
        
        // Redirect to the page they were trying to access
        const searchParams = new URLSearchParams(window.location.search)
        const redirect = searchParams.get('redirect') || `/${username}/page`
        router.push(redirect)
      } else {
        setError('Incorrect password')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error unlocking page:', error)
      setError('Failed to unlock page. Please try again.')
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUnlock()
    }
  }

  return (
    <div className={styles.unlockPage}>
      <div className={styles.unlockCard}>
        <div className={styles.usernameSection}>
          <Typography variant="body" className={styles.username}>
            {username || 'username'}
          </Typography>
        </div>
        
        <div className={styles.unlockSection}>
          <Typography variant="body" className={styles.lockedText}>
            I'm locked
          </Typography>
          
          <div className={styles.passwordRow}>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null) // Clear error when user types
              }}
              onKeyPress={handleKeyPress}
              rightIcon={showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
              onRightIconClick={() => setShowPassword(!showPassword)}
              fullWidth
              error={!!error}
            />
            <Button
              variant="medium"
              size="md"
              onClick={handleUnlock}
              disabled={loading || !password.trim()}
            >
              UNLOCK
            </Button>
          </div>
          
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

