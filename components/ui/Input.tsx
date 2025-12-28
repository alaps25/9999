import React from 'react'
import { cn } from '@/lib/utils'
import styles from './Input.module.scss'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default'
  inputSize?: 'sm' | 'md' | 'lg' // Renamed to avoid conflict with HTMLInputElement.size
  fullWidth?: boolean
  error?: boolean
}

/**
 * Input component - Reuses button styles with custom border opacity
 * Top, right, left borders: 30% opacity
 * Bottom border: 100% opacity
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  inputSize = 'md',
  fullWidth = false,
  error = false,
  className,
  ...props
}, ref) => {
  const inputClasses = cn(
    styles.input,
    styles[variant],
    styles[inputSize],
    fullWidth && styles.fullWidth,
    error && styles.error,
    className
  )

  return (
    <input
      ref={ref}
      type={props.type || 'text'}
      className={inputClasses}
      {...props}
    />
  )
})

Input.displayName = 'Input'

