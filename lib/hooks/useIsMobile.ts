'use client'

import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768

/**
 * Hook to detect if the current viewport is mobile size
 * Returns true if width < 768px
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check initial width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Set initial value
    checkMobile()

    // Listen for resize events
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return isMobile
}
