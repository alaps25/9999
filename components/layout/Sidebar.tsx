'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { AddButton } from '@/components/ui/AddButton'
import type { MenuItem } from '@/lib/firebase/types'
import styles from './Sidebar.module.scss'

export interface SidebarProps {
  menuItems: (MenuItem | { id: string; label: React.ReactNode; href?: string; isActive?: boolean })[]
  className?: string
  onAddItem?: () => void
}

/**
 * Sidebar component - Left navigation menu
 * Displays menu items with active state highlighting using Button components
 */
export const Sidebar: React.FC<SidebarProps> = ({ menuItems, className, onAddItem }) => {
  const pathname = usePathname()

  return (
    <aside className={cn(styles.sidebar, className)}>
      {/* Menu Items */}
      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = item.isActive || pathname === item.href
          
          return (
            <Button
              key={item.id}
                      variant={isActive ? 'high' : 'low'}
              href={item.href || '#'}
              asLink
              stacked
              className={styles.menuButton}
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
      </nav>
    </aside>
  )
}

