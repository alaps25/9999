'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from './Button'

export interface AddButtonProps {
  onClick: () => void
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
  iconOnly?: boolean
}

/**
 * AddButton component - Uses existing Button component with Plus icon
 * No text, just icon - uses Button design system
 */
export const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  label,
  className,
  size = 'md',
  variant = 'outline',
  iconOnly = true,
}) => {
  // Icon size based on button size
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      iconOnly={iconOnly}
      className={className}
      aria-label={label || 'Add new item'}
      type="button"
    >
      <Plus size={iconSize} />
    </Button>
  )
}

