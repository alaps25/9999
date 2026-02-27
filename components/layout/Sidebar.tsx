'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/lib/hooks/useIsMobile'
import { Button } from '@/components/ui/Button'
import { AddButton } from '@/components/ui/AddButton'
import { Menu, X } from 'lucide-react'
import type { MenuItem } from '@/lib/firebase/types'
import styles from './Sidebar.module.scss'

export interface SidebarProps {
  menuItems: (MenuItem | { id: string; label: React.ReactNode; href?: string; isActive?: boolean; onClick?: () => void })[]
  secondaryMenuItems?: (MenuItem | { id: string; label: React.ReactNode; href?: string; isActive?: boolean; onClick?: () => void })[]
  className?: string
  onAddItem?: () => void
  mobileMenuOpen?: boolean
  onMobileMenuToggle?: (isOpen: boolean) => void
}

/**
 * Sidebar component - Left navigation menu
 * Displays menu items with active state highlighting using Button components
 * Supports primary menu items and secondary menu items with a gap between them
 * On mobile, renders drawer menu (controlled by parent via mobileMenuOpen prop)
 */
export const Sidebar: React.FC<SidebarProps> = ({ 
  menuItems, 
  secondaryMenuItems, 
  className, 
  onAddItem,
  mobileMenuOpen = false,
  onMobileMenuToggle
}) => {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  // Close menu when route changes
  useEffect(() => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle(false)
    }
  }, [pathname, onMobileMenuToggle])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen, isMobile])

  const handleItemClick = (callback?: () => void) => {
    if (callback) {
      callback()
    }
    if (isMobile && onMobileMenuToggle) {
      onMobileMenuToggle(false)
    }
  }

  const navContent = (
    <nav className={styles.nav}>
      {menuItems.map((item) => {
        const isActive = item.isActive !== undefined ? item.isActive : pathname === item.href
        
        return (
          <Button
            key={item.id}
            variant={isActive ? 'high' : 'low'}
            href={item.href || '#'}
            asLink
            stacked
            className={styles.menuButton}
            onClick={() => handleItemClick()}
          >
            {typeof item.label === 'string' ? item.label : item.label}
          </Button>
        )
      })}
      {onAddItem && (
        <AddButton
          onClick={onAddItem}
          label="Add Page"
          size="md"
          stacked
          className={styles.addMenuItemButton}
        />
      )}
      {secondaryMenuItems && secondaryMenuItems.length > 0 && (
        <>
          <div className={styles.menuGap} />
          {secondaryMenuItems.map((item) => {
            const isActive = item.isActive !== undefined ? item.isActive : pathname === item.href
            
            if ('onClick' in item && item.onClick) {
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'high' : 'low'}
                  onClick={(e) => {
                    e.preventDefault()
                    handleItemClick(item.onClick)
                  }}
                  stacked
                  className={styles.menuButton}
                >
                  {typeof item.label === 'string' ? item.label : item.label}
                </Button>
              )
            }
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'high' : 'low'}
                href={item.href || '#'}
                asLink
                stacked
                className={styles.menuButton}
                onClick={() => handleItemClick()}
              >
                {typeof item.label === 'string' ? item.label : item.label}
              </Button>
            )
          })}
        </>
      )}
    </nav>
  )

  // Mobile: render nothing - menu is rendered by MobileMenuButton
  if (isMobile) {
    return null
  }

  // Desktop sidebar
  return (
    <aside className={cn(styles.sidebar, className)}>
      {navContent}
    </aside>
  )
}

/**
 * Mobile menu button component with staggered dropdown
 * Menu items fly out one by one from under the hamburger button
 */
export interface MobileMenuButtonProps {
  isOpen: boolean
  onToggle: () => void
  menuItems: (MenuItem | { id: string; label: React.ReactNode; href?: string; isActive?: boolean; onClick?: () => void })[]
  secondaryMenuItems?: (MenuItem | { id: string; label: React.ReactNode; href?: string; isActive?: boolean; onClick?: () => void })[]
  className?: string
}

export const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ 
  isOpen, 
  onToggle,
  menuItems,
  secondaryMenuItems,
  className 
}) => {
  const pathname = usePathname()

  // Close menu on route change
  React.useEffect(() => {
    if (isOpen) onToggle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Prevent body scroll when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const allItems = [
    ...menuItems,
    ...(secondaryMenuItems || [])
  ]

  const handleItemClick = (callback?: () => void) => {
    if (callback) callback()
    onToggle()
  }

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: -5,
      scale: 0.95,
      transition: {
        duration: 0.15
      }
    }
  }

  return (
    <div className={styles.mobileMenuWrapper}>
      <button
        className={cn(styles.hamburgerButton, className)}
        onClick={onToggle}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Blur overlay */}
            <motion.div 
              className={styles.blurOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onToggle}
            />
            
            {/* Staggered menu items */}
            <motion.nav
              className={styles.mobileDropdown}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {menuItems.map((item, index) => {
                const isActive = item.isActive !== undefined ? item.isActive : pathname === item.href
                
                return (
                  <motion.div key={item.id} variants={itemVariants}>
                    <Button
                      variant={isActive ? 'high' : 'medium'}
                      href={item.href || '#'}
                      asLink
                      stacked
                      className={styles.mobileMenuItem}
                      onClick={() => handleItemClick()}
                    >
                      {typeof item.label === 'string' ? item.label : item.label}
                    </Button>
                  </motion.div>
                )
              })}
              
              {secondaryMenuItems && secondaryMenuItems.length > 0 && (
                <>
                  <motion.div 
                    className={styles.menuDivider} 
                    variants={itemVariants}
                  />
                  {secondaryMenuItems.map((item) => {
                    const isActive = item.isActive !== undefined ? item.isActive : pathname === item.href
                    
                    if ('onClick' in item && item.onClick) {
                      return (
                        <motion.div key={item.id} variants={itemVariants}>
                          <Button
                            variant={isActive ? 'high' : 'medium'}
                            onClick={(e) => {
                              e.preventDefault()
                              handleItemClick(item.onClick)
                            }}
                            stacked
                            className={styles.mobileMenuItem}
                          >
                            {typeof item.label === 'string' ? item.label : item.label}
                          </Button>
                        </motion.div>
                      )
                    }
                    
                    return (
                      <motion.div key={item.id} variants={itemVariants}>
                        <Button
                          variant={isActive ? 'high' : 'medium'}
                          href={item.href || '#'}
                          asLink
                          stacked
                          className={styles.mobileMenuItem}
                          onClick={() => handleItemClick()}
                        >
                          {typeof item.label === 'string' ? item.label : item.label}
                        </Button>
                      </motion.div>
                    )
                  })}
                </>
              )}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

