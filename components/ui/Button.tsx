import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import styles from './Button.module.scss'

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'href'> {
  variant?: 'high' | 'medium' | 'low'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  iconOnly?: boolean
  stacked?: boolean
  children: React.ReactNode
  href?: string
  asLink?: boolean
}

/**
 * Button component with design system variants
 * Supports high (filled), medium (bordered), and low (transparent) emphasis levels
 * Can be used as a button or as a Link when href is provided
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'high',
  size = 'md',
  fullWidth = false,
  iconOnly = false,
  stacked = false,
  className,
  children,
  href,
  asLink = false,
  type,
  ...props
}) => {
  const buttonClasses = cn(
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    iconOnly && styles.iconOnly,
    stacked && styles.stacked,
    className
  )

  if (href || asLink) {
    return (
      <Link href={href || '#'} className={buttonClasses} onClick={props.onClick as any}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type || 'button'} className={buttonClasses} {...props}>
      {children}
    </button>
  )
}

