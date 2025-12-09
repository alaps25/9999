'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './Dropdown.module.scss'
import buttonStyles from './Button.module.scss'

export interface DropdownOption {
  label: string
  value: string
  onClick?: () => void
  disabled?: boolean
}

export interface DropdownProps {
  options: DropdownOption[]
  value?: string
  placeholder?: string
  variant?: 'high' | 'medium' | 'low'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onSelect?: (value: string) => void
  disabled?: boolean
  alwaysShowPlaceholder?: boolean // If true, always show placeholder instead of selected value
}

/**
 * Dropdown component - Inspired by Button design
 * Uses the same design system (outline, colors, typography) as Button
 */
export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select...',
  variant = 'low',
  size = 'md',
  className,
  onSelect,
  disabled = false,
  alwaysShowPlaceholder = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value)
  const [menuPosition, setMenuPosition] = useState<'below' | 'above'>('below')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // Calculate menu position based on available space
  useEffect(() => {
    if (isOpen && dropdownRef.current && menuRef.current) {
      const triggerRect = dropdownRef.current.getBoundingClientRect()
      const menuHeight = menuRef.current.offsetHeight || 200 // Estimate if not rendered yet
      const spaceBelow = window.innerHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top
      
      // If not enough space below but enough above, position above
      if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
        setMenuPosition('above')
      } else {
        setMenuPosition('below')
      }
    }
  }, [isOpen])

  const selectedOption = options.find(opt => opt.value === selectedValue)
  const displayLabel = alwaysShowPlaceholder ? placeholder : (selectedOption?.label || placeholder)

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return
    
    setSelectedValue(option.value)
    setIsOpen(false)
    
    if (option.onClick) {
      option.onClick()
    }
    
    if (onSelect) {
      onSelect(option.value)
    }
  }

  const triggerClasses = cn(
    buttonStyles.button, // Use Button base styles
    buttonStyles[variant], // Use Button variant styles
    buttonStyles[size], // Use Button size styles
    styles.trigger, // Dropdown-specific overrides
    isOpen && styles.open,
    disabled && buttonStyles.disabled,
    className
  )

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        type="button"
        className={triggerClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.label}>{displayLabel}</span>
        <ChevronDown 
          size={16} 
          className={cn(styles.icon, isOpen && styles.iconOpen)}
        />
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          className={cn(styles.menu, menuPosition === 'above' && styles.menuAbove)}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                styles.menuItem,
                selectedValue === option.value && styles.menuItemSelected,
                option.disabled && styles.menuItemDisabled
              )}
              onClick={() => handleSelect(option)}
              disabled={option.disabled}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

