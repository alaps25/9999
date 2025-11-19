import React from 'react'
import { cn } from '@/lib/utils'
import styles from './Typography.module.scss'

export interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label'
  className?: string
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
}

/**
 * Typography component with consistent text styles
 * Follows design system typography scale
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  className,
  children,
  as,
  ...props
}) => {
  const defaultTags = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body: 'p',
    caption: 'span',
    label: 'label',
  }

  const Tag = as || (defaultTags[variant] as keyof JSX.IntrinsicElements)

  return (
    <Tag className={cn(styles.typography, styles[variant], className)} {...props}>
      {children}
    </Tag>
  )
}

