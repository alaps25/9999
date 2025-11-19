import React from 'react'
import { cn } from '@/lib/utils'
import styles from './MainContent.module.scss'

export interface MainContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * MainContent component - Right content area
 * Provides proper spacing and layout for content
 */
export const MainContent: React.FC<MainContentProps> = ({
  children,
  className,
}) => {
  return (
    <main className={cn(styles.mainContent, className)}>
      <div className={styles.container}>{children}</div>
    </main>
  )
}

