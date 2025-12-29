import React from 'react'
import { cn } from '@/lib/utils'
import styles from './Input.module.scss'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default'
  inputSize?: 'sm' | 'md' | 'lg' // Renamed to avoid conflict with HTMLInputElement.size
  fullWidth?: boolean
  error?: boolean
  leftIcon?: React.ReactNode // Icon to display on the left side
  rightIcon?: React.ReactNode // Icon to display on the right side (clickable)
  onRightIconClick?: () => void // Handler for right icon click
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
  leftIcon,
  rightIcon,
  onRightIconClick,
  className,
  ...props
}, ref) => {
  const inputClasses = cn(
    styles.input,
    styles[variant],
    styles[inputSize],
    fullWidth && styles.fullWidth,
    error && styles.error,
    leftIcon && styles.withLeftIcon,
    rightIcon && styles.withRightIcon,
    className
  )

  if (leftIcon || rightIcon) {
    return (
      <div className={styles.inputWrapper}>
        {leftIcon && <div className={styles.leftIcon}>{leftIcon}</div>}
        <input
          ref={ref}
          type={props.type || 'text'}
          className={inputClasses}
          {...props}
        />
        {rightIcon && (
          <div 
            className={styles.rightIcon}
            onClick={onRightIconClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onRightIconClick?.()
              }
            }}
          >
            {rightIcon}
          </div>
        )}
      </div>
    )
  }

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

