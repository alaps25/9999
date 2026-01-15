import type { MenuItem } from '@/lib/firebase/types'

/**
 * Get standard secondary menu items for logged-in users
 * Always includes SHARE, PRICING, ABOUT, and SETTINGS
 */
export function getSecondaryMenuItems(
  onShareClick: () => void,
  currentPath?: string
): (MenuItem | { id: string; label: React.ReactNode; href?: string; isActive?: boolean; onClick?: () => void })[] {
  // Use provided currentPath or get from window if available
  let pathname = currentPath
  if (typeof window !== 'undefined' && !pathname) {
    pathname = window.location.pathname
  }
  
  return [
    { id: 'share', label: 'SHARE', onClick: onShareClick },
    { 
      id: 'settings', 
      label: 'SETTINGS', 
      href: '/settings', 
      isActive: pathname === '/settings' 
    },
    { 
      id: 'pricing', 
      label: 'PRICING', 
      href: '/pricing', 
      isActive: pathname === '/pricing' 
    },
    { 
      id: 'about', 
      label: 'ABOUT', 
      href: '/about', 
      isActive: pathname === '/about' 
    },
  ]
}
