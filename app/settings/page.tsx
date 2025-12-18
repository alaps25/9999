'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dropdown } from '@/components/ui/Dropdown'
import { Typography } from '@/components/ui/Typography'
import { Palette, Square, Sun, EyeOff, ArrowRight, Trash2 } from 'lucide-react'
import { getPortfolioData, getUserSettings } from '@/lib/firebase/queries'
import { saveUserSettings } from '@/lib/firebase/mutations'
import styles from './page.module.scss'
import type { PortfolioData } from '@/lib/firebase/types'

function SettingsContent() {
  const { user, userData } = useAuth()
  const [portfolioData, setPortfolioData] = React.useState<PortfolioData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (!user || !userData) {
        setLoading(false)
        return
      }
      try {
        const [data, settings] = await Promise.all([
          getPortfolioData(userData.username, user.uid),
          getUserSettings(user.uid)
        ])
        setPortfolioData(data)
        
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

  if (loading || !portfolioData) {
    return <div>Loading...</div>
  }

  // Secondary menu items (SHARE and SETTINGS)
  const secondaryMenuItems = [
    { id: 'share', label: 'SHARE', href: '/share' },
    { id: 'settings', label: 'SETTINGS', href: '/settings', isActive: true },
  ]

  return (
    <div className={styles.page}>
      <Sidebar menuItems={portfolioData.menuItems} secondaryMenuItems={secondaryMenuItems} />
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
            <Button variant="medium" size="md" style={{ alignSelf: 'flex-start' }}>
              LOG OUT
              <ArrowRight size={16} />
            </Button>
            <Button variant="medium" size="md" style={{ alignSelf: 'flex-start' }}>
              DELETE ACCOUNT
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

