import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import styles from './Button.module.scss'

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'href'> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  iconOnly?: boolean
  children: React.ReactNode
  href?: string
  asLink?: boolean
}

/**
 * Button component with design system variants
 * Supports primary, secondary, and outline styles
 * Can be used as a button or as a Link when href is provided
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconOnly = false,
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
    className
  )

  // If href is provided or asLink is true, render as Link
  if (href || asLink) {
    // Only pass safe props to Link
    const safeProps: any = {}
    if (props.onClick) safeProps.onClick = props.onClick
    
    return (
      <Link
        href={href || '#'}
        className={buttonClasses}
        {...safeProps}
      >
        {children}
      </Link>
    )
  }

  // Otherwise render as button
  return (
    <button
      type={type || 'button'}
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  )
}

