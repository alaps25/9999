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
import { Palette, Square, Sun, EyeOff, Eye, ArrowRight, Trash2, Hash, User, Check, AlertCircle } from 'lucide-react'
import { getMenuItems, getUserSettings } from '@/lib/firebase/queries'
import { saveUserSettings, updateUsername } from '@/lib/firebase/mutations'
import { getPortfolioUrl, shareUrl } from '@/lib/utils/share'
import { applyTheme, setupSystemThemeListener } from '@/lib/utils/theme'
import { hashPassword } from '@/lib/utils/password'
import { validateUsername, isUsernameAvailable } from '@/lib/utils/user'
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
        
        // Load current username from userData
        if (userData?.username) {
          setUsername(userData.username)
        }
        
        // Load settings from user profile
        if (settings) {
          const loadedAccentColor = settings.accentColor || '#000000'
          const loadedTheme = settings.theme || 'AUTO'
          
          setAccentColor(loadedAccentColor)
          setTheme(loadedTheme)
          
          // Apply theme (includes accent color and theme mode)
          applyTheme(loadedTheme as 'AUTO' | 'LIGHT' | 'DARK', loadedAccentColor)
          
          if (settings.roundedCorners) {
            // Cap at 48px when loading from settings
            const numValue = parseInt(settings.roundedCorners, 10)
            const cappedValue = isNaN(numValue) ? '0' : Math.min(Math.max(numValue, 0), 48).toString()
            setRoundedCorners(cappedValue)
            // Apply rounded corners globally
            document.documentElement.style.setProperty('--border-radius', `${cappedValue}px`)
          }
          // Set visibility - if PRIVATE but no password, default to PUBLIC
          const hasPassword = (settings.password && settings.password.trim() !== '') || 
                             (settings.passwordHash && settings.passwordHash.trim() !== '')
          
          if (settings.visibility === 'PRIVATE' && !hasPassword) {
            setVisibility('PUBLIC')
            setHasExistingPassword(false)
            setPassword('')
          } else {
            setVisibility(settings.visibility || 'PUBLIC')
            
            // Load existing password if it exists (for PRIVATE visibility)
            if (settings.visibility === 'PRIVATE' && hasPassword) {
              setHasExistingPassword(true)
              // Load plaintext password if available, otherwise leave empty (user can't see hashed version)
              if (settings.password && settings.password.trim() !== '') {
                setPassword(settings.password)
              } else {
                // Old hashed password exists but no plaintext - user needs to set new password
                setPassword('')
              }
            } else {
              setHasExistingPassword(false)
              setPassword('')
            }
          }
        } else {
          // Initialize from CSS custom property if no saved settings
          const currentColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent-primary')
            .trim() || '#000000'
          setAccentColor(currentColor)
          // Apply default theme
          applyTheme('AUTO', currentColor)
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
  const [visibility, setVisibility] = React.useState('PUBLIC')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [hasExistingPassword, setHasExistingPassword] = React.useState(false)
  const [username, setUsername] = React.useState('')
  const [usernameAvailability, setUsernameAvailability] = React.useState<'checking' | 'available' | 'unavailable' | null>(null)
  const [usernameError, setUsernameError] = React.useState<string | null>(null)
  const [saveError, setSaveError] = React.useState<string | null>(null)

  // Ref for the hidden color input
  const colorInputRef = React.useRef<HTMLInputElement>(null)
  
  // Handle color swatch click to open color picker
  const handleColorSwatchClick = () => {
    colorInputRef.current?.click()
  }
  
  // Handle color picker change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccentColor(e.target.value)
  }
  
  // Handle hex input change - ensure # is always present and non-removable
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Remove any existing # signs (user can't type #)
    value = value.replace(/#/g, '')
    
    // Only allow valid hex characters
    value = value.replace(/[^0-9A-Fa-f]/g, '')
    
    // Limit to 6 hex characters
    value = value.slice(0, 6)
    
    // Always add # prefix (even if empty, ensures # is always present)
    setAccentColor('#' + value)
  }
  
  // Get hex value without # for display in input
  const getHexValue = () => {
    return accentColor.replace(/^#/, '') || '000000'
  }
  
  // Handle rounded corners input change - cap at 48px max
  const handleRoundedCornersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Remove any non-numeric characters
    value = value.replace(/[^0-9]/g, '')
    
    // Convert to number and cap at 48
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue)) {
      const cappedValue = Math.min(numValue, 48)
      setRoundedCorners(cappedValue.toString())
    } else if (value === '') {
      // Allow empty input for better UX
      setRoundedCorners('')
    }
  }
  
  // Get capped rounded corners value (for display and application)
  const getCappedRoundedCorners = () => {
    const numValue = parseInt(roundedCorners, 10)
    if (isNaN(numValue)) return '0'
    return Math.min(Math.max(numValue, 0), 48).toString()
  }

  // Debounced username availability check
  const usernameCheckTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  
  React.useEffect(() => {
    // Clear previous timeout
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current)
    }
    
    const trimmed = username.trim()
    
    // Don't check if username is empty or same as current
    if (!trimmed || trimmed === userData?.username) {
      setUsernameAvailability(null)
      setUsernameError(null)
      return
    }
    
    // Only check format immediately (for instant feedback on invalid characters)
    // But don't check availability until minimum length (3 chars) is met
    const validation = validateUsername(trimmed, user?.email)
    if (!validation.isValid) {
      // Only show format errors, don't check availability yet
      setUsernameAvailability(null)
      setUsernameError(validation.error || null)
      return
    }
    
    // Clear format errors if format is valid
    setUsernameError(null)
    
    // Only check availability if username meets minimum length requirement (3 chars)
    if (trimmed.length < 3) {
      setUsernameAvailability(null)
      return
    }
    
    // Set checking state only when we're about to check (after debounce)
    // Debounce the availability check (800ms) - longer delay for better UX
    usernameCheckTimeoutRef.current = setTimeout(async () => {
      if (!user?.uid) return
      
      // Set checking state right before the actual check
      setUsernameAvailability('checking')
      
      try {
        const available = await isUsernameAvailable(trimmed, user.uid)
        setUsernameAvailability(available ? 'available' : 'unavailable')
        if (!available) {
          setUsernameError('Username is already taken')
        } else {
          setUsernameError(null)
        }
      } catch (error) {
        console.error('Error checking username availability:', error)
        setUsernameAvailability('unavailable')
        setUsernameError('Error checking username availability')
      }
    }, 800)
    
    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current)
      }
    }
  }, [username, user?.uid, user?.email, userData?.username])

  // Handle username input change - force lowercase
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    setUsername(value)
    setSaveError(null) // Clear save error when user types
    // Focus is preserved automatically by React - no need to manually manage it
  }

  // Handle save - update accent color, theme, rounded corners, visibility/password, and username
  const handleSave = async () => {
    if (!user?.uid) {
      console.error('User not authenticated')
      return
    }

    // Clear previous save errors
    setSaveError(null)

    // Validate: if visibility is PRIVATE, password must be provided (unless one already exists)
    if (visibility === 'PRIVATE' && !password.trim() && !hasExistingPassword) {
      setSaveError('Please enter a password when setting visibility to PRIVATE')
      return
    }

    // Validate username if changed
    if (username.trim() && username !== userData?.username) {
      const validation = validateUsername(username, user?.email)
      if (!validation.isValid) {
        setSaveError(validation.error || 'Invalid username')
        return
      }
      
      // Check availability one more time before saving
      if (usernameAvailability !== 'available') {
        setSaveError('Please choose an available username')
        return
      }
    }

    try {
      // Update username if changed
      if (username.trim() && username !== userData?.username) {
        await updateUsername(user.uid, username.trim(), user?.email)
        // Refresh userData in AuthContext
        // We'll need to add a refresh function to AuthContext
      }
      // Cap rounded corners at 48px before saving
      const cappedRoundedCorners = getCappedRoundedCorners()
      
      // Apply theme (includes accent color and theme mode)
      applyTheme(theme as 'AUTO' | 'LIGHT' | 'DARK', accentColor)
      
      // Update border radius
      document.documentElement.style.setProperty('--border-radius', `${cappedRoundedCorners}px`)
      
      // Prepare settings object
      const settingsToSave: {
        accentColor: string
        roundedCorners: string
        theme: string
        visibility: string
        password?: string // Plaintext password for viewing/sharing
        passwordHash?: string // Hashed password for verification
      } = {
        accentColor,
        roundedCorners: cappedRoundedCorners,
        theme,
        visibility,
      }
      
      // Handle password - store in plaintext for viewing/sharing, also hash for verification
      if (visibility === 'PRIVATE') {
        if (password.trim()) {
          // User entered a new password - store both plaintext (for viewing) and hash (for verification)
          settingsToSave.password = password.trim()
          settingsToSave.passwordHash = await hashPassword(password.trim())
          setHasExistingPassword(true) // Update state after saving
        } else if (hasExistingPassword) {
          // User didn't enter password but one exists - keep existing password
          const currentSettings = await getUserSettings(user.uid)
          if (currentSettings?.password && currentSettings.password.trim() !== '') {
            settingsToSave.password = currentSettings.password
            // Also keep hash if it exists, otherwise generate new one
            if (currentSettings?.passwordHash && currentSettings.passwordHash.trim() !== '') {
              settingsToSave.passwordHash = currentSettings.passwordHash
            } else {
              settingsToSave.passwordHash = await hashPassword(currentSettings.password)
            }
          }
        }
        // If no password and no existing password, validation above will prevent saving
      } else if (visibility === 'PUBLIC') {
        // If visibility is PUBLIC, explicitly clear password
        settingsToSave.password = ''
        settingsToSave.passwordHash = ''
        setHasExistingPassword(false) // Update state after saving
      }
      
      // Save settings to Firebase
      await saveUserSettings(user.uid, settingsToSave)
      
      // Reload settings to update hasExistingPassword state and keep password visible
      const updatedSettings = await getUserSettings(user.uid)
      if (updatedSettings?.visibility === 'PRIVATE') {
        const hasPassword = (updatedSettings.password && updatedSettings.password.trim() !== '') || 
                           (updatedSettings.passwordHash && updatedSettings.passwordHash.trim() !== '')
        if (hasPassword) {
          setHasExistingPassword(true)
          // Keep password visible if it was saved
          if (updatedSettings.password && updatedSettings.password.trim() !== '') {
            setPassword(updatedSettings.password)
          }
        } else {
          setHasExistingPassword(false)
          setPassword('')
        }
      } else {
        setHasExistingPassword(false)
        setPassword('')
      }
      
      console.log('Settings saved successfully')
      
      // If username was changed, reload page to update AuthContext and reflect new username everywhere
      if (username.trim() && username !== userData?.username) {
        window.location.reload()
        return // Exit early since we're reloading
      }
    } catch (error: any) {
      console.error('Error saving settings:', error)
      setSaveError(error.message || 'Failed to save settings. Please try again.')
    }
  }
  
  // Apply theme in real-time when accent color or theme changes
  React.useEffect(() => {
    applyTheme(theme as 'AUTO' | 'LIGHT' | 'DARK', accentColor)
    
    // Set up system preference listener for AUTO mode
    const cleanup = setupSystemThemeListener(
      theme as 'AUTO' | 'LIGHT' | 'DARK',
      accentColor
    )
    
    return cleanup
  }, [accentColor, theme])
  
  // Apply rounded corners in real-time when value changes (capped at 48px)
  React.useEffect(() => {
    const numValue = parseInt(roundedCorners, 10)
    if (isNaN(numValue)) {
      document.documentElement.style.setProperty('--border-radius', '0px')
      return
    }
    
    const cappedValue = Math.min(Math.max(numValue, 0), 48)
    document.documentElement.style.setProperty('--border-radius', `${cappedValue}px`)
    
    // If the value was capped, update the state to reflect the capped value
    if (numValue > 48) {
      setRoundedCorners('48')
    }
  }, [roundedCorners])

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
                <div 
                  className={styles.colorSwatch} 
                  style={{ backgroundColor: accentColor }}
                  onClick={handleColorSwatchClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleColorSwatchClick()
                    }
                  }}
                  aria-label="Click to open color picker"
                />
                {/* Hidden color input */}
                <input
                  ref={colorInputRef}
                  type="color"
                  value={accentColor}
                  onChange={handleColorChange}
                  className={styles.hiddenColorInput}
                  aria-label="Color picker"
                />
                <Input
                  type="text"
                  value={getHexValue()}
                  onChange={handleHexInputChange}
                  maxLength={6}
                  placeholder="000000"
                  leftIcon={<Hash size={12} />}
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
                  onChange={handleRoundedCornersChange}
                  placeholder="0"
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
                {visibility === 'PRIVATE' && (
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    rightIcon={showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    onRightIconClick={() => setShowPassword(!showPassword)}
                  />
                )}
              </div>

              {/* Username Setting */}
              <div className={styles.settingItem}>
                <Button variant="medium" size="md">
                  <User size={16} />
                  USERNAME
                </Button>
                <Input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={handleUsernameChange}
                  maxLength={20}
                  rightIcon={
                    username.trim() && username.trim().length >= 3 && username !== userData?.username ? (
                      usernameAvailability === 'checking' ? null : usernameAvailability === 'available' ? (
                        <Check size={12} style={{ color: 'var(--accent-primary)' }} />
                      ) : usernameAvailability === 'unavailable' ? (
                        <AlertCircle size={12} style={{ color: '#ff4444' }} />
                      ) : null
                    ) : null
                  }
                />
              </div>
            </div>

            {saveError && (
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: '#fee', 
                border: '1px solid #fcc',
                borderRadius: '4px',
                marginBottom: '1rem',
                color: '#c33',
                fontSize: '0.875rem'
              }}>
                {saveError}
              </div>
            )}

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

