'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dropdown } from '@/components/ui/Dropdown'
import { Typography } from '@/components/ui/Typography'
import { Palette, Square, Sun, EyeOff, ArrowRight, Trash2 } from 'lucide-react'
import { getMenuItems, getUserSettings } from '@/lib/firebase/queries'
import { saveUserSettings } from '@/lib/firebase/mutations'
import { getPortfolioUrl, shareUrl } from '@/lib/utils/share'
import styles from './page.module.scss'
import type { MenuItem } from '@/lib/firebase/types'

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, userData, signOut, deleteAccount } = useAuth()
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [reauthMessage, setReauthMessage] = React.useState<string | null>(null)

  // Check if we're handling email link re-authentication
  React.useEffect(() => {
    if (searchParams.get('reauth') === 'true') {
      setReauthMessage('Re-authentication successful. You can now delete your account.')
      // Remove the query parameter from URL
      router.replace('/settings')
    }
  }, [searchParams, router])

  React.useEffect(() => {
    async function loadData() {
      if (!user || !userData) {
        setLoading(false)
        return
      }
      try {
        const [items, settings] = await Promise.all([
          getMenuItems(user.uid), // Only get menu items for this user
          getUserSettings(user.uid)
        ])
        setMenuItems(items)
        
        // Load settings from user profile
        if (settings) {
          if (settings.accentColor) {
            setAccentColor(settings.accentColor)
            // Apply accent color globally
            document.documentElement.style.setProperty('--accent-primary', settings.accentColor)
          }
          if (settings.roundedCorners) {
            setRoundedCorners(settings.roundedCorners)
          }
          if (settings.theme) {
            setTheme(settings.theme)
          }
          if (settings.visibility) {
            setVisibility(settings.visibility)
          }
        } else {
          // Initialize from CSS custom property if no saved settings
          const currentColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent-primary')
            .trim() || '#000000'
          setAccentColor(currentColor)
        }
      } catch (error) {
        console.error('Error loading portfolio data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user, userData])

  // Settings state
  const [accentColor, setAccentColor] = React.useState('#000000')
  const [roundedCorners, setRoundedCorners] = React.useState('0')
  const [theme, setTheme] = React.useState('AUTO')
  const [visibility, setVisibility] = React.useState('PRIVATE')
  const [password, setPassword] = React.useState('')

  // Handle save - update accent color across the interface and save to Firebase
  const handleSave = async () => {
    if (!user?.uid) {
      console.error('User not authenticated')
      return
    }

    try {
      // Update CSS custom property for accent color (applies immediately)
      document.documentElement.style.setProperty('--accent-primary', accentColor)
      
      // Save settings to Firebase
      await saveUserSettings(user.uid, {
        accentColor,
        roundedCorners,
        theme,
        visibility,
      })
      
      console.log('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const themeOptions = [
    { label: 'AUTO', value: 'AUTO' },
    { label: 'LIGHT', value: 'LIGHT' },
    { label: 'DARK', value: 'DARK' },
  ]

  const visibilityOptions = [
    { label: 'PRIVATE', value: 'PRIVATE' },
    { label: 'PUBLIC', value: 'PUBLIC' },
  ]

  const handleShareClick = async () => {
    if (!userData?.username) return
    const portfolioUrl = getPortfolioUrl(userData.username)
    await shareUrl(portfolioUrl, `Check out ${userData.username}'s portfolio`)
  }

  const handleLogOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Failed to sign out. Please try again.')
    }
  }

  const handleDeleteAccount = async () => {
    // Double confirmation
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This will permanently delete:\n\n' +
      '• All your pages\n' +
      '• All your projects\n' +
      '• All your images\n' +
      '• Your account settings\n\n' +
      'This action cannot be undone. Type DELETE to confirm.'
    )

    if (!confirmed) return

    const finalConfirmation = window.prompt(
      'This will permanently delete your account and all data. Type "DELETE" to confirm:'
    )

    if (finalConfirmation !== 'DELETE') {
      return
    }

    setIsDeleting(true)
    try {
      await deleteAccount()
      // Redirect to home page after account deletion
      router.push('/')
    } catch (error: any) {
      console.error('Error deleting account:', error)
      
      if (error.message === 'REAUTH_REQUIRED_EMAIL') {
        // User needs to check their email for re-authentication link
        setReauthMessage(
          'A re-authentication email has been sent to your email address. ' +
          'Please click the link in the email to confirm your identity, then try deleting your account again.'
        )
        setIsDeleting(false)
      } else if (error.code === 'auth/requires-recent-login') {
        // For Google users, show a message that they need to sign in again
        alert(
          'For security, you need to sign in again before deleting your account. ' +
          'Please sign out and sign back in, then try again.'
        )
        setIsDeleting(false)
      } else {
        alert(`Failed to delete account: ${error.message || 'Please try again.'}`)
        setIsDeleting(false)
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  // Generate hrefs for menu items using username
  const menuItemsWithHrefs = menuItems.map(item => ({
    ...item,
    href: userData?.username ? `/${userData.username}/${item.slug || 'page'}` : '#',
  }))

  // Secondary menu items (SHARE and SETTINGS)
  const secondaryMenuItems = [
    { id: 'share', label: 'SHARE', onClick: handleShareClick },
    { id: 'settings', label: 'SETTINGS', href: '/settings', isActive: true },
  ]

  return (
    <div className={styles.page}>
      <Sidebar menuItems={menuItemsWithHrefs} secondaryMenuItems={secondaryMenuItems} />
      <MainContent>
        <div className={styles.settingsContainer}>
          {/* Settings Section */}
          <div className={styles.section}>
            <Typography variant="h1" className={styles.settingsTitle}>
              Settings
            </Typography>

            <div className={styles.settingsGroup}>
              {/* Accent Setting */}
              <div className={styles.settingItem}>
                <Button variant="medium" size="md">
                  <Palette size={16} />
                  ACCENT
                </Button>
                <div className={styles.colorSwatch} style={{ backgroundColor: accentColor }} />
                <Input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                />
              </div>

              {/* Rounded Corners Setting */}
              <div className={styles.settingItem}>
                <Button variant="medium" size="md">
                  <Square size={16} />
                  ROUNDED CORNERS
                </Button>
                <Input
                  type="text"
                  value={roundedCorners}
                  onChange={(e) => setRoundedCorners(e.target.value)}
                />
              </div>

              {/* Theme Setting */}
              <div className={styles.settingItem}>
                <Button variant="medium" size="md">
                  <Sun size={16} />
                  THEME
                </Button>
                <Dropdown
                  options={themeOptions}
                  value={theme}
                  onSelect={(value) => setTheme(value)}
                  variant="medium"
                  size="md"
                />
              </div>

              {/* Visibility Setting */}
              <div className={styles.settingItem}>
                <Button variant="medium" size="md">
                  <EyeOff size={16} />
                  VISIBILITY
                </Button>
                <Dropdown
                  options={visibilityOptions}
                  value={visibility}
                  onSelect={(value) => setVisibility(value)}
                  variant="medium"
                  size="md"
                />
                <Input
                  type="password"
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button variant="high" size="md" style={{ alignSelf: 'flex-start' }} onClick={handleSave}>
              SAVE
            </Button>
          </div>

          {/* Account Section */}
          <div className={styles.section}>
            <Typography variant="h2" className={styles.accountEmail}>
              {user?.email || 'user@email.com'}
            </Typography>
            {reauthMessage && (
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffc107',
                borderRadius: '4px',
                marginBottom: '1rem',
                color: '#856404'
              }}>
                {reauthMessage}
              </div>
            )}
            <Button 
              variant="medium" 
              size="md" 
              style={{ alignSelf: 'flex-start' }}
              onClick={handleLogOut}
            >
              LOG OUT
              <ArrowRight size={16} />
            </Button>
            <Button 
              variant="medium" 
              size="md" 
              style={{ alignSelf: 'flex-start' }}
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'DELETING...' : 'DELETE ACCOUNT'}
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </MainContent>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}

